/**
 * 統一的 localStorage 管理工具
 * 確保兩套認證系統使用相同的鍵值和格式
 */

export const STORAGE_KEYS = {
    LINE_PROFILE: 'lineProfile',
    LINE_TOKEN: 'lineAccessToken',
    APP_STATE: 'speaka_state'
};

/**
 * localStorage 操作工具類
 */
export class StorageManager {
    /**
     * 獲取用戶資料
     */
    static getUserProfile() {
        try {
            const profile = localStorage.getItem(STORAGE_KEYS.LINE_PROFILE);
            return profile ? JSON.parse(profile) : null;
        } catch (error) {
            console.warn('獲取用戶資料失敗:', error);
            return null;
        }
    }

    /**
     * 儲存用戶資料
     */
    static setUserProfile(profile) {
        try {
            localStorage.setItem(STORAGE_KEYS.LINE_PROFILE, JSON.stringify(profile));
            return true;
        } catch (error) {
            console.warn('儲存用戶資料失敗:', error);
            return false;
        }
    }

    /**
     * 獲取訪問令牌
     */
    static getAccessToken() {
        return localStorage.getItem(STORAGE_KEYS.LINE_TOKEN);
    }

    /**
     * 儲存訪問令牌
     */
    static setAccessToken(token) {
        try {
            localStorage.setItem(STORAGE_KEYS.LINE_TOKEN, token);
            return true;
        } catch (error) {
            console.warn('儲存令牌失敗:', error);
            return false;
        }
    }

    /**
     * 檢查是否已登入
     */
    static isLoggedIn() {
        const profile = this.getUserProfile();
        const token = this.getAccessToken();
        return !!(profile && token);
    }

    /**
     * 清除所有認證資料
     */
    static clearAuthData() {
        try {
            localStorage.removeItem(STORAGE_KEYS.LINE_PROFILE);
            localStorage.removeItem(STORAGE_KEYS.LINE_TOKEN);
            return true;
        } catch (error) {
            console.warn('清除認證資料失敗:', error);
            return false;
        }
    }

    /**
     * 監聽 localStorage 變化
     */
    static onStorageChange(callback) {
        const handler = (e) => {
            if (Object.values(STORAGE_KEYS).includes(e.key)) {
                callback(e.key, e.oldValue, e.newValue);
            }
        };
        
        window.addEventListener('storage', handler);
        
        // 返回清理函數
        return () => {
            window.removeEventListener('storage', handler);
        };
    }

    /**
     * 觸發自定義儲存事件（同標籤頁內）
     */
    static dispatchStorageEvent(key, oldValue, newValue) {
        const event = new StorageEvent('storage', {
            key,
            oldValue,
            newValue,
            url: window.location.href,
            storageArea: localStorage
        });
        
        window.dispatchEvent(event);
    }
}

/**
 * 用戶狀態事件
 */
export const AUTH_EVENTS = {
    LOGIN: 'auth:login',
    LOGOUT: 'auth:logout',
    STATE_CHANGE: 'auth:state_change'
};

/**
 * 認證事件分發器
 */
export class AuthEventDispatcher {
    static dispatch(eventType, detail = null) {
        const event = new CustomEvent(eventType, { detail });
        window.dispatchEvent(event);
    }

    static listen(eventType, callback) {
        window.addEventListener(eventType, callback);
        
        // 返回清理函數
        return () => {
            window.removeEventListener(eventType, callback);
        };
    }
}