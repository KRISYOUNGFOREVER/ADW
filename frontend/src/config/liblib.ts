// AI 模型 API 配置文件
export const LIBLIB_CONFIG = {
  // LibLib API 基础配置
  BASE_URL: 'https://openapi.liblibai.cloud',
  
  // API 密钥配置 (需要在环境变量中设置)
  API_KEY: import.meta.env.VITE_LIBLIB_API_KEY || '',
  SECRET_KEY: import.meta.env.VITE_LIBLIB_SECRET_KEY || '',
  
  // 默认参数
  DEFAULT_PARAMS: {
    // 图片生成默认参数
    steps: 20,
    cfgScale: 7,
    sampler: 'DPM++ 2M Karras',
    aspectRatio: '1:1',
    imageSize: 512,
    imgCount: 1,
    clipSkip: 2,
    denoisingStrength: 0.75,
  },
  
  // 模型配置
  MODELS: {
    STAR_3_ALPHA: {
      // 星流Star-3 Alpha文生图模板UUID
      templateUuid: '5d7e67009b344550bc1aa6ccbfa1d7f4',
      name: '星流Star-3 Alpha',
      description: '搭载自带LoRA推荐算法，照片级真实感视觉效果'
    }
  },
  
  // 轮询配置
  POLLING: {
    INTERVAL: 2000, // 2秒轮询一次
    MAX_ATTEMPTS: 150, // 最大轮询次数 (5分钟)
    TIMEOUT: 300000, // 5分钟超时
  }
};

// 火山引擎 Seedream 4.0 配置
export const SEEDREAM_CONFIG = {
  // API 基础配置 - 使用代理路径避免 CORS 问题
  BASE_URL: '/seedream-api/api/v3/images/generations',
  
  // API 密钥配置 (需要在环境变量中设置)
  API_KEY: import.meta.env.VITE_SEEDREAM_API_KEY || '333bdc4e-f043-4229-9a6c-c32afcc0b78f',
  
  // 模型配置
  MODEL: {
    ENDPOINT_ID: 'ep-20250919085336-ckn78',
    name: 'Seedream 4.0',
    description: '火山引擎 Seedream 4.0 - 高质量AI绘画模型，支持文生图、图生图、组图生成'
  },
  
  // 默认参数
  DEFAULT_PARAMS: {
    response_format: 'url',
    size: '2K',
    stream: false,
    watermark: true,
    sequential_image_generation: 'disabled'
  },
  
  // 支持的图片尺寸
  SUPPORTED_SIZES: ['1K', '2K', '4K'],
  
  // 轮询配置
  POLLING: {
    INTERVAL: 3000, // 3秒轮询一次
    MAX_ATTEMPTS: 100, // 最大轮询次数 (5分钟)
    TIMEOUT: 300000, // 5分钟超时
  }
};

// 环境变量检查
export const isLiblibConfigured = (): boolean => {
  return !!(LIBLIB_CONFIG.API_KEY && LIBLIB_CONFIG.SECRET_KEY);
};

// Seedream 环境变量检查
export const isSeedreamConfigured = (): boolean => {
  return !!SEEDREAM_CONFIG.API_KEY;
};

// 获取配置信息用于调试
export const getConfigStatus = () => {
  return {
    liblib: {
      hasApiKey: !!LIBLIB_CONFIG.API_KEY,
      hasSecretKey: !!LIBLIB_CONFIG.SECRET_KEY,
      baseUrl: LIBLIB_CONFIG.BASE_URL,
      isConfigured: isLiblibConfigured()
    },
    seedream: {
      hasApiKey: !!SEEDREAM_CONFIG.API_KEY,
      baseUrl: SEEDREAM_CONFIG.BASE_URL,
      endpointId: SEEDREAM_CONFIG.MODEL.ENDPOINT_ID,
      isConfigured: isSeedreamConfigured()
    }
  };
};