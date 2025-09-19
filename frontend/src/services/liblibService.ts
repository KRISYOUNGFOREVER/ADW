import CryptoJS from 'crypto-js';
import { LIBLIB_CONFIG, isLiblibConfigured } from '../config/liblib';
import { CorsProxy } from '../utils/corsProxy';

// 生成签名
function generateSignature(uri: string): {
  signature: string;
  timestamp: string;
  signatureNonce: string;
} {
  const timestamp = Date.now().toString();
  const signatureNonce = Math.random().toString(36).substring(2, 18);
  
  // 拼接原文：URI + "&" + 时间戳 + "&" + 随机字符串
  const content = `${uri}&${timestamp}&${signatureNonce}`;
  
  // 使用 HMAC-SHA1 加密
  const hash = CryptoJS.HmacSHA1(content, LIBLIB_CONFIG.SECRET_KEY);
  
  // 生成 URL 安全的 Base64 签名
  const signature = CryptoJS.enc.Base64.stringify(hash)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  return {
    signature,
    timestamp,
    signatureNonce,
  };
}

// 构建带签名的 URL
function buildSignedUrl(uri: string): string {
  const { signature, timestamp, signatureNonce } = generateSignature(uri);
  
  const params = new URLSearchParams({
    AccessKey: LIBLIB_CONFIG.API_KEY,
    Signature: signature,
    Timestamp: timestamp,
    SignatureNonce: signatureNonce,
  });
  
  // 使用本地代理路径
  return `/liblib-api${uri}?${params.toString()}`;
}

// API 请求接口
interface GenerateParams {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: string;
  imageSize?: {
    width: number;
    height: number;
  };
  steps?: number;
  cfgScale?: number;
  seed?: number;
  imgCount?: number;
  sampler?: number;
  clipSkip?: number;
  denoisingStrength?: number;
  sourceImage?: string;
}

interface GenerateRequest {
  templateUuid: string;
  generateParams: any;
}

interface GenerateResponse {
  generateUuid: string;
  message?: string;
  code?: number;
}

interface StatusResponse {
  status: 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: {
    images: string[];
    pointsCost?: number;
    accountBalance?: number;
  };
  message?: string;
  code?: number;
}

// LibLib API 服务类
export class LiblibService {
  // 检查API是否已配置
  static isConfigured(): boolean {
    return isLiblibConfigured();
  }

  // 获取配置状态
  static getConfigStatus() {
    return {
      hasApiKey: !!LIBLIB_CONFIG.API_KEY,
      hasSecretKey: !!LIBLIB_CONFIG.SECRET_KEY,
      baseUrl: LIBLIB_CONFIG.BASE_URL,
      isConfigured: isLiblibConfigured()
    };
  }

  // Seedream 4.0 文生图 (使用LiblibAI自定义模型)
  static async generateSeedream(params: GenerateParams): Promise<GenerateResponse> {
    if (!this.isConfigured()) {
      throw new Error('LibLib API 配置不完整，请检查 AccessKey 和 SecretKey');
    }

    const uri = '/api/generate/webui/text2img';
    const url = buildSignedUrl(uri);
    
    const requestBody: GenerateRequest = {
      templateUuid: LIBLIB_CONFIG.MODELS.SEEDREAM_4_0.templateUuid,
      generateParams: {
        checkPointId: LIBLIB_CONFIG.MODELS.SEEDREAM_4_0.checkPointId,
        prompt: params.prompt,
        negativePrompt: params.negativePrompt || '',
        sampler: params.sampler || 15, // 使用数字枚举值
        steps: params.steps || LIBLIB_CONFIG.DEFAULT_PARAMS.steps,
        cfgScale: params.cfgScale || LIBLIB_CONFIG.DEFAULT_PARAMS.cfgScale,
        width: params.imageSize?.width || 768,
        height: params.imageSize?.height || 1024,
        imgCount: params.imgCount || LIBLIB_CONFIG.DEFAULT_PARAMS.imgCount,
        seed: params.seed || -1,
        clipSkip: params.clipSkip || LIBLIB_CONFIG.DEFAULT_PARAMS.clipSkip,
        randnSource: 0, // CPU随机种子
        restoreFaces: 0, // 关闭面部修复
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.code && data.code !== 0) {
        throw new Error(data.msg || '生成请求失败');
      }

      return data.data;
    } catch (error) {
      console.error('LibLib API 调用失败:', error);
      throw error;
    }
  }

  // 星流 Star-3 Alpha 文生图
  static async generateStar3(params: GenerateParams): Promise<GenerateResponse> {
    if (!this.isConfigured()) {
      throw new Error('LibLib API 配置不完整，请检查 AccessKey 和 SecretKey');
    }

    const uri = '/api/generate/webui/text2img/ultra';
    const url = buildSignedUrl(uri);
    
    const requestBody: GenerateRequest = {
      templateUuid: LIBLIB_CONFIG.MODELS.STAR_3_ALPHA.templateUuid,
      generateParams: {
        prompt: params.prompt,
        aspectRatio: params.aspectRatio || 'square',
        imgCount: params.imgCount || 1,
        steps: params.steps || 30, // 星流推荐30步
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.code && data.code !== 0) {
        throw new Error(data.msg || '生成请求失败');
      }

      return data.data;
    } catch (error) {
      console.error('LibLib API 调用失败:', error);
      throw error;
    }
  }

  // 自定义模型生图
  static async generateCustom(params: GenerateParams, modelUuid: string): Promise<GenerateResponse> {
    if (!this.isConfigured()) {
      throw new Error('LibLib API 配置不完整，请检查 AccessKey 和 SecretKey');
    }

    const uri = '/api/generate/webui/text2img';
    const url = buildSignedUrl(uri);
    
    const requestBody: GenerateRequest = {
      templateUuid: 'e10adc3949ba59abbe56e057f20f883e', // 默认模板
      generateParams: {
        checkPointId: modelUuid,
        prompt: params.prompt,
        negativePrompt: params.negativePrompt || '',
        sampler: params.sampler || 15,
        steps: params.steps || LIBLIB_CONFIG.DEFAULT_PARAMS.steps,
        cfgScale: params.cfgScale || LIBLIB_CONFIG.DEFAULT_PARAMS.cfgScale,
        width: params.imageSize?.width || 768,
        height: params.imageSize?.height || 1024,
        imgCount: params.imgCount || LIBLIB_CONFIG.DEFAULT_PARAMS.imgCount,
        seed: params.seed || -1,
        clipSkip: params.clipSkip || LIBLIB_CONFIG.DEFAULT_PARAMS.clipSkip,
        randnSource: 0,
        restoreFaces: 0,
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.code && data.code !== 0) {
        throw new Error(data.msg || '生成请求失败');
      }

      return data.data;
    } catch (error) {
      console.error('LibLib API 调用失败:', error);
      throw error;
    }
  }

  // 查询生成状态
  static async getGenerateStatus(generateUuid: string): Promise<StatusResponse> {
    if (!this.isConfigured()) {
      throw new Error('LibLib API 配置不完整，请检查 AccessKey 和 SecretKey');
    }

    const uri = '/api/generate/webui/status';
    const url = buildSignedUrl(uri);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ generateUuid }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.code && data.code !== 0) {
        throw new Error(data.msg || '查询状态失败');
      }

      const statusData = data.data;
      
      // 转换状态格式
      let status: 'processing' | 'completed' | 'failed';
      switch (statusData.generateStatus) {
        case 5: // 完成
          status = 'completed';
          break;
        case 6: // 失败
          status = 'failed';
          break;
        default:
          status = 'processing';
      }

      return {
        status,
        progress: statusData.percentCompleted || 0,
        result: {
          images: statusData.images?.map((img: any) => img.imageUrl) || [],
          pointsCost: statusData.pointsCost,
          accountBalance: statusData.accountBalance,
        },
        message: statusData.generateMsg,
      };
    } catch (error) {
      console.error('查询生成状态失败:', error);
      throw error;
    }
  }

  // 轮询生成状态
  static async pollGenerateStatus(
    generateUuid: string,
    onProgress?: (progress: number) => void,
    maxAttempts: number = LIBLIB_CONFIG.POLLING.MAX_ATTEMPTS,
    interval: number = LIBLIB_CONFIG.POLLING.INTERVAL
  ): Promise<StatusResponse> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const status = await this.getGenerateStatus(generateUuid);
        
        if (onProgress && status.progress !== undefined) {
          onProgress(status.progress * 100);
        }
        
        if (status.status === 'completed' || status.status === 'failed') {
          return status;
        }
        
        // 等待指定间隔后继续轮询
        await new Promise(resolve => setTimeout(resolve, interval));
        attempts++;
        
      } catch (error) {
        console.error(`轮询第 ${attempts + 1} 次失败:`, error);
        attempts++;
        
        if (attempts >= maxAttempts) {
          throw new Error('轮询超时，请稍后手动查询结果');
        }
        
        // 出错时也等待一段时间再重试
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
    
    throw new Error('轮询超时，请稍后手动查询结果');
  }
}

export default LiblibService;