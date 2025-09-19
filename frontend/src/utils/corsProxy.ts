// CORS 代理工具
export class CorsProxy {
  private static readonly PROXY_URLS = [
    'https://cors-anywhere.herokuapp.com/',
    'https://api.allorigins.win/raw?url=',
    'https://thingproxy.freeboard.io/fetch/',
  ];

  /**
   * 使用代理发送请求以解决CORS问题
   */
  static async fetchWithProxy(url: string, options: RequestInit = {}): Promise<Response> {
    // 首先尝试直接请求
    try {
      const response = await fetch(url, {
        ...options,
        mode: 'cors',
      });
      return response;
    } catch (directError) {
      console.warn('直接请求失败，尝试使用代理:', directError);
    }

    // 如果直接请求失败，尝试使用代理
    for (const proxyUrl of this.PROXY_URLS) {
      try {
        const proxiedUrl = proxyUrl + encodeURIComponent(url);
        const response = await fetch(proxiedUrl, {
          ...options,
          mode: 'cors',
        });
        
        if (response.ok) {
          return response;
        }
      } catch (proxyError) {
        console.warn(`代理 ${proxyUrl} 请求失败:`, proxyError);
        continue;
      }
    }

    // 所有代理都失败，抛出错误
    throw new Error('所有请求方式都失败，可能是网络问题或API服务不可用');
  }

  /**
   * 检查URL是否需要代理
   */
  static needsProxy(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const currentOrigin = window.location.origin;
      return urlObj.origin !== currentOrigin;
    } catch {
      return false;
    }
  }
}