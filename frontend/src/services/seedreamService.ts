import { SEEDREAM_CONFIG, isSeedreamConfigured } from '../config/liblib';

// 火山引擎 Seedream API 类型定义
export interface SeedreamGenerateParams {
  prompt: string;
  image?: string | string[]; // 支持单张或多张参考图
  size?: '1K' | '2K' | '4K';
  sequential_image_generation?: 'disabled' | 'auto';
  sequential_image_generation_options?: {
    max_images: number;
  };
  response_format?: 'url' | 'b64_json';
  stream?: boolean;
  watermark?: boolean;
}

export interface SeedreamGenerateRequest {
  model: string;
  prompt: string;
  image?: string | string[];
  size: string;
  sequential_image_generation: string;
  sequential_image_generation_options?: {
    max_images: number;
  };
  response_format: string;
  stream: boolean;
  watermark: boolean;
}

export interface SeedreamGenerateResponse {
  id: string;
  object: string;
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
}

export interface SeedreamErrorResponse {
  error: {
    code: string;
    message: string;
    param: string;
    type: string;
  };
}

// 火山引擎 Seedream 4.0 服务类
export class SeedreamService {
  // 检查API是否已配置
  static isConfigured(): boolean {
    return isSeedreamConfigured();
  }

  // 获取配置状态
  static getConfigStatus() {
    return {
      hasApiKey: !!SEEDREAM_CONFIG.API_KEY,
      baseUrl: SEEDREAM_CONFIG.BASE_URL,
      endpointId: SEEDREAM_CONFIG.MODEL.ENDPOINT_ID,
      isConfigured: isSeedreamConfigured()
    };
  }

  // 文生图 - 生成单张图片
  static async generateTextToImage(params: SeedreamGenerateParams): Promise<SeedreamGenerateResponse> {
    if (!this.isConfigured()) {
      throw new Error('Seedream API 配置不完整，请检查 API Key');
    }

    const requestBody: SeedreamGenerateRequest = {
      model: SEEDREAM_CONFIG.MODEL.ENDPOINT_ID,
      prompt: params.prompt,
      size: params.size || SEEDREAM_CONFIG.DEFAULT_PARAMS.size,
      sequential_image_generation: params.sequential_image_generation || SEEDREAM_CONFIG.DEFAULT_PARAMS.sequential_image_generation,
      response_format: params.response_format || SEEDREAM_CONFIG.DEFAULT_PARAMS.response_format,
      stream: params.stream || SEEDREAM_CONFIG.DEFAULT_PARAMS.stream,
      watermark: params.watermark !== undefined ? params.watermark : SEEDREAM_CONFIG.DEFAULT_PARAMS.watermark,
    };

    // 如果有组图生成选项
    if (params.sequential_image_generation_options) {
      requestBody.sequential_image_generation = 'auto';
      requestBody.sequential_image_generation_options = params.sequential_image_generation_options;
    }

    try {
      const response = await fetch(SEEDREAM_CONFIG.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SEEDREAM_CONFIG.API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData: SeedreamErrorResponse = await response.json();
        throw new Error(`Seedream API 调用失败: ${errorData.error.message}`);
      }

      const data: SeedreamGenerateResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Seedream API 调用失败:', error);
      throw error;
    }
  }

  // 图生图 - 单张参考图生成
  static async generateImageToImage(params: SeedreamGenerateParams): Promise<SeedreamGenerateResponse> {
    if (!this.isConfigured()) {
      throw new Error('Seedream API 配置不完整，请检查 API Key');
    }

    if (!params.image) {
      throw new Error('图生图需要提供参考图片');
    }

    const requestBody: SeedreamGenerateRequest = {
      model: SEEDREAM_CONFIG.MODEL.ENDPOINT_ID,
      prompt: params.prompt,
      image: params.image,
      size: params.size || SEEDREAM_CONFIG.DEFAULT_PARAMS.size,
      sequential_image_generation: params.sequential_image_generation || SEEDREAM_CONFIG.DEFAULT_PARAMS.sequential_image_generation,
      response_format: params.response_format || SEEDREAM_CONFIG.DEFAULT_PARAMS.response_format,
      stream: params.stream || SEEDREAM_CONFIG.DEFAULT_PARAMS.stream,
      watermark: params.watermark !== undefined ? params.watermark : SEEDREAM_CONFIG.DEFAULT_PARAMS.watermark,
    };

    // 如果有组图生成选项
    if (params.sequential_image_generation_options) {
      requestBody.sequential_image_generation = 'auto';
      requestBody.sequential_image_generation_options = params.sequential_image_generation_options;
    }

    try {
      const response = await fetch(SEEDREAM_CONFIG.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SEEDREAM_CONFIG.API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData: SeedreamErrorResponse = await response.json();
        throw new Error(`Seedream API 调用失败: ${errorData.error.message}`);
      }

      const data: SeedreamGenerateResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Seedream API 调用失败:', error);
      throw error;
    }
  }

  // 组图生成 - 文生图生成多张图片
  static async generateMultipleImages(params: SeedreamGenerateParams & { maxImages: number }): Promise<SeedreamGenerateResponse> {
    const generateParams: SeedreamGenerateParams = {
      ...params,
      sequential_image_generation: 'auto',
      sequential_image_generation_options: {
        max_images: params.maxImages
      }
    };

    return this.generateTextToImage(generateParams);
  }

  // 多参考图生成
  static async generateFromMultipleImages(params: SeedreamGenerateParams & { images: string[] }): Promise<SeedreamGenerateResponse> {
    const generateParams: SeedreamGenerateParams = {
      ...params,
      image: params.images
    };

    return this.generateImageToImage(generateParams);
  }

  // 通用生成方法 - 根据参数自动选择合适的生成方式
  static async generate(params: SeedreamGenerateParams): Promise<SeedreamGenerateResponse> {
    // 如果有参考图，使用图生图
    if (params.image) {
      // 确保图片 URL 数组格式正确，去除可能的尾随逗号
      if (Array.isArray(params.image)) {
        params.image = params.image.map(url => url.trim().replace(/,$/, ''));
      } else if (typeof params.image === 'string') {
        params.image = params.image.trim().replace(/,$/, '');
      }
      return this.generateImageToImage(params);
    }
    
    // 否则使用文生图
    return this.generateTextToImage(params);
  }

  // 验证图片 URL 是否有效
  static async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok && response.headers.get('content-type')?.startsWith('image/');
    } catch {
      return false;
    }
  }

  // 获取支持的图片尺寸
  static getSupportedSizes(): string[] {
    return SEEDREAM_CONFIG.SUPPORTED_SIZES;
  }
}