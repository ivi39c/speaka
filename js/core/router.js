/**
 * 輕量級 SPA 路由系統
 * 支援動態載入和狀態管理
 */

class Router {
    constructor(state) {
        this.routes = new Map();
        this.state = state;
        this.currentPage = null;
        this.defaultRoute = '/';
        this.contentContainer = null;
        
        this.isNavigating = false;
    }

    /**
     * 註冊路由
     * @param {string} path - 路由路徑
     * @param {Function} pageLoader - 頁面載入函數
     */
    register(path, pageLoader) {
        this.routes.set(path, pageLoader);
    }

    /**
     * 設置預設路由
     * @param {string} path - 預設路由路徑
     */
    setDefault(path) {
        this.defaultRoute = path;
    }

    /**
     * 啟動路由系統
     */
    start() {
        // 找到內容容器
        this.contentContainer = document.getElementById('app-content') || document.body;
        
        // 初始導航
        const currentPath = this.getCurrentPath();
        this.navigate(currentPath, false);
    }

    /**
     * 導航到指定路徑
     * @param {string} path - 目標路徑
     * @param {boolean} pushState - 是否推入歷史記錄
     */
    async navigate(path, pushState = true) {
        if (this.isNavigating) return;

        try {
            this.isNavigating = true;
            
            // 更新瀏覽器 URL
            if (pushState) {
                history.pushState({ path }, '', path);
            }

            // 更新狀態
            this.state.setState({ 
                currentPath: path,
                isLoading: true 
            });

            // 載入頁面
            await this.loadPage(path);

        } catch (error) {
            console.error('導航失敗:', error);
            this.handleNavigationError(error, path);
        } finally {
            this.isNavigating = false;
            this.state.setState({ isLoading: false });
        }
    }

    /**
     * 載入頁面
     * @param {string} path - 頁面路徑
     */
    async loadPage(path) {
        const pageLoader = this.routes.get(path);
        
        if (!pageLoader) {
            throw new Error(`找不到路由: ${path}`);
        }

        try {
            // 動態載入頁面模組
            const pageModule = await pageLoader();
            const PageClass = pageModule.default;
            
            // 創建頁面實例
            const pageInstance = new PageClass(this.state, this);
            
            // 載入頁面內容
            await this.renderPage(pageInstance);
            
            // 更新當前頁面
            this.currentPage = pageInstance;
            
        } catch (error) {
            console.error('載入頁面失敗:', error);
            throw error;
        }
    }

    /**
     * 渲染頁面
     * @param {Object} pageInstance - 頁面實例
     */
    async renderPage(pageInstance) {
        // 顯示載入動畫
        this.showLoadingState();
        
        try {
            // 獲取頁面內容
            const content = await pageInstance.render();
            
            // 更新內容容器
            this.updateContent(content);
            
            // 初始化頁面
            await pageInstance.init();
            
            // 滾動到頂部
            window.scrollTo(0, 0);
            
        } catch (error) {
            console.error('渲染頁面失敗:', error);
            this.showErrorState(error);
        }
    }

    /**
     * 更新內容容器
     * @param {string} content - HTML 內容
     */
    updateContent(content) {
        // 淡出動畫
        this.contentContainer.style.opacity = '0';
        
        setTimeout(() => {
            this.contentContainer.innerHTML = content;
            
            // 淡入動畫
            this.contentContainer.style.opacity = '1';
        }, 150);
    }

    /**
     * 顯示載入狀態
     */
    showLoadingState() {
        // 簡潔的載入指示器
        this.contentContainer.innerHTML = `
            <div class="loading-container" style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 200px;
                color: #6b7280;
            ">
                <div style="text-align: center;">
                    <div class="spinner" style="
                        width: 32px;
                        height: 32px;
                        border: 3px solid #f3f4f6;
                        border-top: 3px solid #2563eb;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 16px;
                    "></div>
                    <p>載入中...</p>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
    }

    /**
     * 顯示錯誤狀態
     */
    showErrorState(error) {
        this.contentContainer.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 300px;
                flex-direction: column;
                color: #374151;
            ">
                <h2 style="color: #ef4444; margin-bottom: 16px;">載入失敗</h2>
                <p style="margin-bottom: 24px; color: #6b7280;">
                    ${error.message || '發生未知錯誤'}
                </p>
                <button onclick="window.location.reload()" style="
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                ">重新載入</button>
            </div>
        `;
    }

    /**
     * 處理瀏覽器返回/前進
     */
    handlePopState(event) {
        const path = event.state?.path || this.getCurrentPath();
        this.navigate(path, false);
    }

    /**
     * 獲取當前路徑
     */
    getCurrentPath() {
        return window.location.pathname || this.defaultRoute;
    }

    /**
     * 處理導航錯誤
     */
    handleNavigationError(error, path) {
        console.error(`導航到 ${path} 失敗:`, error);
        
        // 如果不是預設路由，嘗試導航到預設路由
        if (path !== this.defaultRoute) {
            this.navigate(this.defaultRoute);
        }
    }

    /**
     * 銷毀當前頁面
     */
    destroyCurrentPage() {
        if (this.currentPage && typeof this.currentPage.destroy === 'function') {
            this.currentPage.destroy();
        }
    }
}

export { Router };