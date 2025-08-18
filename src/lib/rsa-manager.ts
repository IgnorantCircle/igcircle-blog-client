import { authApi } from '@/lib/api'
import rsaUtil from '@/lib/rsa'
import { handleGlobalError } from '@/lib/error-handler'

/**
 * RSA密钥管理器
 * 确保RSA公钥只获取一次，避免重复请求
 */
class RsaManager {
	private isInitializing = false
	private initPromise: Promise<void> | null = null

	/**
	 * 初始化RSA公钥
	 * 如果已经在初始化中或已经初始化完成，则不会重复请求
	 */
	async initialize(): Promise<void> {
		// 如果已经有公钥，直接返回
		if (rsaUtil.hasPublicKey()) {
			return Promise.resolve()
		}

		// 如果正在初始化，返回现有的Promise
		if (this.isInitializing && this.initPromise) {
			return this.initPromise
		}

		// 开始初始化
		this.isInitializing = true
		this.initPromise = this.fetchRsaKey()

		try {
			await this.initPromise
		} catch (error) {
			handleGlobalError(error, 'initializeRsaManager')
		}

		this.isInitializing = false
		this.initPromise = null
	}

	/**
	 * 获取RSA公钥
	 */
	private async fetchRsaKey(): Promise<void> {
		try {
			const response = await authApi.getRsaPublicKey()
			rsaUtil.setPublicKey(response.publicKey)
		} catch (error) {
			handleGlobalError(error, 'fetchRsaKey')
		}
	}

	/**
	 * 检查是否已经初始化
	 */
	isInitialized(): boolean {
		return rsaUtil.hasPublicKey()
	}

	/**
	 * 重置状态（用于测试或重新初始化）
	 */
	reset(): void {
		this.isInitializing = false
		this.initPromise = null
	}
}

// 创建单例实例
export const rsaManager = new RsaManager()
