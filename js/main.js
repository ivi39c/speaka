/* ===== Speaka 共用腳本 scripts.js ===== */

// ===== 核心功能模組 =====
const SpeakaCore = {
    // 滾動時導航列效果
    initNavbarScroll() {
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.navbar');
            if (!navbar) return;
            
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        });
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

    // 滾動動畫效果
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // 觀察所有需要動畫的元素
        document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
            observer.observe(el);
        });
    },

    // 頁面載入動畫
    initPageLoadAnimation() {
        window.addEventListener('load', function() {
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 100);
        });
    },

    // 初始化所有核心功能
    init() {
        this.initNavbarScroll();
        this.initSmoothScroll();
        this.initScrollAnimations();
        this.initPageLoadAnimation();
    }
};

// ===== 按鈕效果模組 =====
const ButtonEffects = {
    // 波紋效果
    addRippleEffect(button, event) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    },

    // 初始化按鈕點擊效果
    initButtonEffects() {
        document.querySelectorAll('.btn, .plan-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.addRippleEffect(button, e);
            });
        });
    },

    // 價格卡片懸停效果
    initPricingCardEffects() {
        document.querySelectorAll('.pricing-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                if (!this.classList.contains('featured')) {
                    this.style.borderColor = '#2563eb';
                    this.style.transform = 'translateY(-5px)';
                }
            });
            
            card.addEventListener('mouseleave', function() {
                if (!this.classList.contains('featured')) {
                    this.style.borderColor = '#f1f5f9';
                    this.style.transform = 'translateY(0)';
                }
            });
        });
    },

    // 初始化所有按鈕效果
    init() {
        this.initButtonEffects();
        this.initPricingCardEffects();
    }
};

// ===== 聯絡功能模組 =====
const ContactHandlers = {
    // 聯絡按鈕處理
    initContactButtons() {
        document.querySelectorAll('a[href^="mailto:"], a[href^="https://line.me"]').forEach(link => {
            link.addEventListener('click', function(e) {
                console.log('聯絡方式被點擊:', this.href);
            });
        });
    },

    // 方案選擇處理
    
    initPlanSelection() {
        document.querySelectorAll('.plan-button').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const planCard = this.closest('.pricing-card');
                const planName = planCard ? planCard.querySelector('.plan-period').textContent : '';

                // 判斷方案關鍵字
                let planParam = 'monthly';
                if (planName.includes('年')) planParam = 'yearly';
                else if (planName.includes('半年')) planParam = 'halfyearly';
                else if (planName.includes('季')) planParam = 'quarterly';

                // 跳轉到訂閱頁，帶參數
                window.location.href = `subscription.html?plan=${planParam}`;
            });
        });
    },

    // 企業方案處理
    initEnterpriseButton() {
        const enterpriseBtn = document.querySelector('.enterprise-btn');
        if (enterpriseBtn) {
            enterpriseBtn.addEventListener('click', function(e) {
                e.preventDefault();
                SpeakaModal.showEnterpriseContact();
            });
        }
    },

    // 返回首頁處理
    initBackButton() {
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', function(e) {
                e.preventDefault();
                history.back();
            });
        }
    },

    // 初始化所有聯絡功能
    init() {
        this.initContactButtons();
        this.initPlanSelection();
        this.initEnterpriseButton();
        this.initBackButton();
    }
};

// ===== 彈窗模組 =====
const SpeakaModal = {
    // 顯示方案選擇確認
    showPlanSelection(planName) {
        const message = `您選擇了：${planName}\n\n請聯絡客服完成訂閱流程：\nLINE: @537etdoz\nEmail: talkeasenow@gmail.com`;
        
        if (this.isModernBrowser()) {
        const content = `
            <div style="text-align: left; line-height: 1.6; max-height: 400px; overflow-y: auto; padding: 20px;">
                <h3 style="color: #1e293b; margin-bottom: 20px;">Speaka 隱私政策</h3>
                
                <h4 style="color: #374151; margin: 16px 0 8px;">1. 資料收集</h4>
                <p style="margin-bottom: 12px;">我們收集以下類型的個人資料：</p>
                <p style="margin-bottom: 8px;">• 聯絡資訊：姓名、電子郵件、電話號碼、地址</p>
                <p style="margin-bottom: 8px;">• 帳務資訊：發票資料、付款記錄</p>
                <p style="margin-bottom: 8px;">• 使用資料：服務使用情況、技術日誌</p>
                
                <h4 style="color: #374151; margin: 16px 0 8px;">2. 資料用途</h4>
                <p style="margin-bottom: 8px;">• 提供翻譯服務</p>
                <p style="margin-bottom: 8px;">• 客戶支援與技術協助</p>
                <p style="margin-bottom: 8px;">• 帳務處理與發票開立</p>
                <p style="margin-bottom: 8px;">• 服務改善與品質提升</p>
                
                <h4 style="color: #374151; margin: 16px 0 8px;">3. 資料保護</h4>
                <p style="margin-bottom: 8px;">• 採用業界標準的加密技術</p>
                <p style="margin-bottom: 8px;">• 限制員工存取權限</p>
                <p style="margin-bottom: 8px;">• 定期進行安全性檢查</p>
                <p style="margin-bottom: 8px;">• 遵循個人資料保護法規</p>
                
                <h4 style="color: #374151; margin: 16px 0 8px;">4. 翻譯內容處理</h4>
                <p style="margin-bottom: 8px;">• 翻譯內容僅用於提供翻譯服務</p>
                <p style="margin-bottom: 8px;">• 不會儲存或分析群組對話內容</p>
                <p style="margin-bottom: 8px;">• 即時處理，不留存敏感資訊</p>
                
                <h4 style="color: #374151; margin: 16px 0 8px;">5. 資料分享</h4>
                <p style="margin-bottom: 12px;">除法律要求外，我們不會與第三方分享您的個人資料。僅在以下情況下可能分享：</p>
                <p style="margin-bottom: 8px;">• 經您明確同意</p>
                <p style="margin-bottom: 8px;">• 法律強制要求</p>
                <p style="margin-bottom: 8px;">• 保護用戶安全必要時</p>
                
                <h4 style="color: #374151; margin: 16px 0 8px;">6. 您的權利</h4>
                <p style="margin-bottom: 8px;">• 查詢個人資料</p>
                <p style="margin-bottom: 8px;">• 更正錯誤資料</p>
                <p style="margin-bottom: 8px;">• 刪除個人資料</p>
                <p style="margin-bottom: 8px;">• 停止資料處理</p>
                
                <h4 style="color: #374151; margin: 16px 0 8px;">7. Cookie 使用</h4>
                <p style="margin-bottom: 12px;">我們使用 Cookie 來改善網站功能和用戶體驗，您可以透過瀏覽器設定管理 Cookie。</p>
                
                <h4 style="color: #374151; margin: 16px 0 8px;">8. 聯絡我們</h4>
                <p style="margin-bottom: 12px;">如有隱私相關問題，請聯絡：</p>
                <p style="margin-bottom: 8px;">Email: talkeasenow@gmail.com</p>
                <p style="margin-bottom: 8px;">LINE: @537etdoz</p>
                
                <p style="margin-top: 20px; color: #64748b; font-size: 0.9rem;">
                    最後更新日期：2025年1月
                </p>
            </div>
        `;
        
        this.showCustomModal('隱私政策', content, [
            { text: '我已了解', action: () => {} }
        ]);
    }
};    

// ===== 表單處理模組 =====
const FormHandlers = {
    // 表單驗證
    validateForm(formData) {
        const errors = [];
        
        if (!formData.get('name') || formData.get('name').trim().length < 2) {
            errors.push('請輸入有效的姓名');
        }
        
        if (!formData.get('email') || !this.isValidEmail(formData.get('email'))) {
            errors.push('請輸入有效的電子郵件');
        }
        
        if (!formData.get('phone') || formData.get('phone').trim().length < 8) {
            errors.push('請輸入有效的電話號碼');
        }
        
        return errors;
    },

    // 電子郵件驗證
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // 處理聯絡表單提交
    handleContactForm(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const errors = this.validateForm(formData);
            
            if (errors.length > 0) {
                alert('請修正以下錯誤：\n' + errors.join('\n'));
                return;
            }
            
            // 這裡可以添加實際的表單提交邏輯
            console.log('表單數據:', Object.fromEntries(formData));
            alert('感謝您的聯絡，我們會盡快回覆您！');
            form.reset();
        });
    },

    // 初始化表單處理
    init() {
        document.querySelectorAll('form.contact-form').forEach(form => {
            this.handleContactForm(form);
        });
    }
};

// ===== 工具函數模組 =====
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

    // 檢查元素是否在視窗中
    isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // 平滑滾動到元素
    scrollToElement(element, offset = 0) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    },

    // 複製文字到剪貼板
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // 降級方案
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'absolute';
                textArea.style.left = '-999999px';
                document.body.prepend(textArea);
                textArea.select();
                const success = document.execCommand('copy');
                textArea.remove();
                return success;
            }
        } catch (error) {
            console.error('複製失敗:', error);
            return false;
        }
    }
};

// ===== 性能監控模組 =====
const Performance = {
    // 監控頁面載入時間
    trackPageLoad() {
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`頁面載入時間: ${loadTime}ms`);
            
            // 可以發送到分析服務
            this.sendAnalytics('page_load_time', loadTime);
        });
    },

    // 監控用戶互動
    trackUserInteractions() {
        // 監控按鈕點擊
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn, .plan-button, .contact-btn')) {
                const buttonText = e.target.textContent.trim();
                console.log(`按鈕點擊: ${buttonText}`);
                this.sendAnalytics('button_click', buttonText);
            }
        });

        // 監控滾動深度
        let maxScroll = 0;
        window.addEventListener('scroll', Utils.throttle(() => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                if (maxScroll % 25 === 0) { // 每25%記錄一次
                    console.log(`滾動深度: ${maxScroll}%`);
                    this.sendAnalytics('scroll_depth', maxScroll);
                }
            }
        }, 1000));
    },

    // 發送分析數據（模擬）
    sendAnalytics(event, value) {
        // 這裡可以集成 Google Analytics, Mixpanel 等
        if (typeof gtag !== 'undefined') {
            gtag('event', event, {
                'custom_parameter': value
            });
        }
    },

    // 初始化性能監控
    init() {
        this.trackPageLoad();
        this.trackUserInteractions();
    }
};

// ===== 訂閱頁面功能模組 =====
