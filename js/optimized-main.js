/* ===== Speaka 優化版主腳本 v1.0.0 - 2025.08.15 ===== */

console.log('%c🏠 OptimizedMain.js v1.0.0 載入完成', 'color: #8b5cf6; font-weight: bold; font-size: 12px;');

// ===== 核心工具函數 =====
const Utils = {
    // 防抖函數
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 節流函數
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 檢查是否為觸控設備
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    // 安全的 DOM 查詢
    $(selector, context = document) {
        return context.querySelector(selector);
    },

    $$(selector, context = document) {
        return Array.from(context.querySelectorAll(selector));
    }
};

// ===== LINE Login 管理器 (優化版) =====
class OptimizedLineLoginManager {
    constructor() {
        this.channelId = 'DEMO_CHANNEL_ID';
        this.redirectUri = window.location.origin + '/line-callback.html';
        this.isProcessing = false;
        this.init();
    }

    async init() {
        // 檢查登入狀態
        const storedProfile = localStorage.getItem('lineProfile');
        if (storedProfile) {
            try {
                this.showUserProfile(JSON.parse(storedProfile));
            } catch (e) {
                localStorage.removeItem('lineProfile');
                this.showLoginButton();
            }
        } else {
            this.showLoginButton();
        }

        this.bindEvents();
    }

    bindEvents() {
        // 使用事件委託提升性能
        document.addEventListener('click', this.handleClick.bind(this));
    }

    handleClick(e) {
        const target = e.target;
        
        // LINE 登入按鈕
        if (target.matches('#lineLoginBtn, #heroLineLoginBtn')) {
            e.preventDefault();
            this.login();
        }
        
        // 用戶頭像點擊
        if (target.matches('#userAvatarBtn, #userAvatar')) {
            e.preventDefault();
            this.openSidePanel();
        }
        
        // 關閉側邊欄
        if (target.matches('#closeSidePanel') || target.closest('.side-panel-overlay')) {
            e.preventDefault();
            this.closeSidePanel();
        }
        
        // 登出按鈕
        if (target.matches('#sidebarLogoutBtn')) {
            e.preventDefault();
            this.logout();
        }
    }

    async login() {
        if (this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            
            // 改善的模擬登入體驗
            const shouldProceed = await this.showImprovedLoginDialog();
            
            if (!shouldProceed) return;
            
            // 模擬載入
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const mockProfile = {
                userId: 'demo_user_001',
                displayName: '陳小美',
                pictureUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face&auto=format&q=80'
            };
            
            localStorage.setItem('lineProfile', JSON.stringify(mockProfile));
            this.showUserProfile(mockProfile);
            
            // 觸發成功事件
            this.dispatchLoginEvent('success', mockProfile);
            
        } catch (error) {
            console.error('登入失敗:', error);
            this.dispatchLoginEvent('error', { message: error.message });
        } finally {
            this.isProcessing = false;
        }
    }

    async showImprovedLoginDialog() {
        return new Promise((resolve) => {
            // 創建現代化對話框
            const dialog = this.createModernDialog(resolve);
            document.body.appendChild(dialog);
            
            // 平滑顯示
            requestAnimationFrame(() => {
                dialog.classList.add('show');
            });
        });
    }

    createModernDialog(resolve) {
        const dialog = document.createElement('div');
        dialog.className = 'modern-login-dialog';
        dialog.innerHTML = `
            <div class="dialog-overlay" role="button" tabindex="0" aria-label="關閉對話框"></div>
            <div class="dialog-content" role="dialog" aria-labelledby="dialog-title" aria-describedby="dialog-desc">
                <div class="dialog-header">
                    <div class="line-logo" aria-hidden="true">💬</div>
                    <h3 id="dialog-title">LINE 登入</h3>
                    <p id="dialog-desc">使用 LINE 帳號快速登入 Speaka</p>
                </div>
                
                <div class="dialog-body">
                    <div class="login-preview">
                        <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face&auto=format&q=80" 
                             alt="預覽頭像" width="60" height="60" loading="lazy">
                        <p><strong>陳小美</strong></p>
                        <p class="preview-desc">將會使用此 LINE 帳號登入</p>
                    </div>
                    
                    <div class="demo-notice">
                        <div class="notice-content">
                            <p><strong>📝 這是模擬版本</strong><br>
                            在正式環境中，這裡會跳轉到 LINE 進行真實登入驗證</p>
                        </div>
                    </div>
                </div>
                
                <div class="dialog-actions">
                    <button class="btn btn-secondary dialog-cancel" type="button">取消</button>
                    <button class="btn btn-line-success dialog-confirm" type="button">
                        模擬登入成功
                    </button>
                </div>
            </div>
        `;

        // 添加樣式
        this.injectDialogStyles();

        // 綁定事件
        this.bindDialogEvents(dialog, resolve);

        return dialog;
    }

    injectDialogStyles() {
        if (document.getElementById('modern-dialog-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'modern-dialog-styles';
        style.textContent = `
            .modern-login-dialog {
                position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000;
                opacity: 0; visibility: hidden; transition: all 0.3s ease;
            }
            .modern-login-dialog.show { opacity: 1; visibility: visible; }
            .dialog-overlay {
                position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px);
            }
            .dialog-content {
                position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: white; border-radius: 16px; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
                width: 90%; max-width: 400px; max-height: 90vh; overflow-y: auto;
            }
            .dialog-header {
                text-align: center; padding: 32px 24px 24px; border-bottom: 1px solid #f3f4f6;
            }
            .line-logo {
                width: 60px; height: 60px; background: #00B900; border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                margin: 0 auto 16px; font-size: 24px;
            }
            .dialog-header h3 { margin: 0 0 8px 0; font-size: 20px; color: #111827; }
            .dialog-header p { margin: 0; color: #6b7280; font-size: 14px; }
            .dialog-body { padding: 24px; }
            .login-preview {
                text-align: center; padding: 24px; background: #f9fafb;
                border-radius: 12px; margin-bottom: 16px;
            }
            .login-preview img { border-radius: 50%; margin-bottom: 12px; }
            .preview-desc { color: #6b7280; font-size: 14px; margin: 8px 0 0 0; }
            .demo-notice { margin: 16px 0; }
            .notice-content {
                background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px;
                padding: 12px; font-size: 14px; color: #856404;
            }
            .dialog-actions {
                padding: 24px; display: flex; gap: 12px; border-top: 1px solid #f3f4f6;
            }
            .dialog-actions .btn { flex: 1; }
            .btn-line-success { background: #00B900; color: white; }
            .btn-line-success:hover { background: #009500; }
        `;
        document.head.appendChild(style);
    }

    bindDialogEvents(dialog, resolve) {
        const cancelBtn = Utils.$('.dialog-cancel', dialog);
        const confirmBtn = Utils.$('.dialog-confirm', dialog);
        const overlay = Utils.$('.dialog-overlay', dialog);

        const close = (result) => {
            dialog.classList.remove('show');
            setTimeout(() => {
                if (dialog.parentNode) {
                    document.body.removeChild(dialog);
                }
            }, 300);
            resolve(result);
        };

        // 鍵盤支援
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') close(false);
            if (e.key === 'Enter' && e.target === confirmBtn) close(true);
        };

        cancelBtn.addEventListener('click', () => close(false));
        confirmBtn.addEventListener('click', () => close(true));
        overlay.addEventListener('click', () => close(false));
        document.addEventListener('keydown', handleKeyDown);

        // 清理事件監聽器
        setTimeout(() => {
            document.removeEventListener('keydown', handleKeyDown);
        }, 300000); // 5分鐘後自動清理
    }

    logout() {
        localStorage.removeItem('lineProfile');
        localStorage.removeItem('lineAccessToken');
        this.closeSidePanel();
        this.showLoginButton();
        this.dispatchLoginEvent('logout');
    }

    showLoginButton() {
        const loginBtn = Utils.$('#lineLoginBtn');
        const userProfile = Utils.$('#userProfile');
        
        if (loginBtn) loginBtn.style.display = 'block';
        if (userProfile) userProfile.style.display = 'none';
    }

    showUserProfile(profile) {
        const loginBtn = Utils.$('#lineLoginBtn');
        const userProfile = Utils.$('#userProfile');
        const userAvatar = Utils.$('#userAvatar');
        const sidePanelAvatar = Utils.$('#sidePanelAvatar');
        const sidePanelUserName = Utils.$('#sidePanelUserName');
        const sidePanelLineId = Utils.$('#sidePanelLineId');
        
        if (loginBtn) loginBtn.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';
        
        const avatarUrl = profile.pictureUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face&auto=format&q=80';
        
        if (userAvatar) userAvatar.src = avatarUrl;
        if (sidePanelAvatar) sidePanelAvatar.src = avatarUrl;
        if (sidePanelUserName) sidePanelUserName.textContent = profile.displayName || 'LINE用戶';
        if (sidePanelLineId) sidePanelLineId.textContent = `@${profile.userId}` || '@line_user';
    }

    openSidePanel() {
        const sidePanel = Utils.$('#sidePanel');
        if (sidePanel) {
            sidePanel.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // 焦點管理
            const closeBtn = Utils.$('#closeSidePanel');
            if (closeBtn) closeBtn.focus();
        }
    }

    closeSidePanel() {
        const sidePanel = Utils.$('#sidePanel');
        if (sidePanel) {
            sidePanel.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    dispatchLoginEvent(type, data = {}) {
        window.dispatchEvent(new CustomEvent(`line:${type}`, { detail: data }));
    }
}

// ===== 性能優化的滾動動畫 =====
class ScrollAnimations {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {
        if (!('IntersectionObserver' in window)) {
            this.fallbackAnimation();
            return;
        }

        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.observer.unobserve(entry.target); // 一次性觀察
                }
            });
        }, options);

        // 觀察所有動畫元素
        this.observeElements();
    }

    observeElements() {
        const animatedElements = Utils.$$('.fade-in, .slide-in-left, .slide-in-right');
        animatedElements.forEach(el => this.observer.observe(el));
    }

    fallbackAnimation() {
        // 降級處理：直接顯示所有元素
        const animatedElements = Utils.$$('.fade-in, .slide-in-left, .slide-in-right');
        animatedElements.forEach(el => el.classList.add('visible'));
    }
}

// ===== 導航增強 =====
class NavigationEnhancer {
    constructor() {
        this.navbar = Utils.$('.navbar');
        this.lastScrollY = window.scrollY;
        this.init();
    }

    init() {
        if (!this.navbar) return;
        
        // 使用節流的滾動監聽
        const throttledScroll = Utils.throttle(this.handleScroll.bind(this), 16);
        window.addEventListener('scroll', throttledScroll, { passive: true });
        
        // 平滑滾動
        this.initSmoothScroll();
    }

    handleScroll() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 50) {
            this.navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            this.navbar.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1)';
        } else {
            this.navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            this.navbar.style.boxShadow = 'none';
        }
        
        this.lastScrollY = currentScrollY;
    }

    initSmoothScroll() {
        document.addEventListener('click', (e) => {
            const anchor = e.target.closest('a[href^="#"]');
            if (!anchor) return;
            
            if (anchor.classList.contains('terms-link')) return;
            
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            
            if (targetId && targetId !== '#') {
                const target = Utils.$(targetId);
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    }
}

// ===== 互動效果增強 =====
class InteractionEnhancer {
    constructor() {
        this.ripples = new Map();
        this.init();
    }

    init() {
        // 使用事件委託提升性能
        document.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('mouseenter', this.handleHover.bind(this), true);
        document.addEventListener('mouseleave', this.handleHoverEnd.bind(this), true);
        
        // 觸控設備優化
        if (Utils.isTouchDevice()) {
            this.initTouchOptimizations();
        }
    }

    handleClick(e) {
        if (!e.target || typeof e.target.closest !== 'function') return;
        const button = e.target.closest('.btn, .plan-button, .nav-cta');
        if (button && !button.disabled) {
            this.addRippleEffect(button, e);
        }
    }

    handleHover(e) {
        if (!e.target || typeof e.target.closest !== 'function') return;
        const card = e.target.closest('.feature-card, .audience-card, .pricing-card:not(.featured)');
        if (card) {
            card.style.transform = 'translateY(-4px)';
            card.style.transition = 'transform 0.3s ease';
        }
    }

    handleHoverEnd(e) {
        if (!e.target || typeof e.target.closest !== 'function') return;
        const card = e.target.closest('.feature-card, .audience-card, .pricing-card:not(.featured)');
        if (card) {
            card.style.transform = 'translateY(0)';
        }
    }

    addRippleEffect(button, event) {
        // 移除現有波紋
        const existingRipple = button.querySelector('.ripple');
        if (existingRipple) existingRipple.remove();

        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.className = 'ripple';
        ripple.style.cssText = `
            width: ${size}px; height: ${size}px; left: ${x}px; top: ${y}px;
            position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.6);
            transform: scale(0); animation: ripple 0.4s ease-out; pointer-events: none; z-index: 1;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        // 清理
        setTimeout(() => ripple.remove(), 400);
    }

    initTouchOptimizations() {
        // 改善觸控回饋
        const style = document.createElement('style');
        style.textContent = `
            .btn, .plan-button, .nav-cta {
                -webkit-tap-highlight-color: transparent;
                touch-action: manipulation;
            }
            .btn:active, .plan-button:active {
                transform: scale(0.98);
                transition: transform 0.1s ease;
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== 應用初始化 =====
class SpeakaOptimizedApp {
    constructor() {
        this.modules = {};
        this.init();
    }

    async init() {
        try {
            // 核心模組
            this.modules.lineLogin = new OptimizedLineLoginManager();
            this.modules.scrollAnimations = new ScrollAnimations();
            this.modules.navigation = new NavigationEnhancer();
            this.modules.interactions = new InteractionEnhancer();
            
            // 標記載入完成
            document.body.classList.add('loaded');
            
            // 分派準備就緒事件
            window.dispatchEvent(new CustomEvent('speakaOptimizedReady', {
                detail: { timestamp: Date.now() }
            }));
            
            console.log('✅ Speaka 優化版初始化完成');
            
        } catch (error) {
            console.error('❌ 初始化失敗:', error);
            this.handleInitError();
        }
    }

    handleInitError() {
        // 確保基本功能可用
        document.body.classList.add('loaded');
        Utils.$$('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
            el.classList.add('visible');
        });
    }
}

// ===== CSS 動畫樣式注入 =====
const injectAnimationStyles = () => {
    if (document.getElementById('speaka-animations')) return;
    
    const style = document.createElement('style');
    style.id = 'speaka-animations';
    style.textContent = `
        @keyframes ripple {
            to { transform: scale(4); opacity: 0; }
        }
        
        .fade-in { opacity: 0; transform: translateY(30px); transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .fade-in.visible { opacity: 1; transform: translateY(0); }
        
        .slide-in-left { opacity: 0; transform: translateX(-30px); transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .slide-in-left.visible { opacity: 1; transform: translateX(0); }
        
        .slide-in-right { opacity: 0; transform: translateX(30px); transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .slide-in-right.visible { opacity: 1; transform: translateX(0); }
        
        /* 可訪問性 */
        .using-keyboard *:focus {
            outline: 2px solid var(--primary) !important;
            outline-offset: 2px !important;
        }
        
        /* 減少動畫偏好設定 */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
            .fade-in, .slide-in-left, .slide-in-right { opacity: 1; transform: none; }
        }
        
        /* 高對比模式 */
        @media (prefers-contrast: high) {
            .btn { border: 2px solid currentColor; }
        }
    `;
    document.head.appendChild(style);
};

// ===== 啟動應用 =====
const startApp = () => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startApp);
        return;
    }
    
    injectAnimationStyles();
    window.speakaOptimized = new SpeakaOptimizedApp();
};

startApp();