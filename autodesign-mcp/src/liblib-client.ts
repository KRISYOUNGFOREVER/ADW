import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

interface LiblibConfig {
  accessKey: string;
  secretKey: string;
  baseUrl: string;
}

interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  defaultSuffix: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultSteps: number;
  defaultCfgScale: number;
}

interface GenerateImageParams {
  prompt: string;
  template_id?: string;
  custom_suffix?: string;
  width?: number;
  height?: number;
  steps?: number;
  img_count?: number;
  seed?: number;
  cfg_scale?: number;
  wait_for_completion?: boolean;
  max_wait_seconds?: number;
}

interface AdvancedGenerateParams {
  prompt: string;
  model_version_uuid: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfg_scale?: number;
  sampler?: number;
  clip_skip?: number;
  img_count?: number;
  seed?: number;
  wait_for_completion?: boolean;
  max_wait_seconds?: number;
}

interface ModelVersionInfo {
  version_uuid: string;
  model_name: string;
  version_name: string;
  baseAlgo: string;
  show_type: string;
  commercial_use: string;
  model_url: string;
}

interface GenerationStatus {
  generateUuid: string;
  generateStatus: number;
  percentCompleted: number;
  generateMsg: string;
  pointsCost?: number;
  accountBalance?: number;
  images?: Array<{
    imageUrl: string;
    seed: number;
    auditStatus: number;
  }>;
}

// 在现有接口后添加新的接口定义
interface Img2ImgParams {
  prompt: string;
  reference_image_url: string;
  model_version_uuid?: string;
  negative_prompt?: string;
  denoising_strength?: number;
  width?: number;
  height?: number;
  steps?: number;
  cfg_scale?: number;
  sampler?: number;
  clip_skip?: number;
  img_count?: number;
  seed?: number;
  wait_for_completion?: boolean;
  max_wait_seconds?: number;
}

interface ControlNetParams {
  prompt: string;
  reference_image_url: string;
  control_type: 'line' | 'depth' | 'pose' | 'IPAdapter' | 'subject';
  model_version_uuid?: string;
  negative_prompt?: string;
  control_weight?: number;
  width?: number;
  height?: number;
  steps?: number;
  cfg_scale?: number;
  sampler?: number;
  clip_skip?: number;
  img_count?: number;
  seed?: number;
  wait_for_completion?: boolean;
  max_wait_seconds?: number;
}

// 在LiblibClient类中添加新方法
export class LiblibClient {
  private config: LiblibConfig;
  private httpClient: AxiosInstance;
  private designTemplates: DesignTemplate[];

  constructor() {
    // 从环境变量获取配置
    this.config = {
      accessKey: process.env.LIBLIB_ACCESS_KEY || '',
      secretKey: process.env.LIBLIB_SECRET_KEY || '',
      baseUrl: process.env.LIBLIB_BASE_URL || 'https://openapi.liblibai.cloud',
    };

    this.httpClient = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 初始化设计模板
    this.designTemplates = [
      {
        id: 'product_metal',
        name: '金属产品设计',
        description: '适合金属材质产品的设计模板',
        defaultSuffix: ', metallic texture, industrial design, high quality render, studio lighting',
        defaultWidth: 1024,
        defaultHeight: 1024,
        defaultSteps: 30,
        defaultCfgScale: 7.0,
      },
      {
        id: 'product_wood',
        name: '木质产品设计',
        description: '适合木质材质产品的设计模板',
        defaultSuffix: ', wooden texture, natural grain, warm lighting, craftsmanship',
        defaultWidth: 1024,
        defaultHeight: 1024,
        defaultSteps: 30,
        defaultCfgScale: 7.0,
      },
      {
        id: 'product_plastic',
        name: '塑料产品设计',
        description: '适合塑料材质产品的设计模板',
        defaultSuffix: ', smooth plastic surface, modern design, clean background, product photography',
        defaultWidth: 1024,
        defaultHeight: 1024,
        defaultSteps: 30,
        defaultCfgScale: 7.0,
      },
      {
        id: 'product_fabric',
        name: '织物产品设计',
        description: '适合织物材质产品的设计模板',
        defaultSuffix: ', fabric texture, soft material, textile design, comfortable feel',
        defaultWidth: 1024,
        defaultHeight: 1024,
        defaultSteps: 30,
        defaultCfgScale: 7.0,
      },
      {
        id: 'ui_modern',
        name: '现代UI设计',
        description: '适合现代UI界面设计的模板',
        defaultSuffix: ', modern UI design, clean interface, minimalist, user-friendly, digital design',
        defaultWidth: 1280,
        defaultHeight: 720,
        defaultSteps: 25,
        defaultCfgScale: 6.0,
      },
      {
        id: 'logo_minimalist',
        name: '简约Logo设计',
        description: '适合简约风格Logo设计的模板',
        defaultSuffix: ', minimalist logo, clean design, vector style, professional branding, simple geometry',
        defaultWidth: 1024,
        defaultHeight: 1024,
        defaultSteps: 20,
        defaultCfgScale: 8.0,
      },
    ];
  }

  /**
   * 生成API签名
   */
  private generateSignature(uri: string): { signature: string; timestamp: string; signatureNonce: string } {
    const timestamp = Date.now().toString();
    const signatureNonce = crypto.randomBytes(16).toString('hex');
    const content = `${uri}&${timestamp}&${signatureNonce}`;
    
    const hmac = crypto.createHmac('sha1', this.config.secretKey);
    hmac.update(content);
    const digest = hmac.digest();
    
    // 生成URL安全的base64签名，移除填充的等号
    const signature = digest.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    return { signature, timestamp, signatureNonce };
  }

  /**
   * 构建带签名的URL
   */
  private buildSignedUrl(uri: string): string {
    const { signature, timestamp, signatureNonce } = this.generateSignature(uri);
    const params = new URLSearchParams({
      AccessKey: this.config.accessKey,
      Signature: signature,
      Timestamp: timestamp,
      SignatureNonce: signatureNonce,
    });
    return `${uri}?${params.toString()}`;
  }

  /**
   * 测试API连接
   */
  async testConnection(): Promise<any> {
    if (!this.config.accessKey || !this.config.secretKey) {
      throw new Error('请设置环境变量 LIBLIB_ACCESS_KEY 和 LIBLIB_SECRET_KEY');
    }

    try {
      // 使用查询生图状态接口来测试连接（使用一个假的UUID）
      const uri = '/api/generate/webui/status';
      const url = this.buildSignedUrl(uri);
      
      const response = await this.httpClient.post(url, {
        generateUuid: 'test-connection-uuid'
      });
      
      return {
        success: true,
        message: 'API连接正常',
        config: {
          baseUrl: this.config.baseUrl,
          accessKey: this.config.accessKey.substring(0, 8) + '...',
        },
        response: response.data
      };
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.msg?.includes('generateUuid')) {
        // 如果是因为UUID不存在而报错，说明连接是正常的
        return {
          success: true,
          message: 'API连接正常（通过错误响应验证）',
          config: {
            baseUrl: this.config.baseUrl,
            accessKey: this.config.accessKey.substring(0, 8) + '...',
          }
        };
      }
      
      throw new Error(`API连接失败: ${error.response?.data?.msg || error.message}`);
    }
  }

  /**
   * 获取设计模板列表
   */
  getDesignTemplates(): DesignTemplate[] {
    return this.designTemplates;
  }

  /**
   * 根据模板ID获取模板
   */
  private getTemplate(templateId: string): DesignTemplate {
    const template = this.designTemplates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`未找到模板: ${templateId}`);
    }
    return template;
  }

  /**
   * 生成设计图片（使用星流Star-3 Alpha）
   */
  async generateDesignImage(params: GenerateImageParams): Promise<any> {
    const template = this.getTemplate(params.template_id || 'product_metal');
    
    // 构建完整的提示词
    const fullPrompt = params.prompt + (params.custom_suffix || template.defaultSuffix);
    
    const generateParams = {
      prompt: fullPrompt,
      aspectRatio: 'square', // 默认使用正方形
      imgCount: params.img_count || 1,
      steps: params.steps || template.defaultSteps,
    };

    // 如果指定了宽高，使用imageSize而不是aspectRatio
    if (params.width && params.height) {
      delete (generateParams as any).aspectRatio;
      (generateParams as any).imageSize = {
        width: params.width,
        height: params.height,
      };
    } else if (params.width || params.height) {
      (generateParams as any).imageSize = {
        width: params.width || template.defaultWidth,
        height: params.height || template.defaultHeight,
      };
      delete (generateParams as any).aspectRatio;
    }

    const requestBody = {
      templateUuid: '5d7e67009b344550bc1aa6ccbfa1d7f4', // 星流Star-3 Alpha文生图模板
      generateParams,
    };

    const uri = '/api/generate/webui/text2img/ultra';
    const url = this.buildSignedUrl(uri);
    
    try {
      const response = await this.httpClient.post(url, requestBody);
      const result = response.data;
      
      if (params.wait_for_completion) {
        return await this.waitForCompletion(
          result.data.generateUuid,
          params.max_wait_seconds || 180
        );
      }
      
      return result;
    } catch (error: any) {
      throw new Error(`生成图片失败: ${error.response?.data?.msg || error.message}`);
    }
  }

  /**
   * 高级文生图（使用自定义模型）
   */
  async generateText2ImgAdvanced(params: AdvancedGenerateParams): Promise<any> {
    const generateParams = {
      checkPointId: params.model_version_uuid,
      prompt: params.prompt,
      negativePrompt: params.negative_prompt || '',
      sampler: params.sampler || 15,
      steps: params.steps || 20,
      cfgScale: params.cfg_scale || 7,
      width: params.width || 768,
      height: params.height || 1024,
      imgCount: params.img_count || 1,
      randnSource: 0,
      seed: params.seed || -1,
      restoreFaces: 0,
      clipSkip: params.clip_skip || 2,
    };

    const requestBody = {
      generateParams,
    };

    const uri = '/api/generate/webui/text2img';
    const url = this.buildSignedUrl(uri);
    
    try {
      const response = await this.httpClient.post(url, requestBody);
      const result = response.data;
      
      if (params.wait_for_completion) {
        return await this.waitForCompletion(
          result.data.generateUuid,
          params.max_wait_seconds || 180
        );
      }
      
      return result;
    } catch (error: any) {
      throw new Error(`高级文生图失败: ${error.response?.data?.msg || error.message}`);
    }
  }

  /**
   * 查询生图状态
   */
  async checkGenerationStatus(generateUuid: string): Promise<GenerationStatus> {
    const uri = '/api/generate/webui/status';
    const url = this.buildSignedUrl(uri);
    
    try {
      const response = await this.httpClient.post(url, { generateUuid });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`查询状态失败: ${error.response?.data?.msg || error.message}`);
    }
  }

  /**
   * 查询模型版本信息
   * @param versionUuid 模型版本UUID
   * @returns 模型版本信息
   */
  async getModelVersionInfo(versionUuid: string): Promise<ModelVersionInfo> {
    const uri = '/api/model/version/get';
    const url = this.buildSignedUrl(uri);
    
    try {
      const response = await this.httpClient.post(url, {
        versionUuid: versionUuid
      });
      
      return response.data.data;
    } catch (error: any) {
      throw new Error(`查询模型版本信息失败: ${error.response?.data?.msg || error.message}`);
    }
  }

  /**
   * 等待生图完成
   */
  private async waitForCompletion(generateUuid: string, maxWaitSeconds: number): Promise<any> {
    const startTime = Date.now();
    const maxWaitMs = maxWaitSeconds * 1000;
    
    while (Date.now() - startTime < maxWaitMs) {
      const status = await this.checkGenerationStatus(generateUuid);
      
      // 生图状态：1-排队中，2-生图中，5-完成，6-失败
      if (status.generateStatus === 5) {
        return {
          success: true,
          generateUuid,
          status,
          message: '生图完成',
        };
      } else if (status.generateStatus === 6) {
        return {
          success: false,
          generateUuid,
          status,
          message: `生图失败: ${status.generateMsg}`,
        };
      }
      
      // 等待2秒后再次查询
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // 超时
    const finalStatus = await this.checkGenerationStatus(generateUuid);
    return {
      success: false,
      generateUuid,
      status: finalStatus,
      message: `等待超时，当前状态: ${this.getStatusText(finalStatus.generateStatus)}`,
    };
  }

  /**
   * 获取状态文本描述
   */
  private getStatusText(status: number): string {
    const statusMap: { [key: number]: string } = {
      1: '排队中',
      2: '生图中',
      5: '完成',
      6: '失败',
    };
    return statusMap[status] || `未知状态(${status})`;
  }

  /**
   * 图生图（基于参考图生成新图片）
   */
  async generateImg2Img(params: Img2ImgParams): Promise<any> {
    // 如果没有指定模型，使用星流图生图模板
    const templateUuid = params.model_version_uuid ? undefined : '07e00af4fc464c7ab55ff906f8acf1b7';
    
    const generateParams: any = {
      prompt: params.prompt,
      sourceImage: params.reference_image_url,
      imgCount: params.img_count || 1,
      steps: params.steps || 30,
    };

    // 如果使用自定义模型
    if (params.model_version_uuid) {
      generateParams.checkPointId = params.model_version_uuid;
      generateParams.negativePrompt = params.negative_prompt || '';
      generateParams.sampler = params.sampler || 15;
      generateParams.cfgScale = params.cfg_scale || 7;
      generateParams.clipSkip = params.clip_skip || 2;
      generateParams.randnSource = 0;
      generateParams.seed = params.seed || -1;
      generateParams.restoreFaces = 0;
      generateParams.denoisingStrength = params.denoising_strength || 0.75;
      generateParams.resizeMode = 1; // 裁剪模式
      generateParams.resizedWidth = params.width || 1024;
      generateParams.resizedHeight = params.height || 1024;
      generateParams.mode = 0; // 图生图模式
    }

    const requestBody: any = {
      generateParams,
    };

    if (templateUuid) {
      requestBody.templateUuid = templateUuid;
    }

    const uri = params.model_version_uuid ? '/api/generate/webui/img2img' : '/api/generate/webui/img2img/ultra';
    const url = this.buildSignedUrl(uri);
    
    try {
      const response = await this.httpClient.post(url, requestBody);
      const result = response.data;
      
      if (params.wait_for_completion) {
        return await this.waitForCompletion(
          result.data.generateUuid,
          params.max_wait_seconds || 180
        );
      }
      
      return result;
    } catch (error: any) {
      throw new Error(`图生图失败: ${error.response?.data?.msg || error.message}`);
    }
  }

  /**
   * 使用ControlNet参考图生成图片
   */
  async generateWithControlNet(params: ControlNetParams): Promise<any> {
    // 根据控制类型选择模板和API
    const isStarFlow = !params.model_version_uuid;
    const templateUuid = isStarFlow ? '5d7e67009b344550bc1aa6ccbfa1d7f4' : undefined;
    
    const generateParams: any = {
      prompt: params.prompt,
      imgCount: params.img_count || 1,
      steps: params.steps || 30,
    };

    // 设置图片尺寸
    if (params.width && params.height) {
      generateParams.imageSize = {
        width: params.width,
        height: params.height,
      };
    } else {
      generateParams.aspectRatio = 'square';
    }

    // 配置ControlNet
    if (isStarFlow) {
      // 星流模式
      generateParams.controlnet = {
        controlType: params.control_type,
        controlImage: params.reference_image_url,
      };
    } else {
      // 自定义模型模式
      generateParams.checkPointId = params.model_version_uuid;
      generateParams.negativePrompt = params.negative_prompt || '';
      generateParams.sampler = params.sampler || 15;
      generateParams.cfgScale = params.cfg_scale || 7;
      generateParams.width = params.width || 1024;
      generateParams.height = params.height || 1024;
      generateParams.clipSkip = params.clip_skip || 2;
      generateParams.randnSource = 0;
      generateParams.seed = params.seed || -1;
      generateParams.restoreFaces = 0;

      // ControlNet配置
      generateParams.controlNet = [{
        unitOrder: 1,
        sourceImage: params.reference_image_url,
        width: params.width || 1024,
        height: params.height || 1024,
        preprocessor: this.getPreprocessorByType(params.control_type),
        model: this.getControlNetModelByType(params.control_type),
        controlWeight: params.control_weight || 1.0,
        startingControlStep: 0,
        endingControlStep: 1,
        pixelPerfect: 1,
        controlMode: 0,
        resizeMode: 1,
        maskImage: '',
      }];
    }

    const requestBody: any = {
      generateParams,
    };

    if (templateUuid) {
      requestBody.templateUuid = templateUuid;
    }

    const uri = isStarFlow ? '/api/generate/webui/text2img/ultra' : '/api/generate/webui/text2img';
    const url = this.buildSignedUrl(uri);
    
    try {
      const response = await this.httpClient.post(url, requestBody);
      const result = response.data;
      
      if (params.wait_for_completion) {
        return await this.waitForCompletion(
          result.data.generateUuid,
          params.max_wait_seconds || 180
        );
      }
      
      return result;
    } catch (error: any) {
      throw new Error(`ControlNet生图失败: ${error.response?.data?.msg || error.message}`);
    }
  }

  /**
   * 根据控制类型获取预处理器ID
   */
  private getPreprocessorByType(controlType: string): number {
    const preprocessorMap: { [key: string]: number } = {
      'line': 1, // canny
      'depth': 3, // depth_leres
      'pose': 15, // openpose
      'IPAdapter': 0, // none
      'subject': 0, // none
    };
    return preprocessorMap[controlType] || 0;
  }

  /**
   * 根据控制类型获取ControlNet模型UUID
   */
  private getControlNetModelByType(controlType: string): string {
    const modelMap: { [key: string]: string } = {
      'line': 'xinsir_controlnet-canny-sdxl_V2',
      'depth': 'xinsir_controlnet_depth_sdxl_1.0',
      'pose': 'xinsir_controlnet-openpose-sdxl-1.0',
      'IPAdapter': 'ip-adapter-plus_sdxl_vit-h',
      'subject': 'ip-adapter-plus_sdxl_vit-h',
    };
    return modelMap[controlType] || 'xinsir_controlnet-canny-sdxl_V2';
  }
}