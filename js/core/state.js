/**
 * 全局狀態管理系統
 * 支援響應式更新和持久化存儲
 */

class AppState {
    constructor() {
        this.state = {
            // 用戶狀態
            isLoggedIn: false,
            user: null,
            
            // 導航狀態
            currentPath: '/',
            isLoading: false,
            
            // UI 狀態
            sidebarOpen: false,
            modalOpen: false,
            
            // 應用狀態
            isOnline: navigator.onLine,
            deviceType: this.detectDeviceType(),
            
            // 業務狀態
            subscriptions: [],
            groups: [],
            notifications: []
        };
        
        this.subscribers = [];
        this.history = [];
        this.maxHistorySize = 10;
        
        // 初始化
        this.loadFromStorage();
        this.bindStorageEvents();
    }

    /**
     * 獲取當前狀態
     */
    getState() {
        return { ...this.state };
    }

    /**
     * 更新狀態
     */
    setState(updates) {
        // 保存歷史狀態
        this.saveToHistory();
        
        // 更新狀態
        const oldState = { ...this.state };
        this.state = { ...this.state, ...updates };
        
        // 持久化重要狀態
        this.saveToStorage();
        
        // 通知訂閱者
        this.notifySubscribers(oldState, this.state);
        
        // 開發模式下的狀態日誌
        if (this.isDevelopment()) {
            console.log('🔄 State Updated:', { oldState, newState: this.state, updates });
        }
    }

    /**
     * 訂閱狀態變化
     */
    subscribe(callback) {
        this.subscribers.push(callback);
        
        // 返回取消訂閱函數
        return () => {
            const index = this.subscribers.indexOf(callback);
            if (index > -1) {
                this.subscribers.splice(index, 1);
            }
        };
    }

    /**
     * 通知所有訂閱者
     */
    notifySubscribers(oldState, newState) {
        this.subscribers.forEach(callback => {
            try {
                callback(newState, oldState);
            } catch (error) {
                console.error('State subscriber error:', error);
            }
        });
    }

    /**
     * 用戶登入
     */
    login(userProfile) {
        this.setState({
            isLoggedIn: true,
            user: userProfile
        });
        
        // 觸發登入成功事件
        this.dispatchEvent('user:login', userProfile);
    }

    /**
     * 用戶登出
     */
    logout() {
        const oldUser = this.state.user;
        
        this.setState({
            isLoggedIn: false,
            user: null,
            sidebarOpen: false,
            subscriptions: [],
            groups: []
        });
        
        // 清理本地存儲的敏感資料
        this.clearSensitiveStorage();
        
        // 觸發登出事件
        this.dispatchEvent('user:logout', oldUser);
    }

    /**
     * 設置載入狀態
     */
    setLoading(isLoading, message = '') {
        this.setState({
            isLoading,
            loadingMessage: message
        });
    }

    /**
     * 導航到新頁面
     */
    navigate(path) {
        if (path !== this.state.currentPath) {
            this.setState({
                currentPath: path,
                sidebarOpen: false  // 導航時關閉側邊欄
            });
        }
    }

    /**
     * 切換側邊欄
     */
    toggleSidebar() {
        this.setState({
            sidebarOpen: !this.state.sidebarOpen
        });
    }

    /**
     * 添加通知
     */
    addNotification(notification) {
        const notifications = [...this.state.notifications];
        notifications.unshift({
            id: Date.now(),
            timestamp: new Date(),
            ...notification
        });
        
        // 最多保留 50 個通知
        if (notifications.length > 50) {
            notifications.splice(50);
        }
        
        this.setState({ notifications });
    }

    /**
     * 移除通知
     */
    removeNotification(id) {
        const notifications = this.state.notifications.filter(n => n.id !== id);
        this.setState({ notifications });
    }

    /**
     * 更新訂閱資料
     */
    updateSubscriptions(subscriptions) {
        this.setState({ subscriptions });
    }

    /**
     * 更新群組資料
     */
    updateGroups(groups) {
        this.setState({ groups });
    }

    /**
     * 保存到本地存儲
     */
    saveToStorage() {
        try {
            const persistentState = {
                user: this.state.user,
                isLoggedIn: this.state.isLoggedIn,
                subscriptions: this.state.subscriptions,
                groups: this.state.groups
            };
            
            localStorage.setItem('speaka_state', JSON.stringify(persistentState));
        } catch (error) {
            console.warn('保存狀態到本地存儲失敗:', error);
        }
    }

    /**
     * 從本地存儲載入
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('speaka_state');
            if (saved) {
                const persistentState = JSON.parse(saved);
                this.state = { ...this.state, ...persistentState };
            }
        } catch (error) {
            console.warn('從本地存儲載入狀態失敗:', error);
            localStorage.removeItem('speaka_state');
        }
    }

    /**
     * 清理敏感資料
     */
    clearSensitiveStorage() {
        localStorage.removeItem('lineProfile');
        localStorage.removeItem('lineAccessToken');
        localStorage.removeItem('speaka_state');
    }

    /**
     * 綁定存儲事件
     */
    bindStorageEvents() {
        // 監聽其他標籤頁的狀態變化
        window.addEventListener('storage', (e) => {
            if (e.key === 'speaka_state' && e.newValue) {
                try {
                    const newState = JSON.parse(e.newValue);
                    this.setState(newState);
                } catch (error) {
                    console.warn('同步其他標籤頁狀態失敗:', error);
                }
            }
        });
    }

    /**
     * 保存到歷史記錄
     */
    saveToHistory() {
        this.history.push({ ...this.state });
        
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    /**
     * 撤銷到上一個狀態
     */
    undo() {
        if (this.history.length > 0) {
            const previousState = this.history.pop();
            this.state = previousState;
            this.notifySubscribers({}, this.state);
        }
    }

    /**
     * 檢測設備類型
     */
    detectDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }

    /**
     * 判斷是否為開發模式
     */
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';
    }

    /**
     * 觸發自定義事件
     */
    dispatchEvent(eventName, data) {
        const event = new CustomEvent(eventName, {
            detail: data
        });
        window.dispatchEvent(event);
    }

    /**
     * 獲取狀態快照
     */
    getSnapshot() {
        return {
            state: { ...this.state },
            timestamp: new Date(),
            subscribers: this.subscribers.length,
            historySize: this.history.length
        };
    }

    /**
     * 重置狀態
     */
    reset() {
        this.state = {
            isLoggedIn: false,
            user: null,
            currentPath: '/',
            isLoading: false,
            sidebarOpen: false,
            modalOpen: false,
            isOnline: navigator.onLine,
            deviceType: this.detectDeviceType(),
            subscriptions: [],
            groups: [],
            notifications: []
        };
        
        this.clearSensitiveStorage();
        this.notifySubscribers({}, this.state);
    }
}

export { AppState };