import forge from 'node-forge';

/**
 * RSA加密工具类
 */
class RsaUtil {
  private publicKey: string = '';
  private forgePublicKey: forge.pki.rsa.PublicKey | null = null;

  constructor() {
    // 初始化
  }

  /**
   * 设置公钥
   * @param publicKey RSA公钥
   */
  setPublicKey(publicKey: string): void {
    try {
      this.publicKey = publicKey;
      // 将PEM格式的公钥转换为forge格式
      this.forgePublicKey = forge.pki.publicKeyFromPem(publicKey);
    } catch (error) {
      throw new Error('无效的RSA公钥格式');
    }
  }

  /**
   * 获取当前公钥
   */
  getPublicKey(): string {
    return this.publicKey;
  }

  /**
   * 加密数据
   * @param data 要加密的数据
   * @returns 加密后的数据
   */
  encrypt(data: string): string {
    if (!this.forgePublicKey) {
      throw new Error('请先设置RSA公钥');
    }
    try {
      // 使用OAEP填充模式加密
      const encrypted = this.forgePublicKey.encrypt(data, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: {
          md: forge.md.sha256.create()
        }
      });
      // 转换为base64格式
      return forge.util.encode64(encrypted);
    } catch (error) {
      throw new Error('RSA加密失败');
    }
  }

  /**
   * 检查是否已设置公钥
   */
  hasPublicKey(): boolean {
    return !!this.publicKey && !!this.forgePublicKey;
  }
}

// 创建单例实例
const rsaUtil = new RsaUtil();

export default rsaUtil;