/**
 * Mobile First 導航組件
 * 支援頂部導航 + 底部標籤導航
 */

class Navbar {
    constructor(state, router) {
        this.state = state;
        this.router = router;
        this.topNavElement = null;
        this.bottomNavElement = null;
        
        // 訂閱狀態變化
        this.state.subscribe((newState) => this.handleStateChange(newState));
    }

    /**
     * 初始化導航組件
     */
    async init() {
        this.createTopNavigation();
        this.createBottomNavigation();
        this.bindEvents();
        
        console.log('📱 Mobile 導航組件已初始化');
    }

    /**
     * 創建頂部導航
     */
    createTopNavigation() {
        // 創建頂部導航容器
        this.topNavElement = document.createElement('nav');
        this.topNavElement.className = 'top-nav';
        this.topNavElement.innerHTML = this.getTopNavHTML();
        
        // 插入到頁面頂部
        document.body.insertBefore(this.topNavElement, document.body.firstChild);
    }

    /**
     * 創建底部導航 (手機專用)
     */
    createBottomNavigation() {
        this.bottomNavElement = document.createElement('nav');
        this.bottomNavElement.className = 'mobile-nav';
        this.bottomNavElement.innerHTML = this.getBottomNavHTML();
        
        // 插入到頁面底部
        document.body.appendChild(this.bottomNavElement);
    }

    /**
     * 頂部導航 HTML
     */
    getTopNavHTML() {
        const { isLoggedIn, user, currentPath } = this.state.getState();
        
        return `
            <div class="top-nav-content">
                <div class="top-nav-left">
                    <h1 class="top-nav-title">Speaka</h1>
                </div>
                
                <div class="top-nav-actions">
                    ${this.getTopNavActions(isLoggedIn, user)}
                </div>
            </div>
        `;
    }

    /**
     * 頂部導航操作區域
     */
    getTopNavActions(isLoggedIn, user) {
        if (isLoggedIn && user) {
            return `
                <button class="user-avatar-btn" id="userAvatarBtn" style="
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: none;
                    overflow: hidden;
                    cursor: pointer;
                    background: var(--bg-secondary);
                ">
                    <img src="${user.pictureUrl}" alt="用戶頭像" style="
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    ">
                </button>
            `;
        } else {
            return `
                <button class="btn btn-primary btn-sm" id="topLoginBtn" style="
                    background: #00B900;
                    min-height: 36px;
                    padding: 8px 16px;
                    font-size: 14px;
                ">
                    LINE 登入
                </button>
            `;
        }
    }

    /**
     * 底部導航 HTML (手機專用)
     */
    getBottomNavHTML() {
        const { currentPath } = this.state.getState();
        
        const navItems = [
            { path: '/', icon: '🏠', text: '首頁', id: 'nav-home' },
            { path: '/subscription', icon: '💳', text: '訂閱', id: 'nav-subscription' },
            { path: '/dashboard', icon: '📊', text: '控制台', id: 'nav-dashboard' },
            { path: '/profile', icon: '👤', text: '我的', id: 'nav-profile' }
        ];

        const navItemsHTML = navItems.map(item => `
            <a href="${item.path}" 
               class="mobile-nav-item ${currentPath === item.path ? 'active' : ''}" 
               id="${item.id}"
               data-path="${item.path}">
                <span class="mobile-nav-icon">${item.icon}</span>
                <span class="mobile-nav-text">${item.text}</span>
            </a>
        `).join('');

        return `
            <ul class="mobile-nav-list">
                ${navItemsHTML}
            </ul>
        `;
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 頂部導航事件
        this.bindTopNavEvents();
        
        // 底部導航事件
        this.bindBottomNavEvents();
    }

    /**
     * 頂部導航事件
     */
    bindTopNavEvents() {
        // 用戶頭像點擊
        const userAvatarBtn = document.getElementById('userAvatarBtn');
        if (userAvatarBtn) {
            userAvatarBtn.addEventListener('click', () => {
                this.state.setState({ sidebarOpen: true });
            });
        }

        // 登入按鈕點擊
        const topLoginBtn = document.getElementById('topLoginBtn');
        if (topLoginBtn) {
            topLoginBtn.addEventListener('click', () => {
                this.handleLogin();
            });
        }
    }

    /**
     * 底部導航事件
     */
    bindBottomNavEvents() {
        // 底部導航項目點擊
        const navItems = this.bottomNavElement.querySelectorAll('.mobile-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                const path = item.dataset.path;
                
                // 檢查是否需要登入
                if (this.requiresAuth(path) && !this.state.getState().isLoggedIn) {
                    this.showLoginPrompt();
                    return;
                }
                
                // 導航到目標頁面
                this.router.navigate(path);
            });
        });
    }

    /**
     * 處理登入
     */
    async handleLogin() {
        try {
            // 載入登入模組
            const authModule = await import('../modules/auth/line-login.js');
            const lineLogin = new authModule.default(this.state);
            
            await lineLogin.login();
            
        } catch (error) {
            console.error('登入失敗:', error);
            this.showError('登入失敗，請稍後再試');
        }
    }

    /**
     * 檢查頁面是否需要登入
     */
    requiresAuth(path) {
        const authRequiredPaths = ['/dashboard', '/profile'];
        return authRequiredPaths.includes(path);
    }

    /**
     * 顯示登入提示
     */
    showLoginPrompt() {
        // 簡潔的手機端提示
        const shouldLogin = confirm('此功能需要登入，是否現在登入？');
        if (shouldLogin) {
            this.handleLogin();
        }
    }

    /**
     * 顯示錯誤訊息
     */
    showError(message) {
        // 創建簡潔的錯誤提示
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.style.cssText = `
            position: fixed;
            top: calc(var(--touch-target) + var(--space-md) + env(safe-area-inset-top) + 16px);
            left: 50%;
            transform: translateX(-50%);
            background: var(--error);
            color: white;
            padding: 12px 20px;
            border-radius: var(--radius);
            z-index: 1000;
            font-size: 14px;
            font-weight: 500;
            box-shadow: var(--shadow-lg);
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // 3秒後自動移除
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }

    /**
     * 處理狀態變化
     */
    handleStateChange(newState) {
        // 重新渲染導航
        this.updateNavigation(newState);
    }

    /**
     * 更新導航狀態
     */
    updateNavigation(state) {
        // 更新頂部導航
        if (this.topNavElement) {
            this.topNavElement.innerHTML = this.getTopNavHTML();
            this.bindTopNavEvents();
        }

        // 更新底部導航活動狀態
        this.updateBottomNavActive(state.currentPath);
    }

    /**
     * 更新底部導航活動狀態
     */
    updateBottomNavActive(currentPath) {
        const navItems = this.bottomNavElement.querySelectorAll('.mobile-nav-item');
        navItems.forEach(item => {
            if (item.dataset.path === currentPath) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * 銷毀組件
     */
    destroy() {
        if (this.topNavElement && this.topNavElement.parentNode) {
            this.topNavElement.parentNode.removeChild(this.topNavElement);
        }
        
        if (this.bottomNavElement && this.bottomNavElement.parentNode) {
            this.bottomNavElement.parentNode.removeChild(this.bottomNavElement);
        }
    }
}

export { Navbar };