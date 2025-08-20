/**
 * 認證系統狀態同步器
 * 橋接新舊兩套認證系統，確保狀態一致性
 */

import { StorageManager, AuthEventDispatcher, AUTH_EVENTS } from './storage.js';

/**
 * 認證狀態同步器
 */
export class AuthStateSynchronizer {
    constructor() {
        this.isInitialized = false;
        this.legacyNavigation = null;
        this.modernState = null;
        this.cleanup = [];
        
        // 綁定方法上下文
        this.handleStorageChange = this.handleStorageChange.bind(this);
        this.handleAuthEvent = this.handleAuthEvent.bind(this);
    }

    /**
     * 初始化同步器
     */
    async init() {
        if (this.isInitialized) return;

        console.log('AuthStateSynchronizer: 初始化中...');
        
        // 等待兩套系統載入
        await this.waitForSystems();
        
        // 建立雙向同步
        this.setupBidirectionalSync();
        
        // 初始狀態同步
        this.performInitialSync();
        
        this.isInitialized = true;
        console.log('AuthStateSynchronizer: 初始化完成');
    }

    /**
     * 等待系統載入完成
     */
    async waitForSystems() {
        // 等待舊系統 (NavigationManager)
        if (window.navigationManager) {
            this.legacyNavigation = window.navigationManager;
        }

        // 等待新系統狀態管理器
        if (window.appState) {
            this.modernState = window.appState;
        }

        console.log('AuthStateSynchronizer: 系統檢測結果', {
            legacy: !!this.legacyNavigation,
            modern: !!this.modernState
        });
    }

    /**
     * 建立雙向同步機制
     */
    setupBidirectionalSync() {
        // 1. 監聽 localStorage 變化（跨標籤頁同步）
        const storageCleanup = StorageManager.onStorageChange(this.handleStorageChange);
        this.cleanup.push(storageCleanup);

        // 2. 監聽認證事件
        const authCleanup = AuthEventDispatcher.listen(AUTH_EVENTS.STATE_CHANGE, this.handleAuthEvent);
        this.cleanup.push(authCleanup);

        // 3. 劫持舊系統的關鍵方法
        this.interceptLegacyMethods();

        // 4. 訂閱新系統的狀態變化
        this.subscribeToModernState();
    }

    /**
     * 劫持舊系統方法
     */
    interceptLegacyMethods() {
        if (!this.legacyNavigation) return;

        // 劫持 showUserProfile 方法
        const originalShowUserProfile = this.legacyNavigation.showUserProfile;
        if (originalShowUserProfile) {
            this.legacyNavigation.showUserProfile = (profile) => {
                console.log('AuthStateSynchronizer: 舊系統登入', profile);
                
                // 執行原始方法
                originalShowUserProfile.call(this.legacyNavigation, profile);
                
                // 同步到新系統
                this.syncToModernSystem({ isLoggedIn: true, user: profile });
                
                // 分發事件
                AuthEventDispatcher.dispatch(AUTH_EVENTS.LOGIN, profile);
            };
        }

        // 劫持 showLoginButton 方法
        const originalShowLoginButton = this.legacyNavigation.showLoginButton;
        if (originalShowLoginButton) {
            this.legacyNavigation.showLoginButton = () => {
                console.log('AuthStateSynchronizer: 舊系統登出');
                
                // 執行原始方法
                originalShowLoginButton.call(this.legacyNavigation);
                
                // 同步到新系統
                this.syncToModernSystem({ isLoggedIn: false, user: null });
                
                // 分發事件
                AuthEventDispatcher.dispatch(AUTH_EVENTS.LOGOUT);
            };
        }

        // 劫持 logout 方法
        const originalLogout = this.legacyNavigation.logout;
        if (originalLogout) {
            this.legacyNavigation.logout = () => {
                console.log('AuthStateSynchronizer: 舊系統執行登出');
                
                // 執行原始方法（但移除重複的頁面刷新）
                StorageManager.clearAuthData();
                this.legacyNavigation.showLoginButton();
                this.legacyNavigation.closeSidePanel();
                
                // 同步到新系統
                this.syncToModernSystem({ isLoggedIn: false, user: null });
                
                // 統一的登出後處理
                this.handleUnifiedLogout();
            };
        }
    }

    /**
     * 訂閱新系統狀態變化
     */
    subscribeToModernState() {
        if (!this.modernState || !this.modernState.subscribe) return;

        const unsubscribe = this.modernState.subscribe((newState, oldState) => {
            console.log('AuthStateSynchronizer: 新系統狀態變化', { newState, oldState });
            
            // 檢查認證狀態是否變化
            if (oldState.isLoggedIn !== newState.isLoggedIn) {
                this.syncToLegacySystem(newState);
                
                // 分發事件
                const eventType = newState.isLoggedIn ? AUTH_EVENTS.LOGIN : AUTH_EVENTS.LOGOUT;
                AuthEventDispatcher.dispatch(eventType, newState.user);
            }
        });

        this.cleanup.push(unsubscribe);
    }

    /**
     * 處理 localStorage 變化
     */
    handleStorageChange(key, oldValue, newValue) {
        console.log('AuthStateSynchronizer: localStorage 變化', { key, oldValue, newValue });
        
        // 當用戶資料變化時，同步兩套系統
        if (key === StorageManager.STORAGE_KEYS.LINE_PROFILE) {
            const profile = newValue ? JSON.parse(newValue) : null;
            const isLoggedIn = !!profile;
            
            this.syncBothSystems({ isLoggedIn, user: profile });
        }
    }

    /**
     * 處理認證事件
     */
    handleAuthEvent(event) {
        console.log('AuthStateSynchronizer: 認證事件', event.type, event.detail);
        
        // 確保 UI 同步更新
        setTimeout(() => {
            this.ensureUIConsistency();
        }, 100);
    }

    /**
     * 執行初始狀態同步
     */
    performInitialSync() {
        const profile = StorageManager.getUserProfile();
        const isLoggedIn = StorageManager.isLoggedIn();
        
        console.log('AuthStateSynchronizer: 初始狀態同步', { profile, isLoggedIn });
        
        this.syncBothSystems({ isLoggedIn, user: profile });
    }

    /**
     * 同步到新系統
     */
    syncToModernSystem(state) {
        if (!this.modernState) return;
        
        try {
            if (state.isLoggedIn && state.user) {
                this.modernState.login(state.user);
            } else {
                this.modernState.logout();
            }
        } catch (error) {
            console.warn('AuthStateSynchronizer: 同步到新系統失敗', error);
        }
    }

    /**
     * 同步到舊系統
     */
    syncToLegacySystem(state) {
        if (!this.legacyNavigation) return;
        
        try {
            if (state.isLoggedIn && state.user) {
                // 避免無限循環，直接調用原始方法
                const originalMethod = this.legacyNavigation.constructor.prototype.showUserProfile;
                if (originalMethod) {
                    originalMethod.call(this.legacyNavigation, state.user);
                }
            } else {
                // 避免無限循環，直接調用原始方法
                const originalMethod = this.legacyNavigation.constructor.prototype.showLoginButton;
                if (originalMethod) {
                    originalMethod.call(this.legacyNavigation);
                }
            }
        } catch (error) {
            console.warn('AuthStateSynchronizer: 同步到舊系統失敗', error);
        }
    }

    /**
     * 同步兩套系統
     */
    syncBothSystems(state) {
        this.syncToLegacySystem(state);
        this.syncToModernSystem(state);
    }

    /**
     * 統一的登出處理
     */
    handleUnifiedLogout() {
        console.log('AuthStateSynchronizer: 執行統一登出流程');
        
        // 延遲執行頁面跳轉，確保狀態同步完成
        setTimeout(() => {
            // 強制重新整理整個頁面，清除所有快取和狀態
            // 使用時間戳強制重新載入，繞過瀏覽器快取
            window.location.href = '/?t=' + Date.now();
        }, 500);
    }

    /**
     * 確保 UI 一致性
     */
    ensureUIConsistency() {
        const isLoggedIn = StorageManager.isLoggedIn();
        const profile = StorageManager.getUserProfile();
        
        // 檢查並修復 UI 不一致的問題
        const loginBtn = document.getElementById('lineLoginBtn');
        const userProfile = document.getElementById('userProfile');
        
        if (loginBtn && userProfile) {
            if (isLoggedIn) {
                loginBtn.style.display = 'none';
                userProfile.style.display = 'block';
            } else {
                loginBtn.style.display = 'block';
                userProfile.style.display = 'none';
            }
        }
    }

    /**
     * 清理資源
     */
    destroy() {
        console.log('AuthStateSynchronizer: 清理資源');
        
        // 執行所有清理函數
        this.cleanup.forEach(cleanup => {
            if (typeof cleanup === 'function') {
                cleanup();
            }
        });
        
        this.cleanup = [];
        this.isInitialized = false;
    }
}

/**
 * 全域同步器實例
 */
let globalSynchronizer = null;

/**
 * 初始化全域同步器
 */
export async function initializeAuthSync() {
    if (globalSynchronizer) {
        console.warn('AuthStateSynchronizer: 已經初始化過了');
        return globalSynchronizer;
    }

    globalSynchronizer = new AuthStateSynchronizer();
    await globalSynchronizer.init();
    
    // 將同步器綁定到全域，方便調試
    window.authSynchronizer = globalSynchronizer;
    
    return globalSynchronizer;
}

/**
 * 獲取全域同步器
 */
export function getAuthSynchronizer() {
    return globalSynchronizer;
}