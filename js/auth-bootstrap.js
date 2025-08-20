/**
 * 認證系統啟動器
 * 自動檢測並初始化適當的認證系統
 */

import { initializeAuthSync } from './utils/auth-sync.js';

/**
 * 認證系統啟動器
 */
class AuthBootstrap {
    constructor() {
        this.isInitialized = false;
    }

    /**
     * 初始化認證系統
     */
    async init() {
        if (this.isInitialized) return;

        console.log('AuthBootstrap: 開始初始化認證系統');

        try {
            // 等待 DOM 載入完成
            await this.waitForDOM();

            // 檢測頁面類型和可用系統
            const systemInfo = this.detectSystems();
            console.log('AuthBootstrap: 系統檢測結果', systemInfo);

            // 初始化同步機制
            if (systemInfo.needsSync) {
                await this.initializeSync();
            }

            // 執行頁面特定的初始化
            await this.initializePageSpecific(systemInfo);

            this.isInitialized = true;
            console.log('AuthBootstrap: 認證系統初始化完成');

        } catch (error) {
            console.error('AuthBootstrap: 初始化失敗', error);
        }
    }

    /**
     * 等待 DOM 載入完成
     */
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    /**
     * 檢測可用的認證系統
     */
    detectSystems() {
        const isIndexPage = window.location.pathname === '/' || window.location.pathname.includes('index.html');
        const hasNavigationManager = !!window.navigationManager;
        const hasModernState = !!window.appState;
        const hasLegacyElements = !!(
            document.getElementById('lineLoginBtn') || 
            document.getElementById('userProfile')
        );
        const hasModernElements = !!(
            document.querySelector('.top-nav') ||
            document.querySelector('.sidebar-container')
        );

        const needsSync = hasNavigationManager && (hasModernState || hasModernElements);

        return {
            isIndexPage,
            hasNavigationManager,
            hasModernState,
            hasLegacyElements,
            hasModernElements,
            needsSync
        };
    }

    /**
     * 初始化同步機制
     */
    async initializeSync() {
        console.log('AuthBootstrap: 初始化同步機制');
        
        // 等待一下確保所有系統都載入完成
        await new Promise(resolve => setTimeout(resolve, 200));

        try {
            await initializeAuthSync();
            console.log('AuthBootstrap: 同步機制初始化成功');
        } catch (error) {
            console.error('AuthBootstrap: 同步機制初始化失敗', error);
        }
    }

    /**
     * 頁面特定初始化
     */
    async initializePageSpecific(systemInfo) {
        if (systemInfo.isIndexPage && systemInfo.hasNavigationManager) {
            console.log('AuthBootstrap: 主頁特定初始化');
            await this.initializeIndexPage();
        }

        if (systemInfo.hasModernState) {
            console.log('AuthBootstrap: 現代系統特定初始化');
            await this.initializeModernSystem();
        }
    }

    /**
     * 主頁特定初始化
     */
    async initializeIndexPage() {
        // 確保 NavigationManager 正確初始化
        if (window.navigationManager && typeof window.navigationManager.init === 'function') {
            try {
                await window.navigationManager.init();
            } catch (error) {
                console.warn('AuthBootstrap: NavigationManager 初始化警告', error);
            }
        }

        // 檢查並修復初始登入狀態顯示
        setTimeout(() => {
            this.fixInitialUIState();
        }, 100);
    }

    /**
     * 現代系統初始化
     */
    async initializeModernSystem() {
        // 如果現代系統存在但未初始化，則初始化它
        if (window.appState && typeof window.appState.init === 'function') {
            try {
                await window.appState.init();
            } catch (error) {
                console.warn('AuthBootstrap: Modern State 初始化警告', error);
            }
        }
    }

    /**
     * 修復初始 UI 狀態
     */
    fixInitialUIState() {
        // 檢查 localStorage 中的登入狀態
        const profile = localStorage.getItem('lineProfile');
        const isLoggedIn = !!(profile && localStorage.getItem('lineAccessToken'));

        console.log('AuthBootstrap: 修復初始 UI 狀態', { isLoggedIn, hasProfile: !!profile });

        // 修復登入按鈕和用戶資料顯示
        const loginBtn = document.getElementById('lineLoginBtn');
        const userProfile = document.getElementById('userProfile');
        const heroLoginBtn = document.getElementById('heroLineLoginBtn');

        if (isLoggedIn && profile) {
            // 已登入狀態
            if (loginBtn) loginBtn.style.display = 'none';
            if (heroLoginBtn) heroLoginBtn.style.display = 'none';
            if (userProfile) {
                userProfile.style.display = 'block';
                
                // 更新用戶頭像和名稱
                try {
                    const userData = JSON.parse(profile);
                    const userAvatar = document.getElementById('userAvatar');
                    if (userAvatar && userData.displayName) {
                        // 由於我們移除了頭像，這裡可以顯示用戶名稱的首字
                        userAvatar.textContent = userData.displayName.charAt(0);
                        userAvatar.title = `歡迎，${userData.displayName}`;
                    }
                } catch (error) {
                    console.warn('AuthBootstrap: 解析用戶資料失敗', error);
                }
            }
        } else {
            // 未登入狀態
            if (loginBtn) loginBtn.style.display = 'block';
            if (heroLoginBtn) heroLoginBtn.style.display = 'block';
            if (userProfile) userProfile.style.display = 'none';
        }
    }
}

/**
 * 全域啟動器實例
 */
let globalBootstrap = null;

/**
 * 自動初始化
 */
async function autoInitialize() {
    if (globalBootstrap) return globalBootstrap;

    globalBootstrap = new AuthBootstrap();
    
    // 綁定到全域以便調試
    window.authBootstrap = globalBootstrap;
    
    await globalBootstrap.init();
    return globalBootstrap;
}

// 自動啟動
if (typeof window !== 'undefined') {
    // 如果是在瀏覽器環境中，自動初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInitialize);
    } else {
        // DOM 已經載入完成，延遲一點點執行
        setTimeout(autoInitialize, 50);
    }
}

export { AuthBootstrap, autoInitialize };