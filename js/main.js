/* ===== Speaka 現代簡約腳本 main.js ===== */

// 版本信息
window.SPEAKA_VERSION = 'v1.2.0';

// ===== 核心功能模組 =====
const SpeakaCore = {
    // 滾動時導航列效果
    initNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        let lastScrollY = window.scrollY;
        let ticking = false;
        
        const updateNavbar = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1)';
                navbar.style.borderBottom = '1px solid rgb(226 232 240)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
                navbar.style.borderBottom = '1px solid rgb(226 232 240 / 0.5)';
            }
            
            lastScrollY = currentScrollY;
            ticking = false;
        };
        
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', onScroll, { passive: true });
    },

    // 平滑滾動
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                // 檢查是否為條款連結，如果是則跳過
                if (this.classList.contains('terms-link')) {
                    return;
                }
                
                e.preventDefault();
                const targetId = this.getAttribute('href');
                
                // 確保不是單純的 "#"
                if (targetId && targetId !== '#') {
                    const target = document.querySelector(targetId);
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
        });
    },

    // 滾動動畫效果 - 使用 Intersection Observer
    initScrollAnimations() {
        // 檢查瀏覽器支援
        if (!('IntersectionObserver' in window)) {
            // 降級處理：直接顯示所有元素
            document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
                el.classList.add('visible');
            });
            return;
        }

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -30px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // 一次性觀察，提升性能
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // 觀察所有需要動畫的元素
        document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
            observer.observe(el);
        });
    },

    // 頁面載入優化
    initPageLoad() {
        // 確保 CSS 載入完成後顯示內容
        document.addEventListener('DOMContentLoaded', () => {
            document.body.classList.add('loaded');
        });
        
        // 防止 FOUC (Flash of Unstyled Content)
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 50);
        });
    },

    // 初始化所有核心功能
    init() {
        this.initNavbarScroll();
        this.initSmoothScroll();
        this.initScrollAnimations();
        this.initPageLoad();
    }
};

// ===== 互動效果模組 =====
const InteractiveEffects = {
    // 現代化按鈕波紋效果
    addRippleEffect(button, event) {
        // 避免重複創建波紋
        const existingRipple = button.querySelector('.ripple');
        if (existingRipple) {
            existingRipple.remove();
        }

        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.className = 'ripple';
        ripple.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.4s ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        // 清理動畫元素
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 400);
    },

    // 卡片懸停效果
    initCardHoverEffects() {
        const cards = document.querySelectorAll('.feature-card, .audience-card, .pricing-card, .roadmap-item');
        
        cards.forEach(card => {
            let hoverTimeout;
            
            card.addEventListener('mouseenter', function() {
                clearTimeout(hoverTimeout);
                this.style.transform = 'translateY(-4px)';
            });
            
            card.addEventListener('mouseleave', function() {
                hoverTimeout = setTimeout(() => {
                    this.style.transform = 'translateY(0)';
                }, 50);
            });
        });
    },

    // 價格卡片特殊效果
    initPricingCardEffects() {
        document.querySelectorAll('.pricing-card:not(.featured)').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.borderColor = 'var(--primary)';
                this.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.borderColor = 'var(--border)';
                this.style.boxShadow = 'none';
            });
        });
    },

    // 按鈕點擊效果
    initButtonEffects() {
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.btn, .plan-button, .nav-cta');
            if (button && !button.disabled) {
                this.addRippleEffect(button, e);
                
                // 輕微的點擊反饋
                button.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    button.style.transform = '';
                }, 100);
            }
        });
    },

    // 導航連結懸停效果
    initNavLinkEffects() {
        document.querySelectorAll('.nav-links a:not(.nav-cta)').forEach(link => {
            link.addEventListener('mouseenter', function() {
                this.style.color = 'var(--primary)';
            });
            
            link.addEventListener('mouseleave', function() {
                this.style.color = 'var(--text-primary)';
            });
        });
    },

    // 聊天演示動畫
    initChatAnimation() {
        const chatMessages = document.querySelectorAll('.chat-message');
        if (chatMessages.length === 0) return;

        // 初始隱藏所有訊息
        chatMessages.forEach(msg => {
            msg.style.opacity = '0';
            msg.style.transform = 'translateY(20px)';
        });

        // 創建觀察者
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 依序顯示訊息
                    chatMessages.forEach((msg, index) => {
                        setTimeout(() => {
                            msg.style.transition = 'all 0.4s ease-out';
                            msg.style.opacity = '1';
                            msg.style.transform = 'translateY(0)';
                        }, index * 200);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        const chatDemo = document.querySelector('.chat-demo');
        if (chatDemo) {
            observer.observe(chatDemo);
        }
    },

    // 初始化所有互動效果
    init() {
        this.initCardHoverEffects();
        this.initPricingCardEffects();
        this.initButtonEffects();
        this.initNavLinkEffects();
        this.initChatAnimation();
    }
};

// ===== 聯絡功能模組 =====
const ContactHandlers = {
    // 聯絡按鈕處理
    initContactButtons() {
        document.querySelectorAll('a[href^="mailto:"], a[href^="https://line.me"]').forEach(link => {
            link.addEventListener('click', function(e) {
                // 添加點擊追蹤
                const contactType = this.href.includes('mailto') ? 'Email' : 'LINE';
                
                // 可以在這裡添加 GA 追蹤
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'contact_click', {
                        'contact_method': contactType
                    });
                }
            });
        });
    },

    // 方案選擇處理
    initPlanSelection() {
        document.querySelectorAll('.plan-button').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const planCard = this.closest('.pricing-card');
                const planName = planCard ? planCard.querySelector('.plan-period').textContent.trim() : '';

                // 確定方案參數
                let planParam = 'monthly';
                if (planName.includes('年')) planParam = 'yearly';
                else if (planName.includes('半年')) planParam = 'halfyearly';

                // 添加載入狀態
                this.style.opacity = '0.7';
                this.style.pointerEvents = 'none';
                this.textContent = '處理中...';

                // 模擬載入
                setTimeout(() => {
                    window.location.href = `subscription.html?plan=${planParam}`;
                }, 300);

                // 追蹤方案選擇
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'plan_select', {
                        'plan_type': planParam
                    });
                }
            });
        });
    },

    // CTA 按鈕處理
    initCTAButtons() {
        document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
            button.addEventListener('click', function(e) {
                const buttonText = this.textContent.trim();
                
                // 如果是外部連結，添加載入效果
                if (this.href && !this.href.includes('#')) {
                    this.style.opacity = '0.8';
                    this.innerHTML = this.innerHTML.replace(/🚀|📊/, '⏳');
                }
            });
        });
    },

    // 返回按鈕處理
    initBackButton() {
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // 檢查是否有歷史記錄
                if (window.history.length > 1) {
                    history.back();
                } else {
                    // 沒有歷史記錄時跳轉到首頁
                    window.location.href = 'index.html';
                }
            });
        }
    },

    // 初始化所有聯絡功能
    init() {
        this.initContactButtons();
        this.initPlanSelection();
        this.initCTAButtons();
        this.initBackButton();
    }
};

// ===== 性能優化模組 =====
const PerformanceOptimizer = {
    // 圖片懶載入
    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    },

    // 預載入關鍵資源
    preloadCriticalResources() {
        const criticalResources = [
            'subscription.html'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = resource;
            document.head.appendChild(link);
        });
    },

    // 防抖函數工具
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

    // 節流函數工具
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

    // 初始化性能優化
    init() {
        this.initLazyLoading();
        this.preloadCriticalResources();
    }
};

// ===== 用戶體驗增強模組 =====
const UXEnhancer = {
    // 鍵盤導航支援
    initKeyboardNavigation() {
        // ESC 鍵關閉彈窗
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal[style*="block"]');
                modals.forEach(modal => {
                    modal.style.display = 'none';
                });
            }
        });

        // Tab 鍵導航優化
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusable = Array.from(document.querySelectorAll(focusableElements));
                const index = focusable.indexOf(document.activeElement);
                
                if (e.shiftKey) {
                    const nextIndex = index > 0 ? index - 1 : focusable.length - 1;
                    focusable[nextIndex]?.focus();
                } else {
                    const nextIndex = index < focusable.length - 1 ? index + 1 : 0;
                    focusable[nextIndex]?.focus();
                }
            }
        });
    },

    // 焦點指示器
    initFocusIndicators() {
        // 只在鍵盤導航時顯示焦點輪廓
        let isUsingKeyboard = false;

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                isUsingKeyboard = true;
                document.body.classList.add('using-keyboard');
            }
        });

        document.addEventListener('mousedown', () => {
            isUsingKeyboard = false;
            document.body.classList.remove('using-keyboard');
        });
    },

    // 滾動進度指示器
    initScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 2px;
            background: var(--primary);
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);

        const updateProgress = PerformanceOptimizer.throttle(() => {
            const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            progressBar.style.width = Math.min(scrolled, 100) + '%';
        }, 10);

        window.addEventListener('scroll', updateProgress, { passive: true });
    },

    // 錯誤處理
    initErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('頁面錯誤:', e.error);
            // 在生產環境中可以發送錯誤報告
        });

        // 處理 Promise 拒絕
        window.addEventListener('unhandledrejection', (e) => {
            console.error('未處理的 Promise 拒絕:', e.reason);
            e.preventDefault();
        });
    },

    // 初始化用戶體驗增強
    init() {
        this.initKeyboardNavigation();
        this.initFocusIndicators();
        this.initScrollProgress();
        this.initErrorHandling();
    }
};

// ===== 分析追蹤模組 =====
const Analytics = {
    // 頁面瀏覽追蹤
    trackPageView() {
        const pageTitle = document.title;
        const pagePath = window.location.pathname;
        
        
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: pageTitle,
                page_location: window.location.href
            });
        }
    },

    // 滾動深度追蹤
    trackScrollDepth() {
        let maxScroll = 0;
        const milestones = [25, 50, 75, 100];
        const trackedMilestones = new Set();

        const trackScroll = PerformanceOptimizer.throttle(() => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                milestones.forEach(milestone => {
                    if (scrollPercent >= milestone && !trackedMilestones.has(milestone)) {
                        trackedMilestones.add(milestone);
                        
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'scroll_depth', {
                                'percentage': milestone
                            });
                        }
                    }
                });
            }
        }, 1000);

        window.addEventListener('scroll', trackScroll, { passive: true });
    },

    // 互動事件追蹤
    trackInteractions() {
        // 按鈕點擊追蹤
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.btn, .plan-button, .contact-btn');
            if (button) {
                const buttonText = button.textContent.trim();
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'button_click', {
                        'button_text': buttonText,
                        'button_location': button.className
                    });
                }
            }
        });

        // 外部連結追蹤
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="http"]');
            if (link && !link.href.includes(window.location.hostname)) {
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'external_link_click', {
                        'link_url': link.href,
                        'link_text': link.textContent.trim()
                    });
                }
            }
        });
    },

    // 性能指標追蹤
    trackPerformance() {
        window.addEventListener('load', () => {
            // 等待性能數據穩定
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const loadTime = perfData.loadEventEnd - perfData.fetchStart;
                const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.fetchStart;
                
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'timing_complete', {
                        'name': 'page_load',
                        'value': Math.round(loadTime)
                    });
                }
            }, 0);
        });
    },

    // 初始化分析追蹤
    init() {
        this.trackPageView();
        this.trackScrollDepth();
        this.trackInteractions();
        this.trackPerformance();
    }
};

// ===== 主初始化函數 =====
const initializeApp = () => {
    // 確保 DOM 完全載入
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
        return;
    }

    try {
        // 按順序初始化各模組
        SpeakaCore.init();
        InteractiveEffects.init();
        ContactHandlers.init();
        PerformanceOptimizer.init();
        UXEnhancer.init();
        Analytics.init();
        
        
        // 發送初始化完成事件
        window.dispatchEvent(new CustomEvent('speakaReady', {
            detail: { timestamp: Date.now() }
        }));
        
    } catch (error) {
        console.error('❌ 初始化過程中發生錯誤:', error);
        
        // 確保基本功能仍然可用
        document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
            el.classList.add('visible');
        });
    }
};

// 啟動應用程式
initializeApp();

// 導出模組供外部使用
window.Speaka = {
    Core: SpeakaCore,
    Effects: InteractiveEffects,
    Contact: ContactHandlers,
    Performance: PerformanceOptimizer,
    UX: UXEnhancer,
    Analytics: Analytics
};