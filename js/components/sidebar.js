/**
 * 側邊欄組件
 * Mobile First 設計的用戶面板
 */

class Sidebar {
    constructor(state, router) {
        this.state = state;
        this.router = router;
        this.element = null;
        this.isAnimating = false;
        
        // 訂閱狀態變化
        this.unsubscribe = this.state.subscribe((newState) => {
            this.handleStateChange(newState);
        });
    }

    /**
     * 初始化側邊欄
     */
    async init() {
        this.createElement();
        this.bindEvents();
    }

    /**
     * 創建側邊欄元素
     */
    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'sidebar-container';
        this.element.innerHTML = this.getHTML();
        
        // 添加到頁面
        document.body.appendChild(this.element);
    }

    /**
     * 獲取側邊欄 HTML
     */
    getHTML() {
        const { isLoggedIn, user, sidebarOpen } = this.state.getState();
        
        return `
            <div class="sidebar-overlay ${sidebarOpen ? 'active' : ''}" id="sidebarOverlay"></div>
            <div class="sidebar ${sidebarOpen ? 'active' : ''}" id="sidebar">
                ${isLoggedIn ? this.getLoggedInContent(user) : this.getLoggedOutContent()}
            </div>
        `;
    }

    /**
     * 已登入用戶的側邊欄內容
     */
    getLoggedInContent(user) {
        return `
            <!-- 用戶資訊區域 -->
            <div class="sidebar-header">
                <div class="user-info">
                    <div class="user-welcome-icon">👋</div>
                    <div class="user-details">
                        <h3 class="user-name">歡迎，${user.displayName}</h3>
                        <p class="user-id">@${user.userId}</p>
                    </div>
                </div>
                <button class="close-btn" id="closeSidebar">
                    <span>✕</span>
                </button>
            </div>

            <!-- 導航選單 -->
            <div class="sidebar-content">
                <div class="menu-section">
                    <h4 class="section-title">主要功能</h4>
                    <nav class="menu-list">
                        <a href="/dashboard" class="menu-item" data-path="/dashboard">
                            <span class="menu-icon">📊</span>
                            <span class="menu-text">控制台</span>
                            <span class="menu-arrow">›</span>
                        </a>
                        <a href="/subscription" class="menu-item" data-path="/subscription">
                            <span class="menu-icon">💳</span>
                            <span class="menu-text">我的訂閱</span>
                            <span class="menu-arrow">›</span>
                        </a>
                        <a href="/groups" class="menu-item" data-path="/groups">
                            <span class="menu-icon">👥</span>
                            <span class="menu-text">群組管理</span>
                            <span class="menu-arrow">›</span>
                        </a>
                        <a href="/analytics" class="menu-item" data-path="/analytics">
                            <span class="menu-icon">📈</span>
                            <span class="menu-text">使用統計</span>
                            <span class="menu-arrow">›</span>
                        </a>
                    </nav>
                </div>

                <div class="menu-section">
                    <h4 class="section-title">設定</h4>
                    <nav class="menu-list">
                        <a href="/settings" class="menu-item" data-path="/settings">
                            <span class="menu-icon">⚙️</span>
                            <span class="menu-text">帳戶設定</span>
                            <span class="menu-arrow">›</span>
                        </a>
                        <a href="/notifications" class="menu-item" data-path="/notifications">
                            <span class="menu-icon">🔔</span>
                            <span class="menu-text">通知設定</span>
                            <span class="menu-arrow">›</span>
                        </a>
                        <a href="/language" class="menu-item" data-path="/language">
                            <span class="menu-icon">🌐</span>
                            <span class="menu-text">語言偏好</span>
                            <span class="menu-arrow">›</span>
                        </a>
                    </nav>
                </div>

                <div class="menu-section">
                    <h4 class="section-title">支援</h4>
                    <nav class="menu-list">
                        <a href="https://line.me/ti/p/@181bmdeuclaude" target="_blank" class="menu-item">
                            <span class="menu-icon">💬</span>
                            <span class="menu-text">聯絡客服</span>
                            <span class="menu-arrow">↗</span>
                        </a>
                        <a href="/help" class="menu-item" data-path="/help">
                            <span class="menu-icon">❓</span>
                            <span class="menu-text">使用說明</span>
                            <span class="menu-arrow">›</span>
                        </a>
                        <a href="/about" class="menu-item" data-path="/about">
                            <span class="menu-icon">ℹ️</span>
                            <span class="menu-text">關於 Speaka</span>
                            <span class="menu-arrow">›</span>
                        </a>
                    </nav>
                </div>
            </div>

            <!-- 登出按鈕 -->
            <div class="sidebar-footer">
                <button class="logout-btn" id="logoutBtn">
                    <span class="menu-icon">🚪</span>
                    <span>登出</span>
                </button>
            </div>
        `;
    }

    /**
     * 未登入用戶的側邊欄內容
     */
    getLoggedOutContent() {
        return `
            <!-- 未登入狀態 -->
            <div class="sidebar-header">
                <div class="login-prompt">
                    <div class="login-icon">👤</div>
                    <h3>歡迎使用 Speaka</h3>
                    <p>請先登入以使用完整功能</p>
                </div>
                <button class="close-btn" id="closeSidebar">
                    <span>✕</span>
                </button>
            </div>

            <div class="sidebar-content">
                <div class="login-section">
                    <button class="btn-line-login" id="sidebarLoginBtn">
                        <span class="menu-icon">💬</span>
                        <span>LINE 登入</span>
                    </button>
                </div>

                <div class="menu-section">
                    <h4 class="section-title">瀏覽功能</h4>
                    <nav class="menu-list">
                        <a href="/" class="menu-item" data-path="/">
                            <span class="menu-icon">🏠</span>
                            <span class="menu-text">首頁</span>
                            <span class="menu-arrow">›</span>
                        </a>
                        <a href="/subscription" class="menu-item" data-path="/subscription">
                            <span class="menu-icon">💳</span>
                            <span class="menu-text">訂閱方案</span>
                            <span class="menu-arrow">›</span>
                        </a>
                        <a href="/features" class="menu-item" data-path="/features">
                            <span class="menu-icon">⭐</span>
                            <span class="menu-text">功能介紹</span>
                            <span class="menu-arrow">›</span>
                        </a>
                    </nav>
                </div>

                <div class="menu-section">
                    <h4 class="section-title">支援</h4>
                    <nav class="menu-list">
                        <a href="https://line.me/ti/p/@181bmdeuclaude" target="_blank" class="menu-item">
                            <span class="menu-icon">💬</span>
                            <span class="menu-text">聯絡客服</span>
                            <span class="menu-arrow">↗</span>
                        </a>
                        <a href="/help" class="menu-item" data-path="/help">
                            <span class="menu-icon">❓</span>
                            <span class="menu-text">常見問題</span>
                            <span class="menu-arrow">›</span>
                        </a>
                    </nav>
                </div>
            </div>
        `;
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 關閉按鈕
        this.bindCloseEvents();
        
        // 選單項目
        this.bindMenuEvents();
        
        // 登入/登出按鈕
        this.bindAuthEvents();
        
        // 手勢支援
        this.bindGestureEvents();
    }

    /**
     * 綁定關閉事件
     */
    bindCloseEvents() {
        // 關閉按鈕
        const closeBtn = this.element.querySelector('#closeSidebar');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.close();
            });
        }

        // 覆蓋層點擊
        const overlay = this.element.querySelector('#sidebarOverlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.close();
            });
        }

        // ESC 鍵
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.getState().sidebarOpen) {
                this.close();
            }
        });
    }

    /**
     * 綁定選單事件
     */
    bindMenuEvents() {
        const menuItems = this.element.querySelectorAll('.menu-item[data-path]');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                const path = item.dataset.path;
                this.navigate(path);
            });
        });
    }

    /**
     * 綁定認證事件
     */
    bindAuthEvents() {
        // 側邊欄登入按鈕
        const loginBtn = this.element.querySelector('#sidebarLoginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.handleLogin();
            });
        }

        // 登出按鈕
        const logoutBtn = this.element.querySelector('#logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    }

    /**
     * 綁定手勢事件
     */
    bindGestureEvents() {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        const sidebar = this.element.querySelector('#sidebar');
        
        // 觸控開始
        sidebar.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        // 觸控移動
        sidebar.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            currentX = e.touches[0].clientX;
            const deltaX = currentX - startX;
            
            // 向右滑動關閉
            if (deltaX > 0) {
                const translateX = Math.min(deltaX, 300);
                sidebar.style.transform = `translateX(${translateX}px)`;
            }
        });

        // 觸控結束
        sidebar.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            const deltaX = currentX - startX;
            
            // 滑動距離超過 100px 就關閉
            if (deltaX > 100) {
                this.close();
            } else {
                // 回彈到原位
                sidebar.style.transform = '';
            }
            
            isDragging = false;
            sidebar.style.transform = '';
        });
    }

    /**
     * 導航到指定路徑
     */
    navigate(path) {
        this.close();
        setTimeout(() => {
            this.router.navigate(path);
        }, 300); // 等待關閉動畫完成
    }

    /**
     * 處理登入
     */
    async handleLogin() {
        try {
            const LineLogin = (await import('../modules/auth/line-login.js')).default;
            const lineLogin = new LineLogin(this.state);
            
            await lineLogin.login();
            this.close();
            
        } catch (error) {
            console.error('登入失敗:', error);
        }
    }

    /**
     * 處理登出
     */
    async handleLogout() {
        try {
            const LineLogin = (await import('../modules/auth/line-login.js')).default;
            const lineLogin = new LineLogin(this.state);
            
            await lineLogin.logout();
            this.close();
            
        } catch (error) {
            console.error('登出失敗:', error);
        }
    }

    /**
     * 開啟側邊欄
     */
    open() {
        if (this.isAnimating) return;
        
        this.state.setState({ sidebarOpen: true });
    }

    /**
     * 關閉側邊欄
     */
    close() {
        if (this.isAnimating) return;
        
        this.state.setState({ sidebarOpen: false });
    }

    /**
     * 處理狀態變化
     */
    handleStateChange(newState) {
        if (this.element) {
            // 更新側邊欄內容
            this.updateContent(newState);
            
            // 更新顯示狀態
            this.updateVisibility(newState.sidebarOpen);
        }
    }

    /**
     * 更新內容
     */
    updateContent(state) {
        const sidebar = this.element.querySelector('#sidebar');
        if (sidebar) {
            sidebar.innerHTML = state.isLoggedIn ? 
                this.getLoggedInContent(state.user) : 
                this.getLoggedOutContent();
            
            // 重新綁定事件
            this.bindEvents();
        }
    }

    /**
     * 更新顯示狀態
     */
    updateVisibility(isOpen) {
        const overlay = this.element.querySelector('#sidebarOverlay');
        const sidebar = this.element.querySelector('#sidebar');
        
        if (isOpen) {
            overlay.classList.add('active');
            sidebar.classList.add('active');
            document.body.classList.add('sidebar-open');
        } else {
            overlay.classList.remove('active');
            sidebar.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        }
    }

    /**
     * 銷毀組件
     */
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

export { Sidebar };