/**
 * Speaka 主應用程式
 * 模組化架構的核心控制器
 */

import { Router } from './router.js';
import { AppState } from './state.js';
import { API } from './api.js';

class SpeakaApp {
    constructor() {
        this.router = null;
        this.state = null;
        this.api = null;
        this.components = new Map();
        this.modules = new Map();
        
        this.isInitialized = false;
    }

    /**
     * 初始化應用程式
     */
    async init() {
        try {
            console.log('🚀 Speaka App 初始化中...');
            
            // 初始化核心系統
            await this.initializeCore();
            
            // 載入基礎組件
            await this.loadCoreComponents();
            
            // 設置路由
            this.setupRoutes();
            
            // 啟動應用
            await this.start();
            
            this.isInitialized = true;
            console.log('✅ Speaka App 初始化完成');
            
        } catch (error) {
            console.error('❌ App 初始化失敗:', error);
            this.handleInitError(error);
        }
    }

    /**
     * 初始化核心系統
     */
    async initializeCore() {
        // 全局狀態管理
        this.state = new AppState();
        
        // API 管理
        this.api = new API();
        
        // 路由系統
        this.router = new Router(this.state);
        
        // 綁定全局事件
        this.bindGlobalEvents();
    }

    /**
     * 載入核心組件
     */
    async loadCoreComponents() {
        try {
            // 動態載入導航列組件
            const { Navbar } = await import('../components/navbar.js');
            this.components.set('navbar', new Navbar(this.state, this.router));
            
            // 動態載入側邊欄組件
            const { Sidebar } = await import('../components/sidebar.js');
            this.components.set('sidebar', new Sidebar(this.state, this.router));
            
        } catch (error) {
            console.error('載入核心組件失敗:', error);
        }
    }

    /**
     * 設置路由
     */
    setupRoutes() {
        // 註冊頁面路由
        this.router.register('/', () => import('../pages/home.js'));
        this.router.register('/subscription', () => import('../pages/subscription.js'));
        this.router.register('/dashboard', () => import('../pages/dashboard.js'));
        
        // 設置預設路由
        this.router.setDefault('/');
    }

    /**
     * 啟動應用
     */
    async start() {
        // 初始化組件
        for (const [name, component] of this.components) {
            await component.init();
        }
        
        // 載入用戶狀態
        await this.loadUserState();
        
        // 啟動路由
        this.router.start();
    }

    /**
     * 載入用戶狀態
     */
    async loadUserState() {
        const savedProfile = localStorage.getItem('lineProfile');
        if (savedProfile) {
            try {
                const profile = JSON.parse(savedProfile);
                this.state.setState({
                    isLoggedIn: true,
                    user: profile
                });
            } catch (error) {
                console.warn('解析用戶資料失敗:', error);
                localStorage.removeItem('lineProfile');
            }
        }
    }

    /**
     * 動態載入模組
     */
    async loadModule(moduleName) {
        if (this.modules.has(moduleName)) {
            return this.modules.get(moduleName);
        }

        try {
            const moduleExports = await import(`../modules/${moduleName}/index.js`);
            const moduleInstance = new moduleExports.default(this.state, this.api);
            
            this.modules.set(moduleName, moduleInstance);
            return moduleInstance;
        } catch (error) {
            console.error(`載入模組 ${moduleName} 失敗:`, error);
            return null;
        }
    }

    /**
     * 獲取組件實例
     */
    getComponent(name) {
        return this.components.get(name);
    }

    /**
     * 綁定全局事件
     */
    bindGlobalEvents() {
        // ESC 鍵關閉側邊欄
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.state.setState({ sidebarOpen: false });
            }
        });

        // 處理瀏覽器返回按鈕
        window.addEventListener('popstate', (e) => {
            this.router.handlePopState(e);
        });

        // 處理網路狀態變化
        window.addEventListener('online', () => {
            this.state.setState({ isOnline: true });
        });

        window.addEventListener('offline', () => {
            this.state.setState({ isOnline: false });
        });
    }

    /**
     * 處理初始化錯誤
     */
    handleInitError(error) {
        // 顯示錯誤訊息
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                flex-direction: column;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                color: #374151;
            ">
                <h1 style="color: #ef4444; margin-bottom: 16px;">應用程式載入失敗</h1>
                <p style="margin-bottom: 24px;">請重新整理頁面或聯絡技術支援</p>
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
}

// 全局實例
window.SpeakaApp = SpeakaApp;

export { SpeakaApp };