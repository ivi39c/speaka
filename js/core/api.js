/**
 * API 統一管理系統
 * 處理所有 HTTP 請求和錯誤處理
 */

class API {
    constructor() {
        this.baseURL = this.getBaseURL();
        this.timeout = 10000; // 10秒超時
        this.headers = {
            'Content-Type': 'application/json'
        };
        
        // 請求攔截器
        this.requestInterceptors = [];
        this.responseInterceptors = [];
        
        this.setupInterceptors();
    }

    /**
     * 獲取基礎 URL
     */
    getBaseURL() {
        if (window.location.hostname === 'localhost') {
            return 'http://localhost:3001';
        }
        return window.location.origin;
    }

    /**
     * 設置攔截器
     */
    setupInterceptors() {
        // 請求攔截器 - 添加認證 token
        this.addRequestInterceptor((config) => {
            const token = localStorage.getItem('lineAccessToken');
            if (token) {
                config.headers = {
                    ...config.headers,
                    'Authorization': `Bearer ${token}`
                };
            }
            return config;
        });

        // 響應攔截器 - 統一錯誤處理
        this.addResponseInterceptor(
            (response) => response,
            (error) => this.handleError(error)
        );
    }

    /**
     * 添加請求攔截器
     */
    addRequestInterceptor(interceptor) {
        this.requestInterceptors.push(interceptor);
    }

    /**
     * 添加響應攔截器
     */
    addResponseInterceptor(successInterceptor, errorInterceptor) {
        this.responseInterceptors.push({
            success: successInterceptor,
            error: errorInterceptor
        });
    }

    /**
     * 基礎請求方法
     */
    async request(url, options = {}) {
        // 準備請求配置
        let config = {
            method: 'GET',
            headers: { ...this.headers },
            ...options,
            url: url.startsWith('http') ? url : `${this.baseURL}${url}`
        };

        // 應用請求攔截器
        for (const interceptor of this.requestInterceptors) {
            config = interceptor(config) || config;
        }

        try {
            // 設置超時
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            // 發送請求
            const response = await fetch(config.url, {
                ...config,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // 檢查響應狀態
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // 解析響應
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            const result = { data, status: response.status, response };

            // 應用響應攔截器
            for (const interceptor of this.responseInterceptors) {
                if (interceptor.success) {
                    interceptor.success(result);
                }
            }

            return result;

        } catch (error) {
            // 應用錯誤攔截器
            for (const interceptor of this.responseInterceptors) {
                if (interceptor.error) {
                    interceptor.error(error);
                }
            }

            throw error;
        }
    }

    /**
     * GET 請求
     */
    async get(url, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        
        return this.request(fullUrl, { method: 'GET' });
    }

    /**
     * POST 請求
     */
    async post(url, data = {}) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT 請求
     */
    async put(url, data = {}) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE 請求
     */
    async delete(url) {
        return this.request(url, { method: 'DELETE' });
    }

    /**
     * 文件上傳
     */
    async upload(url, file, onProgress = null) {
        const formData = new FormData();
        formData.append('file', file);

        return this.request(url, {
            method: 'POST',
            body: formData,
            headers: {} // 讓瀏覽器自動設置 Content-Type
        });
    }

    /**
     * LINE API 相關
     */
    async lineLogin(code, redirectUri) {
        return this.post('/api/line-token', { code, redirectUri });
    }

    async verifyLineToken(accessToken) {
        return this.post('/api/line-verify', { access_token: accessToken });
    }

    async getLineProfile(accessToken) {
        return this.request('https://api.line.me/v2/profile', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
    }

    /**
     * 訂閱 API
     */
    async getSubscriptions() {
        return this.get('/api/subscriptions');
    }

    async createSubscription(subscriptionData) {
        return this.post('/api/subscriptions', subscriptionData);
    }

    async updateSubscription(id, updates) {
        return this.put(`/api/subscriptions/${id}`, updates);
    }

    async cancelSubscription(id) {
        return this.delete(`/api/subscriptions/${id}`);
    }

    /**
     * 群組 API
     */
    async getGroups() {
        return this.get('/api/groups');
    }

    async createGroup(groupData) {
        return this.post('/api/groups', groupData);
    }

    async updateGroup(id, updates) {
        return this.put(`/api/groups/${id}`, updates);
    }

    async deleteGroup(id) {
        return this.delete(`/api/groups/${id}`);
    }

    /**
     * 健康檢查
     */
    async healthCheck() {
        return this.get('/api/health');
    }

    /**
     * 錯誤處理
     */
    handleError(error) {
        console.error('API Error:', error);

        // 網路錯誤
        if (error.name === 'AbortError') {
            return { error: '請求超時，請檢查網路連線' };
        }

        if (!navigator.onLine) {
            return { error: '網路連線中斷，請檢查網路設定' };
        }

        // HTTP 錯誤
        if (error.message.includes('HTTP 401')) {
            // 認證失效，清理 token 並重新登入
            localStorage.removeItem('lineAccessToken');
            localStorage.removeItem('lineProfile');
            window.dispatchEvent(new CustomEvent('auth:expired'));
            return { error: '登入已過期，請重新登入' };
        }

        if (error.message.includes('HTTP 403')) {
            return { error: '權限不足，無法存取此功能' };
        }

        if (error.message.includes('HTTP 404')) {
            return { error: '請求的資源不存在' };
        }

        if (error.message.includes('HTTP 500')) {
            return { error: '伺服器暫時無法處理請求，請稍後再試' };
        }

        // 預設錯誤
        return { error: error.message || '發生未知錯誤，請稍後再試' };
    }

    /**
     * 檢查網路狀態
     */
    isOnline() {
        return navigator.onLine;
    }

    /**
     * 批量請求
     */
    async batch(requests) {
        const promises = requests.map(req => 
            this.request(req.url, req.options).catch(error => ({ error }))
        );
        
        return Promise.all(promises);
    }

    /**
     * 快取管理
     */
    cache = new Map();

    async getCached(key, fetcher, ttl = 300000) { // 5分鐘預設 TTL
        const cached = this.cache.get(key);
        
        if (cached && Date.now() - cached.timestamp < ttl) {
            return cached.data;
        }

        const data = await fetcher();
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });

        return data;
    }

    clearCache(key = null) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }
}

export { API };