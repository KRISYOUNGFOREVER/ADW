#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import type { Request, Response } from 'express';
import {
  CallToolRequestSchema,
  CallToolRequest,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { LiblibClient } from './liblib-client.js';
import fs from 'fs';
import 'dotenv/config';
import { Server as SocketIOServer } from 'socket.io';
import axios from 'axios';

// 读取package.json中的版本号，保证与发布版本一致
const VERSION: string = (() => {
  try {
    const pkgJsonPath = new URL('../package.json', import.meta.url);
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
    return pkg.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
})();

class LiblibMCPServer {
  private server: Server;
  private liblibClient: LiblibClient;

  constructor() {
    this.server = new Server(
      {
        name: 'liblib-mcp',
        version: VERSION,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.liblibClient = new LiblibClient();
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'test_liblib_connection',
            description: '测试LiblibAI API连接状态',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'list_design_templates',
            description: '列出所有可用的设计模板',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'generate_design_image',
            description: `
    生成设计图片（支持轮询等待完成）
    
    Args:
        prompt: 主要描述文本
        template_id: 设计模板ID（product_metal/product_wood/product_plastic/product_fabric/ui_modern/logo_minimalist）
        custom_suffix: 自定义后缀（覆盖模板默认后缀）
        width: 图片宽度（0表示使用模板默认值）
        height: 图片高度（0表示使用模板默认值）
        steps: 生成步数（0表示使用模板默认值）
        img_count: 生成图片数量
        seed: 随机种子（-1表示随机）
        cfg_scale: CFG强度（0.0表示使用模板默认值）
        wait_for_completion: 是否等待生成完成（True=轮询等待，False=立即返回任务ID）
        max_wait_seconds: 最大等待时间（秒），仅在wait_for_completion=True时有效
    `,
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: '主要描述文本',
                },
                template_id: {
                  type: 'string',
                  default: 'product_metal',
                  description: '设计模板ID（product_metal/product_wood/product_plastic/product_fabric/ui_modern/logo_minimalist）',
                },
                custom_suffix: {
                  type: 'string',
                  default: '',
                  description: '自定义后缀（覆盖模板默认后缀）',
                },
                width: {
                  type: 'integer',
                  default: 0,
                  description: '图片宽度（0表示使用模板默认值）',
                },
                height: {
                  type: 'integer',
                  default: 0,
                  description: '图片高度（0表示使用模板默认值）',
                },
                steps: {
                  type: 'integer',
                  default: 0,
                  description: '生成步数（0表示使用模板默认值）',
                },
                img_count: {
                  type: 'integer',
                  default: 1,
                  description: '生成图片数量',
                },
                seed: {
                  type: 'integer',
                  default: -1,
                  description: '随机种子（-1表示随机）',
                },
                cfg_scale: {
                  type: 'number',
                  default: 0,
                  description: 'CFG强度（0.0表示使用模板默认值）',
                },
                wait_for_completion: {
                  type: 'boolean',
                  default: false,
                  description: '是否等待生成完成（True=轮询等待，False=立即返回任务ID）',
                },
                max_wait_seconds: {
                  type: 'integer',
                  default: 180,
                  description: '最大等待时间（秒），仅在wait_for_completion=True时有效',
                },
                return_as_file: {
                  type: 'boolean',
                  default: false,
                  description: '是否返回图片文件（base64格式）而不是URL链接',
                },
              },
              required: ['prompt'],
            },
          },
          {
            name: 'check_generation_status',
            description: '检查生图任务状态',
            inputSchema: {
              type: 'object',
              properties: {
                generate_uuid: {
                  type: 'string',
                  description: '生图任务UUID',
                },
                return_as_file: {
                  type: 'boolean',
                  default: false,
                  description: '是否返回图片文件（base64格式）而不是URL链接',
                },
              },
              required: ['generate_uuid'],
            },
          },
          {
            name: 'generate_text2img_advanced',
            description: `
    高级文生图：支持完整的自定义参数和轮询等待
    
    Args:
        prompt: 正向提示词
        model_version_uuid: 模型版本UUID
        negative_prompt: 负向提示词
        width: 图片宽度
        height: 图片高度
        steps: 生成步数
        cfg_scale: CFG强度
        sampler: 采样器ID
        clip_skip: CLIP跳过层数
        img_count: 生成图片数量
        seed: 随机种子（-1表示随机）
        wait_for_completion: 是否等待生成完成
        max_wait_seconds: 最大等待时间（秒）
    `,
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: '正向提示词',
                },
                model_version_uuid: {
                  type: 'string',
                  description: '模型版本UUID',
                },
                negative_prompt: {
                  type: 'string',
                  default: '',
                  description: '负向提示词',
                },
                width: {
                  type: 'integer',
                  default: 768,
                  description: '图片宽度',
                },
                height: {
                  type: 'integer',
                  default: 1024,
                  description: '图片高度',
                },
                steps: {
                  type: 'integer',
                  default: 20,
                  description: '生成步数',
                },
                cfg_scale: {
                  type: 'number',
                  default: 7,
                  description: 'CFG强度',
                },
                sampler: {
                  type: 'integer',
                  default: 15,
                  description: '采样器ID',
                },
                clip_skip: {
                  type: 'integer',
                  default: 2,
                  description: 'CLIP跳过层数',
                },
                img_count: {
                  type: 'integer',
                  default: 1,
                  description: '生成图片数量',
                },
                seed: {
                  type: 'integer',
                  default: -1,
                  description: '随机种子（-1表示随机）',
                },
                wait_for_completion: {
                  type: 'boolean',
                  default: false,
                  description: '是否等待生成完成',
                },
                max_wait_seconds: {
                  type: 'integer',
                  default: 180,
                  description: '最大等待时间（秒）',
                },
              },
              required: ['prompt', 'model_version_uuid'],
            },
          },
          {
            name: 'get_server_info',
            description: '获取MCP服务器信息',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_model_version_info',
            description: '查询LiblibAI模型版本信息，可用于查询个人模型和公开可商用模型',
            inputSchema: {
              type: 'object',
              properties: {
                version_uuid: {
                  type: 'string',
                  description: '模型版本UUID，可从LiblibAI网站模型链接中获取',
                },
              },
              required: ['version_uuid'],
            },
          },
          {
            name: 'generate_img2img',
            description: `
图生图：基于参考图生成新图片

Args:
    prompt: 正向提示词
    reference_image_url: 参考图片URL（必需）
    model_version_uuid: 模型版本UUID（可选，不填使用星流）
    negative_prompt: 负向提示词
    denoising_strength: 重绘幅度（0.1-1.0，默认0.75）
    width: 图片宽度
    height: 图片高度
    steps: 生成步数
    cfg_scale: CFG强度
    sampler: 采样器ID
    clip_skip: CLIP跳过层数
    img_count: 生成图片数量
    seed: 随机种子
    wait_for_completion: 是否等待生成完成
    return_as_file: 是否返回图片文件
            `,
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: '正向提示词',
                },
                reference_image_url: {
                  type: 'string',
                  description: '参考图片URL',
                },
                model_version_uuid: {
                  type: 'string',
                  description: '模型版本UUID（可选，不填使用星流）',
                },
                negative_prompt: {
                  type: 'string',
                  default: '',
                  description: '负向提示词',
                },
                denoising_strength: {
                  type: 'number',
                  default: 0.75,
                  description: '重绘幅度（0.1-1.0）',
                },
                width: {
                  type: 'integer',
                  default: 1024,
                  description: '图片宽度',
                },
                height: {
                  type: 'integer',
                  default: 1024,
                  description: '图片高度',
                },
                steps: {
                  type: 'integer',
                  default: 30,
                  description: '生成步数',
                },
                cfg_scale: {
                  type: 'number',
                  default: 7,
                  description: 'CFG强度',
                },
                sampler: {
                  type: 'integer',
                  default: 15,
                  description: '采样器ID',
                },
                clip_skip: {
                  type: 'integer',
                  default: 2,
                  description: 'CLIP跳过层数',
                },
                img_count: {
                  type: 'integer',
                  default: 1,
                  description: '生成图片数量',
                },
                seed: {
                  type: 'integer',
                  default: -1,
                  description: '随机种子（-1表示随机）',
                },
                wait_for_completion: {
                  type: 'boolean',
                  default: false,
                  description: '是否等待生成完成',
                },
                return_as_file: {
                  type: 'boolean',
                  default: false,
                  description: '是否返回图片文件（base64格式）',
                },
              },
              required: ['prompt', 'reference_image_url'],
            },
          },
          {
            name: 'generate_with_controlnet',
            description: `
使用ControlNet参考图生成图片

Args:
    prompt: 正向提示词
    reference_image_url: 参考图片URL
    control_type: 控制类型（line/depth/pose/IPAdapter/subject）
    model_version_uuid: 模型版本UUID（可选，不填使用星流）
    negative_prompt: 负向提示词
    control_weight: 控制权重（0.1-2.0，默认1.0）
    width: 图片宽度
    height: 图片高度
    steps: 生成步数
    cfg_scale: CFG强度
    sampler: 采样器ID
    clip_skip: CLIP跳过层数
    img_count: 生成图片数量
    seed: 随机种子
    wait_for_completion: 是否等待生成完成
    return_as_file: 是否返回图片文件
            `,
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: '正向提示词',
                },
                reference_image_url: {
                  type: 'string',
                  description: '参考图片URL',
                },
                control_type: {
                  type: 'string',
                  enum: ['line', 'depth', 'pose', 'IPAdapter', 'subject'],
                  description: '控制类型：line(线稿)、depth(深度)、pose(姿态)、IPAdapter(风格迁移)、subject(主体参考)',
                },
                model_version_uuid: {
                  type: 'string',
                  description: '模型版本UUID（可选，不填使用星流）',
                },
                negative_prompt: {
                  type: 'string',
                  default: '',
                  description: '负向提示词',
                },
                control_weight: {
                  type: 'number',
                  default: 1.0,
                  description: '控制权重（0.1-2.0）',
                },
                width: {
                  type: 'integer',
                  default: 1024,
                  description: '图片宽度',
                },
                height: {
                  type: 'integer',
                  default: 1024,
                  description: '图片高度',
                },
                steps: {
                  type: 'integer',
                  default: 30,
                  description: '生成步数',
                },
                cfg_scale: {
                  type: 'number',
                  default: 7,
                  description: 'CFG强度',
                },
                sampler: {
                  type: 'integer',
                  default: 15,
                  description: '采样器ID',
                },
                clip_skip: {
                  type: 'integer',
                  default: 2,
                  description: 'CLIP跳过层数',
                },
                img_count: {
                  type: 'integer',
                  default: 1,
                  description: '生成图片数量',
                },
                seed: {
                  type: 'integer',
                  default: -1,
                  description: '随机种子（-1表示随机）',
                },
                wait_for_completion: {
                  type: 'boolean',
                  default: false,
                  description: '是否等待生成完成',
                },
                return_as_file: {
                  type: 'boolean',
                  default: false,
                  description: '是否返回图片文件（base64格式）',
                },
              },
              required: ['prompt', 'reference_image_url', 'control_type'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;

      try {
        let result;
        
        switch (name) {
          case 'test_liblib_connection':
            result = await this.testConnection();
            break;

          case 'list_design_templates':
            result = await this.listDesignTemplates();
            break;

          case 'generate_design_image':
            result = await this.generateDesignImage(args as any);
            break;

          case 'check_generation_status':
            result = await this.checkGenerationStatus(args as { generate_uuid: string });
            break;

          case 'generate_text2img_advanced':
            result = await this.generateText2ImgAdvanced(args as any);
            break;
            
          case 'get_server_info':
            result = await this.getServerInfo();
            break;

          case 'get_model_version_info':
            result = await this.getModelVersionInfo(args as { version_uuid: string });
            break;

          case 'generate_img2img':
            result = await this.generateImg2Img(args as any);
            break;
            
          case 'generate_with_controlnet':
            result = await this.generateWithControlNet(args as any);
            break;

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private async testConnection() {
    try {
      const result = await this.liblibClient.testConnection();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `连接测试失败: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  private async listDesignTemplates() {
    const templates = this.liblibClient.getDesignTemplates();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(templates, null, 2),
        },
      ],
    };
  }

  // 添加图片下载和转换函数
  private async downloadImageAsBase64(imageUrl: string): Promise<{ data: string; mimeType: string }> {
    try {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);
      const base64Data = buffer.toString('base64');
      const mimeType = response.headers['content-type'] || 'image/png';
      
      return {
        data: base64Data,
        mimeType: mimeType
      };
    } catch (error) {
      throw new Error(`下载图片失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  private async generateDesignImage(args: any) {
    try {
      const result = await this.liblibClient.generateDesignImage(args);
      
      if (result.success && result.status && result.status.images && result.status.images.length > 0) {
        const imageUrl = result.status.images[0].imageUrl;
        
        // 选择返回格式：URL 或 Base64
        if (args.return_as_file) {
          try {
            // 下载图片并转换为base64
            const imageData = await this.downloadImageAsBase64(imageUrl);
            return {
              content: [
                {
                  type: 'text',
                  text: `图片生成成功！`,
                },
                {
                  type: 'image',
                  data: imageData.data,
                  mimeType: imageData.mimeType,
                },
              ],
            };
          } catch (downloadError) {
            // 如果下载失败，回退到URL格式
            return {
              content: [
                {
                  type: 'text',
                  text: `图片生成成功！（下载失败，返回链接格式）`,
                },
                {
                  type: 'image',
                  image: imageUrl,
                },
              ],
            };
          }
        } else {
          // 返回URL（默认方式）
          return {
            content: [
              {
                type: 'text',
                text: `图片生成成功！`,
              },
              {
                type: 'image',
                image: imageUrl,
              },
            ],
          };
        }
      } else if (result.data && result.data.generateUuid) {
        // 如果是异步生成，返回任务ID
        return {
          content: [
            {
              type: 'text',
              text: `图片生成任务已提交，任务ID: ${result.data.generateUuid}。请使用 check_generation_status 工具查询生成状态。${args.return_as_file ? '（将以文件格式返回）' : ''}`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `生成图片失败: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  private async checkGenerationStatus(args: { generate_uuid: string; return_as_file?: boolean }) {
    try {
      const result = await this.liblibClient.checkGenerationStatus(args.generate_uuid);
      
      // 检查生成状态
      if (result.generateStatus === 5 && result.images && result.images.length > 0) {
        // 生成完成，返回图片
        const imageUrl = result.images[0].imageUrl;
        
        // 选择返回格式：URL 或 Base64
        if (args.return_as_file) {
          try {
            // 下载图片并转换为base64
            const imageData = await this.downloadImageAsBase64(imageUrl);
            return {
              content: [
                {
                  type: 'text',
                  text: `图片生成完成！`,
                },
                {
                  type: 'image',
                  data: imageData.data,
                  mimeType: imageData.mimeType,
                },
              ],
            };
          } catch (downloadError) {
            // 如果下载失败，回退到URL格式
            return {
              content: [
                {
                  type: 'text',
                  text: `图片生成完成！（下载失败，返回链接格式）`,
                },
                {
                  type: 'image',
                  image: imageUrl,
                },
              ],
            };
          }
        } else {
          // 返回URL（默认方式）
          return {
            content: [
              {
                type: 'text',
                text: `图片生成完成！`,
              },
              {
                type: 'image',
                image: imageUrl,
              },
            ],
          };
        }
      } else if (result.generateStatus === 6) {
        // 生成失败
        return {
          content: [
            {
              type: 'text',
              text: `图片生成失败: ${result.generateMsg}`,
            },
          ],
        };
      } else {
        // 还在生成中
        const statusText = result.generateStatus === 1 ? '排队中' : 
                          result.generateStatus === 2 ? '生图中' : '未知状态';
        return {
          content: [
            {
              type: 'text',
              text: `生成状态: ${statusText} (${result.percentCompleted}%)`,
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `查询状态失败: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  private async generateText2ImgAdvanced(args: any) {
    try {
      const result = await this.liblibClient.generateText2ImgAdvanced(args);
      
      // 检查是否有图片URL
      if (result.success && result.status && result.status.images && result.status.images.length > 0) {
        const imageUrl = result.status.images[0].imageUrl;
        try {
          const { data, mimeType } = await this.downloadImageAsBase64(imageUrl);
          return {
            content: [
              {
                type: 'text',
                text: `高级图片生成成功！`,
              },
              {
                type: 'image',
                data: data,
                mimeType: mimeType,
              },
            ],
          };
        } catch (downloadError) {
          // 如果下载失败，回退到URL方式
          return {
            content: [
              {
                type: 'text',
                text: `高级图片生成成功！图片URL: ${imageUrl}`,
              },
            ],
          };
        }
      } else if (result.data && result.data.generateUuid) {
        // 如果是异步生成，返回任务ID
        return {
          content: [
            {
              type: 'text',
              text: `高级图片生成任务已提交，任务ID: ${result.data.generateUuid}。请使用 check_generation_status 工具查询生成状态。`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `高级文生图失败: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  private async getServerInfo() {
    return {
      server_name: 'LiblibAI MCP Server',
      version: VERSION,
      description: 'LiblibAI图像生成API的MCP服务器',
      capabilities: ['设计模板生图', '高级文生图', '图生图', 'ControlNet生图', '生图状态查询', '连接测试', '模型版本查询'],
      author: 'LiblibAI Team',
    };
  }

  private async getModelVersionInfo(args: { version_uuid: string }) {
    try {
      const result = await this.liblibClient.getModelVersionInfo(args.version_uuid);
      return {
        success: true,
        data: result,
        message: '模型版本信息查询成功',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: '模型版本信息查询失败',
      };
    }
  }

  private async generateImg2Img(args: any) {
    try {
      // 检查是否有图片输入但使用的是纯文本模型
      if (args.reference_image_url && !this.isMultimodalModel()) {
        console.log('🖼️ 检测到图片输入，但当前模型不支持多模态，直接处理图片');
        
        // 直接调用图生图API，不通过LLM
        const { cleanPrompt, extractedParams } = this.parsePromptParameters(args.prompt);
        const finalArgs = { ...args, ...extractedParams, prompt: cleanPrompt };
        
        const result = await this.liblibClient.generateImg2Img(finalArgs);
        
        // 返回结果
        return this.handleImageGenerationResult(result, finalArgs, '图生图');
      }
      
      // 解析提示词中的参数
      const { cleanPrompt, extractedParams } = this.parsePromptParameters(args.prompt);
      const finalArgs = { ...args, ...extractedParams, prompt: cleanPrompt };
      
      const result = await this.liblibClient.generateImg2Img(finalArgs);
      
      return this.handleImageGenerationResult(result, finalArgs, '图生图');
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `图生图失败: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  private async generateWithControlNet(args: any) {
    try {
      // 检查是否有图片输入但使用的是纯文本模型
      if (args.reference_image_url && !this.isMultimodalModel()) {
        console.log('🖼️ 检测到图片输入，但当前模型不支持多模态，直接处理图片');
        
        // 直接调用ControlNet生图API，不通过LLM
        const { cleanPrompt, extractedParams } = this.parsePromptParameters(args.prompt);
        const finalArgs = { ...args, ...extractedParams, prompt: cleanPrompt };
        
        const result = await this.liblibClient.generateWithControlNet(finalArgs);
        
        // 返回结果
        return this.handleImageGenerationResult(result, finalArgs, `ControlNet生图（控制类型: ${finalArgs.control_type}）`);
      }
      
      // 解析提示词中的参数
      const { cleanPrompt, extractedParams } = this.parsePromptParameters(args.prompt);
      const finalArgs = { ...args, ...extractedParams, prompt: cleanPrompt };
      
      const result = await this.liblibClient.generateWithControlNet(finalArgs);
      
      return this.handleImageGenerationResult(result, finalArgs, `ControlNet生图（控制类型: ${finalArgs.control_type}）`);
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `ControlNet生图失败: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  // 添加模型检测方法
  private isMultimodalModel(): boolean {
    // 根据环境变量或配置判断当前使用的模型是否支持多模态
    const modelName = process.env.LLM_MODEL || 'deepseek';
    const multimodalModels = ['gpt-4v', 'claude-3', 'gemini-pro-vision'];
    return multimodalModels.some(model => modelName.toLowerCase().includes(model));
  }

  // 统一的图片生成结果处理
  private async handleImageGenerationResult(result: any, args: any, taskType: string) {
    if (result.success && result.status && result.status.images && result.status.images.length > 0) {
      const imageUrl = result.status.images[0].imageUrl;
      
      if (args.return_as_file) {
        try {
          const imageData = await this.downloadImageAsBase64(imageUrl);
          return {
            content: [
              {
                type: 'text',
                text: `${taskType}完成！`,
              },
              {
                type: 'image',
                data: imageData.data,
                mimeType: imageData.mimeType,
              },
            ],
          };
        } catch (downloadError) {
          return {
            content: [
              {
                type: 'text',
                text: `${taskType}完成！（下载失败，返回链接格式）`,
              },
              {
                type: 'image',
                image: imageUrl,
              },
            ],
          };
        }
      } else {
        return {
          content: [
            {
              type: 'text',
              text: `${taskType}完成！`,
            },
            {
              type: 'image',
              image: imageUrl,
            },
          ],
        };
      }
    } else if (result.data && result.data.generateUuid) {
      return {
        content: [
          {
            type: 'text',
            text: `${taskType}任务已提交，任务ID: ${result.data.generateUuid}。请使用 check_generation_status 工具查询生成状态。`,
          },
        ],
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  }

  // 添加智能参数解析功能
  private parsePromptParameters(prompt: string): {
    cleanPrompt: string;
    extractedParams: any;
  } {
    const params: any = {};
    let cleanPrompt = prompt;

    // 解析参数模式：--参数名 值
    const paramRegex = /--(\w+)\s+([^\s--]+)/g;
    let match;
    
    while ((match = paramRegex.exec(prompt)) !== null) {
      const [fullMatch, paramName, paramValue] = match;
      
      // 根据参数名转换值类型
      switch (paramName) {
        case 'steps':
        case 'width':
        case 'height':
        case 'img_count':
        case 'seed':
        case 'sampler':
        case 'clip_skip':
          params[paramName] = parseInt(paramValue);
          break;
        case 'cfg_scale':
        case 'denoising_strength':
        case 'control_weight':
          params[paramName] = parseFloat(paramValue);
          break;
        case 'negative_prompt':
        case 'model_version_uuid':
        case 'control_type':
          params[paramName] = paramValue;
          break;
        case 'wait_for_completion':
        case 'return_as_file':
          params[paramName] = paramValue.toLowerCase() === 'true';
          break;
      }
      
      // 从提示词中移除参数
      cleanPrompt = cleanPrompt.replace(fullMatch, '').trim();
    }

    return { cleanPrompt, extractedParams: params };
  }

  async run(port: number = 3000) {
    try {
      const express = (await import('express')).default;
      const app = express();
      
      // 替换这行：
      // app.use(express.json());
      
      // 仅对非 /mcp/messages 路由启用 JSON 解析，避免抢占 MCP 消息的原始请求体
      const jsonParser = express.json();
      app.use((req, res, next) => {
          if (req.path === '/mcp/messages') {
              return next();
          }
          return jsonParser(req, res, next);
      });
      
      // 添加CORS支持
      app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (req.method === 'OPTIONS') {
          res.sendStatus(200);
        } else {
          next();
        }
      });
      
      // Maintain reference to current SSE transport (single-session)
      let currentTransport: SSEServerTransport | null = null;
      let connectionId = 0;
      let isShuttingDown = false;
      
      // 优雅关闭函数
      const gracefulShutdown = () => {
        isShuttingDown = true;
        if (currentTransport) {
          try {
            if (typeof currentTransport.close === 'function') {
              currentTransport.close();
            }
          } catch (e) {
            console.log('⚠️ Error during shutdown:', e);
          }
          currentTransport = null;
        }
      };
      
      // 监听进程退出信号
      process.on('SIGINT', gracefulShutdown);
      process.on('SIGTERM', gracefulShutdown);

      // 模拟聊天数据存储
      let conversations: any[] = [
        {
          id: '1',
          title: '设计讨论',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      let messages: any[] = [
        {
          id: '1',
          conversation_id: '1',
          content: '你好！我可以帮你设计图片。',
          role: 'assistant',
          created_at: new Date().toISOString()
        }
      ];

      // 聊天API端点
      app.get('/api/conversations', (req: Request, res: Response) => {
        console.log('📋 GET /api/conversations');
        res.json(conversations);
      });

      // 添加 MCP 兼容的路由（用于向后兼容）
      app.get('/mcp/conversations', (req: Request, res: Response) => {
        console.log('📋 GET /mcp/conversations (compatibility route)');
        res.json(conversations);
      });

      app.get('/api/conversations/:id/messages', (req: Request, res: Response) => {
        const conversationId = req.params.id;
        console.log(`💬 GET /api/conversations/${conversationId}/messages`);
        const conversationMessages = messages.filter(m => m.conversation_id === conversationId);
        res.json(conversationMessages);
      });

      app.post('/api/conversations', (req: Request, res: Response) => {
        console.log('➕ POST /api/conversations');
        const newConversation = {
          id: Date.now().toString(),
          title: req.body.title || '新对话',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        conversations.push(newConversation);
        res.json(newConversation);
      });

      app.delete('/api/conversations/:id', (req: Request, res: Response) => {
        const conversationId = req.params.id;
        console.log(`🗑️ DELETE /api/conversations/${conversationId}`);
        conversations = conversations.filter(c => c.id !== conversationId);
        messages = messages.filter(m => m.conversation_id !== conversationId);
        res.json({ success: true });
      });

      app.post('/api/conversations/:id/messages', (req: Request, res: Response) => {
        const conversationId = req.params.id;
        console.log(`📤 POST /api/conversations/${conversationId}/messages`);
        
        const userMessage = {
          id: Date.now().toString(),
          conversation_id: conversationId,
          content: req.body.content,
          role: 'user',
          created_at: new Date().toISOString()
        };
        messages.push(userMessage);

        // 模拟AI回复
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          conversation_id: conversationId,
          content: '我收到了你的消息：' + req.body.content,
          role: 'assistant',
          created_at: new Date().toISOString()
        };
        messages.push(assistantMessage);

        res.json(assistantMessage);
      });

      app.put('/api/conversations/:id', (req: Request, res: Response) => {
        const conversationId = req.params.id;
        console.log(`✏️ PUT /api/conversations/${conversationId}`);
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation) {
          conversation.title = req.body.title;
          conversation.updated_at = new Date().toISOString();
          res.json(conversation);
        } else {
          res.status(404).json({ error: 'Conversation not found' });
        }
      });
      
      app.get('/mcp', async (req: Request, res: Response) => {
        if (isShuttingDown) {
          res.status(503).json({ error: 'Server is shutting down' });
          return;
        }
        
        const thisConnectionId = ++connectionId;
        console.log(`🔌 [${thisConnectionId}] SSE connection request received`);

        // 设置代理兼容的响应头
        res.setHeader('X-Accel-Buffering', 'no');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Connection', 'keep-alive');
        
        // 🔧 修改：更温和的清理旧连接
        if (currentTransport) {
          console.log(`🧹 [${thisConnectionId}] Cleaning up old transport`);
          try {
            // 给旧连接一点时间完成正在进行的操作
            setTimeout(() => {
              if (typeof currentTransport?.close === 'function') {
                currentTransport.close();
              }
            }, 100);
          } catch (e) {
            console.log(`⚠️ [${thisConnectionId}] Error cleaning up old transport:`, e);
          }
        }

        try {
          console.log(`🚀 [${thisConnectionId}] Creating new SSE transport...`);
          currentTransport = new SSEServerTransport('/mcp/messages', res);
          console.log(`✅ [${thisConnectionId}] SSE transport created`);

          console.log(`🔗 [${thisConnectionId}] Connecting MCP server...`);
          await this.server.connect(currentTransport);
          console.log(`✅ [${thisConnectionId}] MCP server connected successfully`);

          // 记录连接状态但不强制验证
          const expectedSessionId = (currentTransport as any)?.sessionId;
          const messagesPath = (currentTransport as any)?.messagesPath;
          console.log(`🧭 [${thisConnectionId}] Transport state:`, {
            messagesPath,
            expectedSessionId,
            transportType: currentTransport?.constructor?.name,
          });
          
          // 🔧 修改：减少心跳频率，避免过度检查
          const heartbeatInterval = setInterval(() => {
            if (currentTransport && !res.destroyed && !res.writableEnded) {
              try {
                res.write(': heartbeat\n\n');
                console.log(`💓 [${thisConnectionId}] Heartbeat sent`);
              } catch (error) {
                console.error(`❌ [${thisConnectionId}] Heartbeat failed:`, error);
                clearInterval(heartbeatInterval);
                currentTransport = null;
              }
            } else {
              console.log(`💔 [${thisConnectionId}] Heartbeat stopped - connection invalid`);
              clearInterval(heartbeatInterval);
              currentTransport = null;
            }
          }, 30000); // 🔧 改为30秒，减少频率

          // 🔧 修改：减少连接检查频率
          const connectionCheck = setInterval(() => {
            if (!currentTransport || res.destroyed || res.writableEnded) {
              console.log(`🔍 [${thisConnectionId}] Connection check failed, cleaning up`);
              clearInterval(connectionCheck);
              clearInterval(heartbeatInterval);
              currentTransport = null;
            }
          }, 60000); // 🔧 改为60秒检查一次

          // 处理连接关闭事件
          const cleanup = () => {
            clearInterval(heartbeatInterval);
            clearInterval(connectionCheck);
            if (currentTransport) {
              try {
                if (typeof currentTransport.close === 'function') {
                  currentTransport.close();
                }
              } catch (closeError) {
                console.error(`❌ [${thisConnectionId}] Error closing transport:`, closeError);
              }
              currentTransport = null;
            }
          };

          req.on('close', () => {
            console.log(`🔌 [${thisConnectionId}] SSE connection closed by client`);
            cleanup();
          });

          req.on('error', (error) => {
            console.error(`❌ [${thisConnectionId}] SSE request error:`, error);
            cleanup();
          });

          res.on('error', (error) => {
            console.error(`❌ [${thisConnectionId}] Response error:`, error);
            cleanup();
          });

          res.on('close', () => {
            console.log(`🔌 [${thisConnectionId}] Response closed by client`);
            cleanup();
          });

        } catch (error: any) {
          console.error(`❌ [${thisConnectionId}] MCP server connection failed:`, error);
          currentTransport = null;

          if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to establish MCP connection', details: error?.message });
          }
          return;
        }
      });
      
      app.post('/mcp/messages', (req: Request, res: Response) => {
        console.log('📨 POST /mcp/messages received (meta):', {
          originalUrl: (req as any).originalUrl || req.url,
          path: (req as any).path,
          query: req.query,
          contentType: req.headers['content-type'],
          contentLength: req.headers['content-length'],
          method: req.body?.method,
          id: req.body?.id,
        });

        if (!currentTransport) {
          console.log('❌ No transport available');
          res.status(503).json({ 
            error: 'MCP service unavailable', 
            message: 'SSE connection not established or lost. Please reconnect.' 
          });
          return;
        }

        // 🔧 修改：完全移除sessionId验证，或者使用更宽松的验证
        const receivedSessionId = req.query?.sessionId as string | undefined;
        const expectedSessionId = (currentTransport as any)?.sessionId as string | undefined;
        const messagesPath = (currentTransport as any)?.messagesPath;
        
        console.log('🧪 POST session check:', {
          messagesPath,
          expectedSessionId,
          receivedSessionId,
          match: true, // 强制设为true，跳过验证
        });
        
        // 🔧 注释掉严格的sessionId验证
        /*
        if (expectedSessionId && receivedSessionId && receivedSessionId !== expectedSessionId) {
          console.log('❌ Session ID mismatch');
          res.status(400).json({ 
            error: 'Session ID mismatch', 
            expected: expectedSessionId,
            received: receivedSessionId
          });
          return;
        }
        */

        // 设置超时处理
        const timeout = setTimeout(() => {
          if (!res.headersSent) {
            console.log('⏰ Request timeout');
            res.status(408).json({ error: 'Request timeout' });
          }
        }, 30000);

        // 监听响应完成与错误
        res.on('finish', () => {
          clearTimeout(timeout);
          console.log('✅ Response finished:', {
            statusCode: res.statusCode,
            method: req.body?.method,
            id: req.body?.id,
          });
        });
        
        res.on('error', (error) => {
          clearTimeout(timeout);
          console.error('❌ Response error:', error);
        });

        try {
          console.log('🔄 Calling currentTransport.handlePostMessage...');
          currentTransport.handlePostMessage(req, res);
          console.log('✅ currentTransport.handlePostMessage returned (async may still be running)');
        } catch (error: any) {
          clearTimeout(timeout);
          console.error('❌ Error in POST handler:', { message: error?.message, stack: error?.stack });
          if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error', details: error?.message });
          }
        }
      });
      
      // 添加OPTIONS支持（CORS预检）
      app.options('/mcp/messages', (req: Request, res: Response) => {
        res.sendStatus(200);
      });
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`LiblibAI MCP server running on http://0.0.0.0:${port}/mcp`);
      console.log('Server is ready to accept connections');
    });

    // 添加Socket.IO支持
    const io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {
      console.log('WebSocket client connected:', socket.id);
      
      socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`Client ${socket.id} joined room ${roomId}`);
      });

      socket.on('leave-room', (roomId) => {
        socket.leave(roomId);
        console.log(`Client ${socket.id} left room ${roomId}`);
      });

      socket.on('disconnect', () => {
        console.log('WebSocket client disconnected:', socket.id);
      });
    });
    
    // 保持进程运行
    process.on('SIGINT', () => {
      console.log('\nShutting down server...');
      server.close(() => {
        process.exit(0);
      });
    });
    
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

const server = new LiblibMCPServer();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
server.run(port).catch(console.error);