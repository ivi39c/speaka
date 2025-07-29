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
                const planName = planCard ? planCard.querySelector('.plan-period').textContent : '未知方案';
                
                SpeakaModal.showPlanSelection(planName);
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
            this.showCustomModal('服務條款', message, [
            { text: '我已了解', action: () => {} }
        ]);
    }

    // 顯示隱私政策
    showPrivacyPolicy() {
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
        `};
        
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
const SubscriptionPage = {
    // 價格計算
    prices: {
        monthly: 199,
        quarterly: 579,
        halfyearly: 1199,
        yearly: 2030
    },

    periodNames: {
        monthly: '月',
        quarterly: '季',
        halfyearly: '半年',
        yearly: '年'
    },

    // 初始化訂閱頁面
    init() {
        if (!this.isSubscriptionPage()) return;
        
        this.initPriceCalculation();
        this.initPaymentMethods();
        this.initInvoiceType();
        this.initFormValidation();
        this.initFormSubmission();
        this.updatePrice(); // 初始化價格顯示
    },

    // 檢查是否為訂閱頁面
    isSubscriptionPage() {
        return document.getElementById('subscriptionForm') !== null;
    },

    // 初始化價格計算
    initPriceCalculation() {
        const groupCountInput = document.getElementById('groupCount');
        const billingRadios = document.querySelectorAll('input[name="billingPeriod"]');

        if (groupCountInput) {
            groupCountInput.addEventListener('input', () => this.updatePrice());
        }

        billingRadios.forEach(radio => {
            radio.addEventListener('change', () => this.updatePrice());
        });
    },

    // 更新價格顯示
    updatePrice() {
        const groupCount = parseInt(document.getElementById('groupCount')?.value) || 1;
        const selectedPeriod = document.querySelector('input[name="billingPeriod"]:checked')?.value || 'monthly';
        const unitPrice = this.prices[selectedPeriod];
        const total = unitPrice * groupCount;

        // 更新顯示
        const unitPriceEl = document.getElementById('unitPrice');
        const groupQuantityEl = document.getElementById('groupQuantity');
        const subtotalEl = document.getElementById('subtotal');
        const totalPriceEl = document.getElementById('totalPrice');

        if (unitPriceEl) {
            unitPriceEl.textContent = `NT$ ${unitPrice.toLocaleString()} / 群組 / ${this.periodNames[selectedPeriod]}`;
        }
        if (groupQuantityEl) {
            groupQuantityEl.textContent = `${groupCount} 個`;
        }
        if (subtotalEl) {
            subtotalEl.textContent = `NT$ ${total.toLocaleString()}`;
        }
        if (totalPriceEl) {
            totalPriceEl.textContent = `NT$ ${total.toLocaleString()}`;
        }
    },

    // 初始化支付方式選擇
    initPaymentMethods() {
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                const radio = this.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            });
        });
    },

    // 初始化發票類型
    initInvoiceType() {
        const invoiceTypeSelect = document.getElementById('invoiceType');
        if (!invoiceTypeSelect) return;

        invoiceTypeSelect.addEventListener('change', function() {
            const companyFields = document.querySelectorAll('.company-field');
            const companyName = document.getElementById('companyName');
            const taxId = document.getElementById('taxId');
            
            if (this.value === 'company') {
                companyFields.forEach(field => {
                    field.style.display = 'flex';
                });
                if (companyName) companyName.required = true;
                if (taxId) taxId.required = true;
            } else {
                companyFields.forEach(field => {
                    field.style.display = 'none';
                });
                if (companyName) {
                    companyName.required = false;
                    companyName.value = '';
                }
                if (taxId) {
                    taxId.required = false;
                    taxId.value = '';
                }
            }
        });
    },

    // 初始化表單驗證
    initFormValidation() {
        // 統一編號格式驗證
        const taxIdInput = document.getElementById('taxId');
        if (taxIdInput) {
            taxIdInput.addEventListener('input', function() {
                this.value = this.value.replace(/\D/g, '').substring(0, 8);
                this.validateTaxId();
            });

            // 添加統一編號驗證方法
            taxIdInput.validateTaxId = function() {
                const value = this.value;
                
                if (value.length === 8) {
                    if (this.isValidTaxId(value)) {
                        this.setValid();
                        return true;
                    } else {
                        this.showError('統一編號格式不正確');
                        return false;
                    }
                } else if (value.length > 0) {
                    this.showError('統一編號必須為8位數字');
                    return false;
                } else {
                    this.clearError();
                    return true;
                }
            };

            // 統一編號檢查演算法
            taxIdInput.isValidTaxId = function(taxId) {
                if (!/^\d{8}$/.test(taxId)) return false;
                
                const weights = [1, 2, 1, 2, 1, 2, 4, 1];
                let sum = 0;
                
                for (let i = 0; i < 8; i++) {
                    let product = parseInt(taxId[i]) * weights[i];
                    sum += Math.floor(product / 10) + (product % 10);
                }
                
                return sum % 10 === 0;
            };
        }

        // 電話號碼驗證
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function() {
                // 只允許數字、連字號、括號、空格和加號
                this.value = this.value.replace(/[^\d\-\(\)\s\+]/g, '');
                this.validatePhone();
            });

            phoneInput.validatePhone = function() {
                const value = this.value.replace(/[\s\-\(\)]/g, '');
                
                // 台灣手機格式：09開頭10位數 或 市話格式
                const mobilePattern = /^09\d{8}$/;
                const landlinePattern = /^0[2-8]\d{7,8}$/;
                const internationalPattern = /^\+\d{8,15}$/;
                
                if (mobilePattern.test(value) || landlinePattern.test(value) || internationalPattern.test(value)) {
                    this.setValid();
                    return true;
                } else if (value.length > 0) {
                    this.showError('請輸入正確的電話號碼格式');
                    return false;
                } else {
                    this.clearError();
                    return true;
                }
            };
        }

        // Email 驗證
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                this.validateEmail();
            });

            emailInput.validateEmail = function() {
                const value = this.value;
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                
                if (emailPattern.test(value)) {
                    this.setValid();
                    return true;
                } else if (value.length > 0) {
                    this.showError('請輸入正確的電子郵件格式');
                    return false;
                } else {
                    this.clearError();
                    return true;
                }
            };
        }

        // 姓名驗證
        const nameInput = document.getElementById('contactName');
        if (nameInput) {
            nameInput.addEventListener('input', function() {
                // 移除特殊字符，保留中文、英文、空格
                this.value = this.value.replace(/[^\u4e00-\u9fa5a-zA-Z\s]/g, '');
                this.validateName();
            });

            nameInput.validateName = function() {
                const value = this.value.trim();
                
                if (value.length >= 2 && value.length <= 20) {
                    this.setValid();
                    return true;
                } else if (value.length > 0) {
                    this.showError('姓名長度應為2-20個字符');
                    return false;
                } else {
                    this.clearError();
                    return true;
                }
            };
        }

        // 通用錯誤訊息顯示方法
        document.querySelectorAll('.form-input, .form-select').forEach(input => {
            input.showError = function(message) {
                // 先移除現有的錯誤訊息
                this.clearError();
                
                // 設置錯誤狀態
                this.style.borderColor = '#ef4444';
                
                // 創建新的錯誤訊息
                const errorMsg = document.createElement('div');
                errorMsg.classList.add('error-message');
                errorMsg.textContent = message;
                errorMsg.style.cssText = `
                    color: #ef4444;
                    font-size: 0.8rem;
                    margin-top: 4px;
                    display: block;
                `;
                
                // 將錯誤訊息插入到正確位置
                this.parentNode.appendChild(errorMsg);
            };
            
            input.clearError = function() {
                // 移除該欄位的所有錯誤訊息
                const errorMsgs = this.parentNode.querySelectorAll('.error-message');
                errorMsgs.forEach(msg => msg.remove());
                
                // 重置為預設邊框顏色
                this.style.borderColor = '#e2e8f0';
            };
            
            input.setValid = function() {
                this.clearError();
                // 不設置綠色邊框，保持預設狀態
            };
        });
    },

    // 表單提交驗證
    validateForm() {
        let isValid = true;
        const errors = [];

        // 驗證所有必填欄位
        const requiredFields = [
            { id: 'contactName', name: '聯絡人姓名' },
            { id: 'email', name: '電子郵件' },
            { id: 'phone', name: '聯絡電話' },
            { id: 'invoiceType', name: '發票類型' }
        ];

        requiredFields.forEach(field => {
            const input = document.getElementById(field.id);
            if (input && !input.value.trim()) {
                errors.push(`${field.name}為必填欄位`);
                input.style.borderColor = '#ef4444';
                isValid = false;
            }
        });

        // 驗證發票類型相關欄位
        const invoiceType = document.getElementById('invoiceType')?.value;
        if (invoiceType === 'company') {
            const companyName = document.getElementById('companyName');
            const taxId = document.getElementById('taxId');
            
            if (!companyName?.value.trim()) {
                errors.push('公司名稱為必填欄位');
                if (companyName) companyName.style.borderColor = '#ef4444';
                isValid = false;
            }
            
            if (!taxId?.value.trim()) {
                errors.push('統一編號為必填欄位');
                if (taxId) taxId.style.borderColor = '#ef4444';
                isValid = false;
            } else if (taxId && !taxId.validateTaxId()) {
                isValid = false;
            }
        }

        // 個別欄位驗證
        const emailInput = document.getElementById('email');
        if (emailInput && emailInput.value && !emailInput.validateEmail()) {
            isValid = false;
        }

        const phoneInput = document.getElementById('phone');
        if (phoneInput && phoneInput.value && !phoneInput.validatePhone()) {
            isValid = false;
        }

        const nameInput = document.getElementById('contactName');
        if (nameInput && nameInput.value && !nameInput.validateName()) {
            isValid = false;
        }

        // 服務條款確認
        const agreeTerms = document.getElementById('agreeTerms');
        if (agreeTerms && !agreeTerms.checked) {
            errors.push('請同意服務條款和隱私政策');
            isValid = false;
        }

        if (!isValid && errors.length > 0) {
            this.showValidationErrors(errors);
        }

        return isValid;
    },

    // 顯示驗證錯誤
    showValidationErrors(errors) {
        const errorMessage = '請修正以下錯誤：\n\n' + errors.join('\n');
        
        if (SpeakaModal.isModernBrowser()) {
            SpeakaModal.showCustomModal('表單驗證錯誤', errorMessage, [
                { text: '確定', action: () => {} }
            ]);
        } else {
            alert(errorMessage);
        }
    },

    // 初始化表單提交
    initFormSubmission() {
        const form = document.getElementById('subscriptionForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // 表單驗證
            if (!this.validateForm()) {
                return;
            }
            
            // 收集表單數據
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // 添加價格資訊
            data.groupCount = document.getElementById('groupCount')?.value || '1';
            data.totalAmount = document.getElementById('totalPrice')?.textContent || 'NT$ 199';
            
            // 顯示確認彈窗
            SpeakaModal.showSubscriptionConfirm(data);
        });

        // 服務條款和隱私政策連結事件
        this.initTermsLinks();
    },

    // 初始化服務條款連結
    initTermsLinks() {
        // 使用事件委派，確保動態內容也能觸發
        document.addEventListener('click', (e) => {
            // 檢查是否點擊的是服務條款或隱私政策連結
            if (e.target.tagName === 'A' && e.target.classList.contains('terms-link')) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('點擊了條款連結:', e.target.getAttribute('data-type'));
                
                const type = e.target.getAttribute('data-type');
                if (type === 'terms') {
                    SpeakaModal.showTermsOfService();
                } else if (type === 'privacy') {
                    SpeakaModal.showPrivacyPolicy();
                }
                
                return false;
            }
            
            // 備用方案：根據文字內容判斷
            if (e.target.tagName === 'A' && (e.target.textContent.trim() === '服務條款' || e.target.textContent.trim() === '隱私政策')) {
                e.preventDefault();
                e.stopPropagation();
                
                const text = e.target.textContent.trim();
                if (text === '服務條款') {
                    console.log('觸發服務條款彈窗');
                    SpeakaModal.showTermsOfService();
                } else if (text === '隱私政策') {
                    console.log('觸發隱私政策彈窗');
                    SpeakaModal.showPrivacyPolicy();
                }
                
                return false;
            }
        });
    }
};

// ===== 主初始化函數更新 =====
function runInitialization() {
    try {
        // 初始化所有模組
        SpeakaCore.init();
        ButtonEffects.init();
        ContactHandlers.init();
        FormHandlers.init();
        SubscriptionPage.init();
        Performance.init();
        
        console.log('Speaka 初始化完成');
    } catch (error) {
        console.error('Speaka 初始化失敗:', error);
    }
}

// ===== 調試和測試函數 =====
const DebugHelpers = {
    // 測試服務條款彈窗
    testTerms() {
        if (window.Speaka && window.Speaka.Modal) {
            window.Speaka.Modal.showTermsOfService();
        } else {
            console.error('Speaka Modal 未初始化');
        }
    },

    // 測試隱私政策彈窗
    testPrivacy() {
        if (window.Speaka && window.Speaka.Modal) {
            window.Speaka.Modal.showPrivacyPolicy();
        } else {
            console.error('Speaka Modal 未初始化');
        }
    },

    // 檢查事件綁定
    checkEventBinding() {
        const links = document.querySelectorAll('.terms-link');
        console.log('找到條款連結數量:', links.length);
        links.forEach((link, index) => {
            console.log(`連結 ${index + 1}:`, link.textContent, 'data-type:', link.getAttribute('data-type'));
        });
    }
};

// 將調試函數添加到全域
window.DebugSpeaka = DebugHelpers;
window.Speaka = {
    Core: SpeakaCore,
    ButtonEffects: ButtonEffects,
    ContactHandlers: ContactHandlers,
    Modal: SpeakaModal,
    FormHandlers: FormHandlers,
    SubscriptionPage: SubscriptionPage,
    Utils: Utils,
    Performance: Performance,
    init: initSpeaka
};

// ===== 主初始化函數 =====
function initSpeaka() {
    // 確保DOM已載入
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            runInitialization();
        });
    } else {
        runInitialization();
    }
}

// 自動初始化
initSpeaka();

// 調試用：確保 SpeakaModal 在全域可用
window.SpeakaModal = SpeakaModal;

// 提供全域方法以防直接呼叫
window.showPrivacyPolicy = function() {
    console.log('嘗試顯示隱私政策彈窗');
    if (SpeakaModal && typeof SpeakaModal.showPrivacyPolicy === 'function') {
        SpeakaModal.showPrivacyPolicy();
    } else {
        console.error('SpeakaModal.showPrivacyPolicy 不可用');
        // 延遲再試一次
        setTimeout(() => {
            if (SpeakaModal && typeof SpeakaModal.showPrivacyPolicy === 'function') {
                SpeakaModal.showPrivacyPolicy();
            }
        }, 100);
    }
};

window.showTermsOfService = function() {
    console.log('嘗試顯示服務條款彈窗');
    if (SpeakaModal && typeof SpeakaModal.showTermsOfService === 'function') {
        SpeakaModal.showTermsOfService();
    } else {
        console.error('SpeakaModal.showTermsOfService 不可用');
    }
};

// 調試：檢查初始化狀態
console.log('SpeakaModal 是否存在:', !!SpeakaModal);
console.log('showPrivacyPolicy 是否存在:', typeof SpeakaModal.showPrivacyPolicy === 'function');
console.log('showTermsOfService 是否存在:', typeof SpeakaModal.showTermsOfService === 'function');CustomModal('方案選擇', message, [
                { text: 'LINE 聯絡', action: () => window.open('https://line.me/ti/p/@537etdoz', '_blank') },
                { text: 'Email 聯絡', action: () => window.open('mailto:talkeasenow@gmail.com', '_blank') },
                { text: '稍後決定', action: () => {} }
            ]);
        } else {
            alert(message);
        }
    },

    // 顯示企業方案聯絡
    showEnterpriseContact() {
        const message = '企業方案諮詢\n\n請聯絡我們獲取專屬報價：\nLINE: @537etdoz\nEmail: talkeasenow@gmail.com';
        
        if (this.isModernBrowser()) {
            this.showCustomModal('企業方案諮詢', message, [
                { text: 'LINE 諮詢', action: () => window.open('https://line.me/ti/p/@537etdoz', '_blank') },
                { text: 'Email 諮詢', action: () => window.open('mailto:talkeasenow@gmail.com', '_blank') },
                { text: '返回', action: () => {} }
            ]);
        } else {
            alert(message);
        }
    },

    // 顯示訂閱確認
    showSubscriptionConfirm(data) {
        const paymentMethods = {
            linepay: 'LINE Pay',
            credit: '信用卡',
            transfer: '銀行轉帳'
        };

        const invoiceTypes = {
            personal: '個人發票',
            company: '公司發票',
            donation: '捐贈發票'
        };

        const periodNames = {
            monthly: '月繳',
            quarterly: '季繳',
            halfyearly: '半年繳',
            yearly: '年繳'
        };

        if (this.isModernBrowser()) {
            this.showSubscriptionModal(data, paymentMethods, invoiceTypes, periodNames);
        } else {
            // 降級方案 - 使用簡單的 alert
            let message = `確認訂閱資訊：\n\n`;
            message += `群組數量：${data.groupCount} 個\n`;
            message += `計費週期：${periodNames[data.billingPeriod] || data.billingPeriod}\n`;
            message += `支付方式：${paymentMethods[data.paymentMethod]}\n`;
            message += `總金額：${data.totalAmount}\n`;
            message += `聯絡人：${data.contactName}\n`;
            message += `電子郵件：${data.email}\n`;
            message += `發票類型：${invoiceTypes[data.invoiceType]}\n`;
            
            if (data.companyName) {
                message += `公司名稱：${data.companyName}\n`;
                message += `統一編號：${data.taxId}\n`;
            }
            
            message += `\n確認後將跳轉至付款頁面`;

            if (confirm(message)) {
                this.processPayment(data);
            }
        }
    },

    // 顯示專門的訂閱確認彈窗
    showSubscriptionModal(data, paymentMethods, invoiceTypes, periodNames) {
        // 創建遮罩
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(5px);
        `;

        // 創建彈窗
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 20px;
            padding: 0;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            transform: scale(0.8);
            transition: transform 0.3s ease;
        `;

        // 創建彈窗內容
        modal.innerHTML = `
            <div style="padding: 30px 30px 0; text-align: center; border-bottom: 1px solid #f1f5f9;">
                <h3 style="color: #1e293b; font-size: 1.5rem; margin-bottom: 10px; font-weight: 600;">確認訂閱</h3>
                <p style="color: #64748b; margin-bottom: 20px;">請確認以下訂閱資訊</p>
            </div>
            
            <div style="padding: 25px 30px;">
                <!-- 訂閱資訊表格 -->
                <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                    <h4 style="color: #374151; font-size: 1rem; font-weight: 600; margin-bottom: 15px; display: flex; align-items: center;">
                        <span style="margin-right: 8px;">📋</span> 訂閱資訊
                    </h4>
                    <div style="display: grid; gap: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #64748b;">群組數量</span>
                            <span style="color: #1e293b; font-weight: 500;">${data.groupCount} 個</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #64748b;">計費週期</span>
                            <span style="color: #1e293b; font-weight: 500;">${periodNames[data.billingPeriod] || data.billingPeriod}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #64748b;">支付方式</span>
                            <span style="color: #1e293b; font-weight: 500;">${paymentMethods[data.paymentMethod]}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #e2e8f0; margin-top: 8px;">
                            <span style="color: #2563eb; font-weight: 600;">總金額</span>
                            <span style="color: #2563eb; font-weight: 700; font-size: 1.2rem;">${data.totalAmount}</span>
                        </div>
                    </div>
                </div>

                <!-- 聯絡資訊 -->
                <div style="background: #f0f9ff; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                    <h4 style="color: #374151; font-size: 1rem; font-weight: 600; margin-bottom: 15px; display: flex; align-items: center;">
                        <span style="margin-right: 8px;">👤</span> 聯絡資訊
                    </h4>
                    <div style="display: grid; gap: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #64748b;">聯絡人</span>
                            <span style="color: #1e293b; font-weight: 500;">${data.contactName}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #64748b;">電子郵件</span>
                            <span style="color: #1e293b; font-weight: 500;">${data.email}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #64748b;">發票類型</span>
                            <span style="color: #1e293b; font-weight: 500;">${invoiceTypes[data.invoiceType]}</span>
                        </div>
                        ${data.companyName ? `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #64748b;">公司名稱</span>
                            <span style="color: #1e293b; font-weight: 500;">${data.companyName}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #64748b;">統一編號</span>
                            <span style="color: #1e293b; font-weight: 500;">${data.taxId}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <!-- 提示訊息 -->
                <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 12px; margin-bottom: 25px; text-align: center;">
                    <p style="color: #92400e; margin: 0; font-size: 0.9rem;">
                        確認後將為您準備付款頁面，請聯絡客服完成付款流程
                    </p>
                </div>

                <!-- 按鈕組 -->
                <div style="display: flex; gap: 12px;">
                    <button id="confirmPayment" style="
                        flex: 1;
                        background: linear-gradient(135deg, #2563eb, #3b82f6);
                        color: white;
                        border: none;
                        padding: 14px 20px;
                        border-radius: 10px;
                        font-weight: 600;
                        font-size: 1rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">確認付款</button>
                    <button id="modifyData" style="
                        flex: 1;
                        background: white;
                        color: #2563eb;
                        border: 2px solid #2563eb;
                        padding: 14px 20px;
                        border-radius: 10px;
                        font-weight: 600;
                        font-size: 1rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">修改資料</button>
                </div>
            </div>
        `;

        // 添加到頁面
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // 動畫效果
        setTimeout(() => {
            modal.style.transform = 'scale(1)';
        }, 10);

        // 按鈕事件
        modal.querySelector('#confirmPayment').addEventListener('click', () => {
            this.processPayment(data);
            this.closeModal(overlay);
        });

        modal.querySelector('#modifyData').addEventListener('click', () => {
            this.closeModal(overlay);
        });

        // 點擊遮罩關閉
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModal(overlay);
            }
        });

        // ESC 鍵關閉
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(overlay);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    },

    // 處理付款
    processPayment(data) {
        const paymentMethods = {
            linepay: 'LINE Pay',
            credit: '信用卡',
            transfer: '銀行轉帳'
        };

        // 模擬跳轉到付款頁面
        const message = `正在為您準備付款頁面...\n\n` +
                       `付款金額：${data.totalAmount}\n` +
                       `付款方式：${paymentMethods[data.paymentMethod]}\n\n` +
                       `請聯絡客服完成付款流程：\n` +
                       `LINE: @537etdoz\n` +
                       `Email: talkeasenow@gmail.com`;

        if (this.isModernBrowser()) {
            this.showCustomModal('付款處理', message, [
                { text: 'LINE 聯絡', action: () => window.open('https://line.me/ti/p/@537etdoz', '_blank') },
                { text: 'Email 聯絡', action: () => window.open('mailto:talkeasenow@gmail.com', '_blank') }
            ]);
        } else {
            alert(message);
        }
    },

    // 檢查是否為現代瀏覽器
    isModernBrowser() {
        return typeof document.createElement === 'function' && 
               typeof document.body.appendChild === 'function';
    },

    // 創建自定義彈窗
    showCustomModal(title, message, buttons) {
        // 創建遮罩
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(5px);
        `;

        // 創建彈窗
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 20px;
            padding: 40px 30px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            transform: scale(0.8);
            transition: transform 0.3s ease;
        `;

        // 添加標題
        const titleEl = document.createElement('h3');
        titleEl.textContent = title;
        titleEl.style.cssText = `
            color: #1e293b;
            font-size: 1.5rem;
            margin-bottom: 20px;
            font-weight: 600;
        `;

        // 添加訊息
        const messageEl = document.createElement('p');
        messageEl.innerHTML = message;
        messageEl.style.cssText = `
            color: #64748b;
            line-height: 1.6;
            margin-bottom: 30px;
            white-space: pre-line;
        `;

        // 添加按鈕容器
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: center;
        `;

        // 創建按鈕
        buttons.forEach((btn, index) => {
            const button = document.createElement('button');
            button.textContent = btn.text;
            button.style.cssText = `
                padding: 12px 20px;
                border-radius: 8px;
                border: none;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                ${index === 0 ? 
                  'background: #2563eb; color: white;' : 
                  'background: #f8fafc; color: #2563eb; border: 2px solid #2563eb;'
                }
            `;

            button.addEventListener('mouseenter', () => {
                if (index === 0) {
                    button.style.background = '#1d4ed8';
                    button.style.transform = 'translateY(-2px)';
                } else {
                    button.style.background = '#2563eb';
                    button.style.color = 'white';
                }
            });

            button.addEventListener('mouseleave', () => {
                if (index === 0) {
                    button.style.background = '#2563eb';
                    button.style.transform = 'translateY(0)';
                } else {
                    button.style.background = '#f8fafc';
                    button.style.color = '#2563eb';
                }
            });

            button.addEventListener('click', () => {
                btn.action();
                this.closeModal(overlay);
            });

            buttonContainer.appendChild(button);
        });

        // 組裝彈窗
        modal.appendChild(titleEl);
        modal.appendChild(messageEl);
        modal.appendChild(buttonContainer);
        overlay.appendChild(modal);

        // 添加到頁面
        document.body.appendChild(overlay);

        // 動畫效果
        setTimeout(() => {
            modal.style.transform = 'scale(1)';
        }, 10);

        // 點擊遮罩關閉
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModal(overlay);
            }
        });

        // ESC 鍵關閉
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(overlay);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    },

    // 關閉彈窗
    closeModal(overlay) {
        const modal = overlay.querySelector('div');
        modal.style.transform = 'scale(0.8)';
        overlay.style.opacity = '0';
        
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    },

    // 顯示服務條款
    showTermsOfService() {
        const content = `
            <div style="text-align: left; line-height: 1.6; max-height: 400px; overflow-y: auto; padding: 20px;">
                <h3 style="color: #1e293b; margin-bottom: 20px;">Speaka 服務條款</h3>
                
                <h4 style="color: #374151; margin: 16px 0 8px;">1. 服務說明</h4>
                <p style="margin-bottom: 12px;">Speaka 是一個專業的多語系翻譯機器人服務，主要提供 LINE 群組即時翻譯功能。</p>
                
                <h4 style="color: #374151; margin: 16px 0 8px;">2. 服務範圍</h4>
                <p style="margin-bottom: 12px;">• 中文與多語系之間的即時雙向翻譯</p>
                <p style="margin-bottom: 12px;">• LINE 平台群組翻譯服務</p>
                <p style="margin-bottom: 12px;">• 技術支援與客戶服務</p>
                
                <h4 style="color: #374151; margin: 16px 0 8px;">3. 使用規範</h4>
                <p style="margin-bottom: 12px;">• 禁止濫用或惡意使用服務</p>
                <p style="margin-bottom: 12px;">• 不得用於非法或不當用途</p>
                <p style="margin-bottom: 12px;">• 尊重其他用戶的使用權益</p>
                
                <h4 style="color: #374151; margin: 16px 0 8px;">4. 付費與退款</h4>
                <p style="margin-bottom: 12px;">• 服務採用訂閱制收費模式</p>
                <p style="margin-bottom: 12px;">• 月繳方案可隨時取消</p>
                <p style="margin-bottom: 12px;">• 不滿意可享比例退費保障</p>
                
                <h4 style="color: #374151; margin: 16px 0 8px;">5. 服務保障</h4>
                <p style="margin-bottom: 12px;">• 提供 99.9% 的服務可用性</p>
                <p style="margin-bottom: 12px;">• 資料安全與隱私保護</p>
                
                <h4 style="color: #374151; margin: 16px 0 8px;">6. 責任限制</h4>
                <p style="margin-bottom: 12px;">• 翻譯結果僅供參考，重要文件建議人工確認</p>
                <p style="margin-bottom: 12px;">• 不承擔因翻譯錯誤造成的間接損失</p>
                
                <h4 style="color: #374151; margin: 16px 0 8px;">7. 條款變更</h4>
                <p style="margin-bottom: 12px;">本公司保留修改服務條款的權利，變更將透過官方管道通知用戶。</p>
                
                <p style="margin-top: 20px; color: #64748b; font-size: 0.9rem;">
                    最後更新日期：2025年1月
                </p>
            </div>
        `;
        
        this.show
