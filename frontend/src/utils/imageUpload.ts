// 图片上传工具
export interface UploadResult {
  url: string;
  type: 'url' | 'base64';
}

// 将文件转换为 base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// 将文件转换为可用的图片 URL
export const uploadImage = async (file: File): Promise<UploadResult> => {
  try {
    // 方案1: 转换为 base64（推荐用于 API 调用）
    const base64 = await fileToBase64(file);
    return {
      url: base64,
      type: 'base64'
    };
  } catch (error) {
    console.error('图片上传失败:', error);
    throw new Error('图片上传失败');
  }
};

// 压缩图片（可选）
export const compressImage = (file: File, maxWidth: number = 1024, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // 计算压缩后的尺寸
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      // 绘制压缩后的图片
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // 转换为 Blob
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, file.type, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// 验证图片文件
export const validateImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!validTypes.includes(file.type)) {
    throw new Error('不支持的图片格式，请上传 JPG、PNG 或 WebP 格式的图片');
  }
  
  if (file.size > maxSize) {
    throw new Error('图片文件过大，请上传小于 10MB 的图片');
  }
  
  return true;
};