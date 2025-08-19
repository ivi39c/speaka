/**
 * Speaka Navigation and Sidebar Component v1.2.0 - 2025.08.18
 * 共用導覽列和側邊欄組件
 */


class NavigationManager {
    constructor() {
        this.channelId = 'DEMO_CHANNEL_ID';
        this.redirectUri = window.location.origin + '/line-callback.html';
        this.init();
    }

    async init() {
        // 插入導覽列和側邊欄HTML
        this.insertNavigationHTML();
        
        // 檢查是否已登入
        const storedProfile = localStorage.getItem('lineProfile');
        if (storedProfile) {
            this.showUserProfile(JSON.parse(storedProfile));
        } else {
            this.showLoginButton();
        }

        // 綁定事件
        this.bindEvents();
    }

    insertNavigationHTML() {
        // 檢查是否已經有導覽列，如果有就不重複插入
        if (document.querySelector('.navbar')) {
                this.updateExistingNavigation();
            return;
        }

        // 創建導覽列HTML (只有在沒有現有導覽列時才插入)
        const navHTML = `
            <nav class="navbar">
                <div class="container">
                    <div class="nav-content">
                        <a href="index.html" class="logo">Speaka</a>
                        <button id="hamburgerMenu" class="hamburger-menu" aria-label="開啟選單">
                            <span class="material-symbols-outlined">menu</span>
                        </button>
                        <ul class="nav-links">
                            <li><a href="index.html#features">功能特色</a></li>
                            <li><a href="index.html#comparison">翻譯精準度</a></li>
                            <li><a href="index.html#pricing">訂閱方案</a></li>
                            <li><button id="lineLoginBtn" class="line-login-btn" aria-label="使用 LINE 帳號登入">
                                LINE 登入
                            </button></li>
                            <li><div id="userProfile" class="user-profile" style="display: none;">
                                <div id="userAvatarBtn" class="user-avatar-btn">
                                    <span id="userAvatar" class="material-symbols-outlined user-avatar-icon">account_circle</span>
                                </div>
                            </div></li>
                            <li><a href="index.html#contact" class="nav-cta">立即開始</a></li>
                        </ul>
                    </div>
                </div>
            </nav>
        `;

        // 創建側邊欄HTML (如果還沒有的話)
        const sidebarHTML = `
            <div id="sidePanel" class="side-panel">
                <div class="side-panel-overlay"></div>
                <div class="side-panel-content">
                    <!-- 頭部區域 -->
                    <div class="side-panel-header">
                        <div class="user-info">
                            <span id="sidePanelAvatar" class="material-symbols-outlined side-panel-avatar">account_circle</span>
                            <div class="user-details">
                                <h3 id="sidePanelUserName">用戶名稱</h3>
                                <p id="sidePanelLineId">LINE ID</p>
                                <div id="subscriptionStatus" class="subscription-status">
                                    <span class="status-badge" id="statusBadge">未訂閱</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 會員專區 -->
                    <div class="side-panel-section" id="memberSection" style="display: none;">
                        <h4 class="section-title">會員專區</h4>
                        <ul class="menu-list">
                            <li><button class="menu-item simple-item" onclick="if(window.navigationManager) window.navigationManager.showSubscriptionHistory()">
                                我的訂閱
                            </button></li>
                            <li><a href="#" class="menu-item simple-item">
                                群組管理
                                <span class="menu-badge" id="groupCount">0</span>
                            </a></li>
                            <li><a href="#" class="menu-item simple-item">
                                使用統計
                            </a></li>
                        </ul>
                    </div>

                    <!-- 未登入時的功能 -->
                    <div class="side-panel-section" id="guestSection">
                        <h4 class="section-title">探索功能</h4>
                        <ul class="menu-list">
                            <li><a href="index.html#features" class="menu-item simple-item" onclick="if(window.navigationManager) window.navigationManager.closeSidePanel()">
                                功能特色
                            </a></li>
                            <li><a href="index.html#comparison" class="menu-item simple-item" onclick="if(window.navigationManager) window.navigationManager.closeSidePanel()">
                                翻譯精準度
                            </a></li>
                            <li><a href="index.html#pricing" class="menu-item simple-item" onclick="if(window.navigationManager) window.navigationManager.closeSidePanel()">
                                訂閱方案
                            </a></li>
                        </ul>
                    </div>

                    <!-- 登入區域 (未登入時顯示) -->
                    <div class="side-panel-section" id="loginSection">
                        <h4 class="section-title">會員登入</h4>
                        <div class="login-area">
                            <p class="login-description">登入後可管理訂閱、查看使用統計等功能</p>
                            <button id="sidebarLineLoginBtn" class="sidebar-login-btn">
                                <span class="menu-icon">🔑</span>
                                <span>LINE 登入</span>
                            </button>
                        </div>
                    </div>

                    <!-- 底部登出 -->
                    <div class="side-panel-footer" id="logoutSection" style="display: none;">
                        <button id="sidebarLogoutBtn" class="logout-button simple-logout">
                            登出
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 插入到頁面中
        document.body.insertAdjacentHTML('afterbegin', navHTML + sidebarHTML);
    }

    updateExistingNavigation() {
        // 為現有的導覽列添加漢堡菜單（如果還沒有的話）
        const navContent = document.querySelector('.nav-content');
        const logo = document.querySelector('.logo');
        
        if (navContent && logo && !document.getElementById('hamburgerMenu')) {
            const hamburgerHTML = `
                <button id="hamburgerMenu" class="hamburger-menu" aria-label="開啟選單">
                    <span class="material-symbols-outlined">menu</span>
                </button>
            `;
            logo.insertAdjacentHTML('afterend', hamburgerHTML);
        }

        // 添加側邊欄（如果還沒有的話）
        if (!document.getElementById('sidePanel')) {
            const sidebarHTML = `
                <div id="sidePanel" class="side-panel">
                    <div class="side-panel-overlay"></div>
                    <div class="side-panel-content">
                        <!-- 頭部區域 -->
                        <div class="side-panel-header">
                            <div class="user-info">
                                <span id="sidePanelAvatar" class="material-symbols-outlined side-panel-avatar">account_circle</span>
                                <div class="user-details">
                                    <h3 id="sidePanelUserName">用戶名稱</h3>
                                    <p id="sidePanelLineId">LINE ID</p>
                                    <div id="subscriptionStatus" class="subscription-status">
                                        <span class="status-badge" id="statusBadge">未訂閱</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 會員專區 -->
                        <div class="side-panel-section" id="memberSection" style="display: none;">
                            <h4 class="section-title">會員專區</h4>
                            <ul class="menu-list">
                                <li><button class="menu-item simple-item" onclick="if(window.navigationManager) window.navigationManager.showSubscriptionHistory()">
                                    我的訂閱
                                </button></li>
                                <li><a href="#" class="menu-item simple-item">
                                    群組管理
                                    <span class="menu-badge" id="groupCount">0</span>
                                </a></li>
                                <li><a href="#" class="menu-item simple-item">
                                    使用統計
                                </a></li>
                            </ul>
                        </div>

                        <!-- 未登入時的功能 -->
                        <div class="side-panel-section" id="guestSection">
                            <h4 class="section-title">探索功能</h4>
                            <ul class="menu-list">
                                <li><a href="index.html#features" class="menu-item simple-item" onclick="if(window.navigationManager) window.navigationManager.closeSidePanel()">
                                    功能特色
                                </a></li>
                                <li><a href="index.html#comparison" class="menu-item simple-item" onclick="if(window.navigationManager) window.navigationManager.closeSidePanel()">
                                    翻譯精準度
                                </a></li>
                                <li><a href="index.html#pricing" class="menu-item simple-item" onclick="if(window.navigationManager) window.navigationManager.closeSidePanel()">
                                    訂閱方案
                                </a></li>
                            </ul>
                        </div>

                        <!-- 登入區域 (未登入時顯示) -->
                        <div class="side-panel-section" id="loginSection">
                            <h4 class="section-title">會員登入</h4>
                            <div class="login-area">
                                <p class="login-description">登入後可管理訂閱、查看使用統計等功能</p>
                                <button id="sidebarLineLoginBtn" class="sidebar-login-btn">
                                    <span class="menu-icon">🔑</span>
                                    <span>LINE 登入</span>
                                </button>
                            </div>
                        </div>

                        <!-- 底部登出 -->
                        <div class="side-panel-footer" id="logoutSection" style="display: none;">
                            <button id="sidebarLogoutBtn" class="logout-button simple-logout">
                                登出
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', sidebarHTML);
        }
    }

    bindEvents() {
        // 等待一小段時間確保元素都已經插入到DOM中
        setTimeout(() => {
            const loginBtn = document.getElementById('lineLoginBtn');
            const heroLoginBtn = document.getElementById('heroLineLoginBtn');
            const userAvatarBtn = document.getElementById('userAvatarBtn');
            const hamburgerMenu = document.getElementById('hamburgerMenu');
            const sidePanelOverlay = document.querySelector('.side-panel-overlay');
            const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
            const sidebarLineLoginBtn = document.getElementById('sidebarLineLoginBtn');

            if (loginBtn) {
                loginBtn.addEventListener('click', () => this.login());
            }

            if (heroLoginBtn) {
                heroLoginBtn.addEventListener('click', () => this.login());
            }

            if (userAvatarBtn) {
                userAvatarBtn.addEventListener('click', () => this.openSidePanel());
            }

            if (hamburgerMenu) {
                hamburgerMenu.addEventListener('click', () => {
                    this.openSidePanel();
                });
            }

            if (sidePanelOverlay) {
                sidePanelOverlay.addEventListener('click', () => {
                    this.closeSidePanel();
                });
            }

            if (sidebarLogoutBtn) {
                sidebarLogoutBtn.addEventListener('click', () => this.logout());
            }

            if (sidebarLineLoginBtn) {
                sidebarLineLoginBtn.addEventListener('click', () => this.login());
            }
        }, 100);
    }

    login() {
        // 模擬 LINE Login 流程
        alert('這是 LINE Login 的模擬版本\n\n在正式環境中，這裡會跳轉到 LINE 進行登入驗證。\n\n模擬登入成功！');
        
        // 模擬登入成功，儲存假的用戶資料
        const mockProfile = {
            userId: 'demo_user_001',
            displayName: '陳小美',
            pictureUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face&auto=format&q=80'
        };
        
        localStorage.setItem('lineProfile', JSON.stringify(mockProfile));
        this.showUserProfile(mockProfile);
    }

    logout() {
        localStorage.removeItem('lineProfile');
        localStorage.removeItem('lineAccessToken');
        this.showLoginButton();
        this.closeSidePanel();
        
        console.log('用戶已登出');
        
        // 延遲一下讓UI更新完成，然後強制重新整理並返回首頁
        setTimeout(() => {
            window.location.href = '/';
            window.location.reload();
        }, 500);
    }

    showLoginButton() {
        document.getElementById('lineLoginBtn').style.display = 'block';
        document.getElementById('userProfile').style.display = 'none';
        
        // 顯示未登入時的UI
        const loginSection = document.getElementById('loginSection');
        const guestSection = document.getElementById('guestSection');
        const memberSection = document.getElementById('memberSection');
        const logoutSection = document.getElementById('logoutSection');
        
        if (loginSection) loginSection.style.display = 'block';
        if (guestSection) guestSection.style.display = 'block';
        if (memberSection) memberSection.style.display = 'none';
        if (logoutSection) logoutSection.style.display = 'none';
    }

    showUserProfile(profile) {
        document.getElementById('lineLoginBtn').style.display = 'none';
        document.getElementById('userProfile').style.display = 'flex';
        
        // 更新用戶資訊
        document.getElementById('sidePanelUserName').textContent = profile.displayName || 'LINE用戶';
        document.getElementById('sidePanelLineId').textContent = `@${profile.userId}` || '@line_user';
        
        // 更新訂閱狀態 (模擬數據)
        const statusBadge = document.getElementById('statusBadge');
        if (statusBadge) {
            statusBadge.textContent = '免費方案';
            statusBadge.className = 'status-badge';
        }
        
        // 更新群組數量 (模擬數據)
        const groupCount = document.getElementById('groupCount');
        if (groupCount) {
            groupCount.textContent = '3';
        }
        
        // 顯示登入後的UI
        const loginSection = document.getElementById('loginSection');
        const guestSection = document.getElementById('guestSection');
        const memberSection = document.getElementById('memberSection');
        const logoutSection = document.getElementById('logoutSection');
        
        if (loginSection) loginSection.style.display = 'none';
        if (guestSection) guestSection.style.display = 'none';
        if (memberSection) memberSection.style.display = 'block';
        if (logoutSection) logoutSection.style.display = 'block';
    }

    openSidePanel() {
        const sidePanel = document.getElementById('sidePanel');
        if (sidePanel) {
            // 記錄當前滾動位置
            this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            
            // 防止背景滾動
            document.body.classList.add('sidebar-open');
            document.documentElement.classList.add('sidebar-open');
            document.body.style.top = `-${this.scrollPosition}px`;
            
            sidePanel.classList.add('active');
        } else {
            console.error('Side panel not found!');
        }
    }

    closeSidePanel() {
        const sidePanel = document.getElementById('sidePanel');
        if (sidePanel) {
            sidePanel.classList.remove('active');
            
            // 恢復背景滾動
            document.body.classList.remove('sidebar-open');
            document.documentElement.classList.remove('sidebar-open');
            document.body.style.top = '';
            
            // 恢復滾動位置
            if (this.scrollPosition !== undefined) {
                window.scrollTo(0, this.scrollPosition);
            }
        } else {
            console.error('Side panel not found!');
        }
    }

    showSubscriptionHistory() {
        // 生成模擬的訂閱記錄數據
        const mockSubscriptions = [
            {
                orderNo: 'ORD-20240115001',
                plan: '月繳',
                groups: 3,
                startDate: '2024-01-15',
                endDate: '2024-02-15',
                status: '使用中',
                amount: 'NT$ 597'
            },
            {
                orderNo: 'ORD-20231215002', 
                plan: '年繳',
                groups: 5,
                startDate: '2023-12-15',
                endDate: '2024-12-15',
                status: '使用中',
                amount: 'NT$ 10,150'
            },
            {
                orderNo: 'ORD-20231001003',
                plan: '半年繳',
                groups: 2,
                startDate: '2023-10-01',
                endDate: '2024-04-01',
                status: '已到期',
                amount: 'NT$ 2,398'
            }
        ];

        // 創建訂閱記錄HTML (包含PC版表格和手機版卡片)
        const historyHTML = `
            <div class="subscription-history">
                <h3>我的訂閱記錄</h3>
                
                <!-- PC版表格佈局 -->
                <div class="subscription-table">
                    <div class="table-header">
                        <div class="col-order">訂單編號</div>
                        <div class="col-date">訂閱時間</div>
                        <div class="col-date">到期時間</div>
                        <div class="col-plan">方案</div>
                        <div class="col-groups">群組數</div>
                        <div class="col-amount">總計</div>
                        <div class="col-status">狀態</div>
                    </div>
                    <div class="table-body">
                        ${mockSubscriptions.map(sub => `
                            <div class="table-row ${sub.status === '使用中' ? 'active' : 'expired'}">
                                <div class="col-order">${sub.orderNo}</div>
                                <div class="col-date">${sub.startDate}</div>
                                <div class="col-date">${sub.endDate}</div>
                                <div class="col-plan">${sub.plan}</div>
                                <div class="col-groups">${sub.groups} 個</div>
                                <div class="col-amount">${sub.amount}</div>
                                <div class="col-status">
                                    <span class="status-badge ${sub.status === '使用中' ? 'status-active' : 'status-expired'}">
                                        ${sub.status}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- 手機版卡片佈局 -->
                <div class="subscription-cards">
                    ${mockSubscriptions.map(sub => `
                        <div class="subscription-card">
                            <h4>${sub.orderNo}</h4>
                            <div class="card-detail">
                                <span class="label">方案:</span>
                                <span class="value">${sub.plan}</span>
                            </div>
                            <div class="card-detail">
                                <span class="label">群組數:</span>
                                <span class="value">${sub.groups} 個</span>
                            </div>
                            <div class="card-detail">
                                <span class="label">總計:</span>
                                <span class="value">${sub.amount}</span>
                            </div>
                            <div class="card-detail">
                                <span class="label">訂閱時間:</span>
                                <span class="value">${sub.startDate}</span>
                            </div>
                            <div class="card-detail">
                                <span class="label">到期時間:</span>
                                <span class="value">${sub.endDate}</span>
                            </div>
                            <div class="card-detail">
                                <span class="label">狀態:</span>
                                <span class="value ${sub.status === '使用中' ? 'status-active' : 'status-expired'}">
                                    ${sub.status}
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="subscription-actions">
                    <button class="btn-subscribe" onclick="window.location.href='subscription.html'">
                        新增訂閱
                    </button>
                </div>
            </div>
        `;

        // 顯示模態框
        this.showModal('我的訂閱', historyHTML);
    }

    showModal(title, content) {
        // 創建模態框HTML
        const modalHTML = `
            <div class="modal-overlay" id="modalOverlay" onclick="window.navigationManager.closeModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2>${title}</h2>
                        <button class="modal-close" onclick="window.navigationManager.closeModal()">×</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;

        // 插入模態框到頁面
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 防止背景滾動
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('modalOverlay');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }
}

// 當頁面載入完成後初始化導覽管理器
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
});