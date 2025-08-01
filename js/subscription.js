/* ===== Speaka 訂閱頁面優化腳本 ===== */

// 繼承主頁面的核心功能
const SpeakaCore = {
    // 處理導覽列在捲動時的樣式變化
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

    // 鍵結平滑滾動效果
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                // 條款連結不適用平滑滾動
                if (this.classList.contains('terms-link')) {
                    return;
                }
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId && targetId !== '#') {
                    const target = document.querySelector(targetId);
                    if (target) {
                        const headerOffset = 80;
                        const elementPosition = target.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    }
                }
            });
        });
    },

    // 監聽元素進入視窗時添加動畫
    initScrollAnimations() {
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('.fade-in').forEach(el => {
                el.classList.add('visible');
            });
            return;
        }
        const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -30px 0px' };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    },

    // 頁面載入時的初始化效果
    initPageLoad() {
        document.addEventListener('DOMContentLoaded', () => {
            document.body.classList.add('loaded');
        });
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 50);
        });
    },

    // 核心初始化：處理預選方案與導覽列
    init() {
        const urlParams = new URLSearchParams(window.location.search);
        const selectedPlan = urlParams.get('plan');
        if (selectedPlan) {
            const radio = document.querySelector(`input[name="billingPeriod"][value="${selectedPlan}"]`);
            if (radio) radio.checked = true;
        }
        this.initNavbarScroll();
        this.initSmoothScroll();
        this.initScrollAnimations();
        this.initPageLoad();
    }
};

// 訂閱頁面專用功能
const SubscriptionPage = {
    // 方案價格定義
    prices: {
        monthly:   { price: 199,  period: '月' },
        // Removed quarterly plan and adjusted halfyearly discount to reflect the design
        halfyearly:{ price: 1199, period: '半年', discount: '5%'  },
        yearly:    { price: 2030, period: '年',   discount: '15%' }
    },

    // 主初始化：偵測是否為訂閱頁面，然後啟動相關功能
    init() {
        if (!this.isSubscriptionPage()) return;
        // 如果帶著付款結果回到訂閱頁，立即檢查並提示
        this.checkPaymentStatus();
        this.initPriceCalculation();
        this.initPaymentMethods();
        this.initInvoiceType();
        this.initFormValidation();
        this.initFormSubmission();
        this.initAccessibilityFeatures();
        this.updatePrice();
        console.log('✅ 訂閱頁面初始化完成');
    },

    // 判斷當前頁面是否存在訂閱表單
    isSubscriptionPage() {
        return document.getElementById('subscriptionForm') !== null;
    },

    // 價格計算相關初始設定
    initPriceCalculation() {
        const groupCountInput = document.getElementById('groupCount');
        const billingRadios   = document.querySelectorAll('input[name="billingPeriod"]');
        if (groupCountInput) {
            // 限制輸入範圍並即時更新價格
            groupCountInput.addEventListener('input', (e) => {
                let value = parseInt(e.target.value) || 1;
                if (value < 1) value = 1;
                if (value > 999) value = 999;
                e.target.value = value;
                this.updatePrice();
            });
            // 支援上下鍵調整數量
            groupCountInput.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.adjustGroupCount(1);
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.adjustGroupCount(-1);
                }
            });
        }
        billingRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.updatePrice();
                this.highlightSelectedPlan(radio);
            });
        });
        const defaultRadio = document.querySelector('input[name="billingPeriod"]:checked');
        if (defaultRadio) {
            this.highlightSelectedPlan(defaultRadio);
        }
    },

    // 調整群組數量的輔助函式
    adjustGroupCount(delta) {
        const input = document.getElementById('groupCount');
        if (!input) return;
        let currentValue = parseInt(input.value) || 1;
        let newValue     = currentValue + delta;
        if (newValue < 1) newValue = 1;
        if (newValue > 999) newValue = 999;
        input.value = newValue;
        this.updatePrice();
    },

    // 高亮已選方案
    highlightSelectedPlan(radio) {
        document.querySelectorAll('.billing-label').forEach(label => {
            label.classList.remove('selected');
        });
        const selectedLabel = radio.closest('.billing-option').querySelector('.billing-label');
        if (selectedLabel) {
            selectedLabel.classList.add('selected');
        }
    },

    // 計算並更新價格顯示
    updatePrice() {
        const groupCount    = parseInt(document.getElementById('groupCount')?.value) || 1;
        const selectedPeriod= document.querySelector('input[name="billingPeriod"]:checked')?.value || 'monthly';
        const priceInfo     = this.prices[selectedPeriod];
        if (!priceInfo) return;
        const unitPrice = priceInfo.price;
        const total     = unitPrice * groupCount;
        this.updatePriceDisplay(unitPrice, groupCount, total, priceInfo.period);
        this.updatePageTitle(total);
    },

    // 依據計算結果更新各欄位文字
    updatePriceDisplay(unitPrice, groupCount, total, period) {
        const elements = {
            unitPrice: document.getElementById('unitPrice'),
            groupQuantity: document.getElementById('groupQuantity'),
            subtotal: document.getElementById('subtotal'),
            totalPrice: document.getElementById('totalPrice')
        };
        if (elements.unitPrice) {
            elements.unitPrice.textContent = `NT$ ${unitPrice.toLocaleString()} / 群組 / ${period}`;
        }
        if (elements.groupQuantity) {
            elements.groupQuantity.textContent = `${groupCount} 個群組`;
        }
        if (elements.subtotal) {
            elements.subtotal.textContent = `NT$ ${total.toLocaleString()}`;
        }
        if (elements.totalPrice) {
            elements.totalPrice.textContent = `NT$ ${total.toLocaleString()}`;
        }
    },

    // 更新頁面標題顯示的總價格
    updatePageTitle(total) {
        const titleElement = document.querySelector('.subscription-header h1 .price-highlight');
        if (titleElement) {
            titleElement.textContent = `NT$ ${total.toLocaleString()}`;
        }
    },

    // 初始化支付方式選擇
    initPaymentMethods() {
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.payment-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.classList.add('selected');
                const radio = this.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
            option.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    },

    // 處理發票類型選擇
    initInvoiceType() {
        const invoiceTypeSelect = document.getElementById('invoiceType');
        if (!invoiceTypeSelect) return;
        invoiceTypeSelect.addEventListener('change', (e) => {
            this.toggleCompanyFields(e.target.value === 'company');
        });
        this.toggleCompanyFields(invoiceTypeSelect.value === 'company');
    },

    // 顯示或隱藏公司欄位
    toggleCompanyFields(show) {
        const companyFields = document.querySelectorAll('.company-field');
        const companyName   = document.getElementById('companyName');
        const taxId         = document.getElementById('taxId');
        companyFields.forEach(field => {
            field.style.display = show ? 'flex' : 'none';
            if (show) {
                field.style.opacity = '0';
                field.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    field.style.transition = 'all 0.3s ease';
                    field.style.opacity = '1';
                    field.style.transform = 'translateY(0)';
                }, 10);
            }
        });
        if (companyName) {
            companyName.required = show;
            if (!show) companyName.value = '';
        }
        if (taxId) {
            taxId.required = show;
            if (!show) taxId.value = '';
        }
    },

    // 初始化表單驗證
    initFormValidation() {
        const validators = {
            taxId: this.createTaxIdValidator(),
            phone: this.createPhoneValidator(),
            email: this.createEmailValidator(),
            contactName: this.createNameValidator()
        };
        Object.entries(validators).forEach(([fieldId, validator]) => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.validator = validator;
                field.addEventListener('blur', function() {
                    this.validator.validate(this);
                });
                field.addEventListener('input', function() {
                    if (this.classList.contains('error')) {
                        this.validator.clearError(this);
                    }
                });
            }
        });
    },

    // 統一編號驗證規則
    createTaxIdValidator() {
        return {
            validate: (field) => {
                const value = field.value.replace(/\D/g, '');
                field.value = value.substring(0, 8);
                if (value.length === 0) {
                    this.clearFieldError(field);
                    return true;
                } else if (value.length !== 8) {
                    this.showFieldError(field, '統一編號必須為8位數字');
                    return false;
                } else if (!this.isValidTaxId(value)) {
                    this.showFieldError(field, '統一編號格式不正確');
                    return false;
                } else {
                    this.clearFieldError(field);
                    return true;
                }
            },
            clearError: (field) => this.clearFieldError(field)
        };
    },

    // 電話號碼驗證規則
    createPhoneValidator() {
        return {
            validate: (field) => {
                const value = field.value.replace(/[\s\-\(\)]/g, '');
                if (value.length === 0) {
                    this.clearFieldError(field);
                    return true;
                }
                const patterns = [
                    /^09\d{8}$/,
                    /^0[2-8]\d{7,8}$/,
                    /^\+\d{8,15}$/
                ];
                const isValid = patterns.some(pattern => pattern.test(value));
                if (isValid) {
                    this.clearFieldError(field);
                    return true;
                } else {
                    this.showFieldError(field, '請輸入正確的電話號碼格式');
                    return false;
                }
            },
            clearError: (field) => this.clearFieldError(field)
        };
    },

    // 電子郵件驗證規則
    createEmailValidator() {
        return {
            validate: (field) => {
                const value = field.value.trim();
                if (value.length === 0) {
                    this.clearFieldError(field);
                    return true;
                }
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailPattern.test(value)) {
                    this.clearFieldError(field);
                    return true;
                } else {
                    this.showFieldError(field, '請輸入正確的電子郵件格式');
                    return false;
                }
            },
            clearError: (field) => this.clearFieldError(field)
        };
    },

    // 姓名欄位驗證規則
    createNameValidator() {
        return {
            validate: (field) => {
                const value = field.value.trim();
                if (value.length === 0) {
                    this.clearFieldError(field);
                    return true;
                }
                if (value.length >= 2 && value.length <= 20) {
                    this.clearFieldError(field);
                    return true;
                } else {
                    this.showFieldError(field, '姓名長度應為2-20個字符');
                    return false;
                }
            },
            clearError: (field) => this.clearFieldError(field)
        };
    },

    // 顯示欄位錯誤訊息
    showFieldError(field, message) {
        this.clearFieldError(field);
        field.classList.add('error');
        field.style.borderColor = 'var(--error)';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    },

    // 清除欄位錯誤顯示
    clearFieldError(field) {
        field.classList.remove('error');
        field.style.borderColor = '';
        const errorMessages = field.parentNode.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
    },

    // 台灣統一編號合法性檢查
    isValidTaxId(taxId) {
        if (!/^\d{8}$/.test(taxId)) return false;
        const weights = [1, 2, 1, 2, 1, 2, 4, 1];
        let sum = 0;
        for (let i = 0; i < 8; i++) {
            let product = parseInt(taxId[i]) * weights[i];
            sum += Math.floor(product / 10) + (product % 10);
        }
        return sum % 10 === 0;
    },

    // 表單驗證主函式
    validateForm() {
        let isValid = true;
        const errors = [];
        const requiredFields = [
            { id: 'contactName', name: '聯絡人姓名' },
            { id: 'email',      name: '電子郵件'   },
            { id: 'phone',      name: '聯絡電話'   },
            { id: 'invoiceType',name: '發票類型'   }
        ];
        requiredFields.forEach(field => {
            const input = document.getElementById(field.id);
            if (input && !input.value.trim()) {
                errors.push(`${field.name}為必填欄位`);
                this.showFieldError(input, `${field.name}為必填欄位`);
                isValid = false;
            }
        });
        const invoiceType = document.getElementById('invoiceType')?.value;
        if (invoiceType === 'company') {
            const companyName = document.getElementById('companyName');
            const taxId       = document.getElementById('taxId');
            if (!companyName?.value.trim()) {
                errors.push('公司名稱為必填欄位');
                this.showFieldError(companyName, '公司名稱為必填欄位');
                isValid = false;
            }
            if (!taxId?.value.trim()) {
                errors.push('統一編號為必填欄位');
                this.showFieldError(taxId, '統一編號為必填欄位');
                isValid = false;
            } else if (taxId.validator && !taxId.validator.validate(taxId)) {
                isValid = false;
            }
        }
        ['email', 'phone', 'contactName'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && field.value && field.validator) {
                if (!field.validator.validate(field)) {
                    isValid = false;
                }
            }
        });
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (!paymentMethod) {
            errors.push('請選擇支付方式');
            isValid = false;
        }
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

    // 顯示驗證錯誤彈窗
    showValidationErrors(errors) {
        const errorMessage = '請修正以下錯誤：\n\n' + errors.join('\n');
        this.showErrorModal('表單驗證錯誤', errorMessage);
        const firstError = document.querySelector('.form-input.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => firstError.focus(), 500);
        }
    },

    // 通用錯誤訊息彈窗
    showErrorModal(title, message) {
        const modal = document.createElement('div');
        modal.className = 'error-modal';
        modal.innerHTML = `
            <div class="error-modal-overlay">
                <div class="error-modal-content">
                    <h3>${title}</h3>
                    <div class="error-list">
                        ${message.split('\n\n')[1].split('\n').map(error => 
                            `<div class="error-item">• ${error}</div>`
                        ).join('')}
                    </div>
                    <button class="error-modal-close">確定</button>
                </div>
            </div>
        `;
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
        `;
        const overlay = modal.querySelector('.error-modal-overlay');
        overlay.style.cssText = `
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;
        const content = modal.querySelector('.error-modal-content');
        content.style.cssText = `
            background: white;
            border-radius: 16px;
            padding: 32px;
            max-width: 400px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;
        const closeButton = modal.querySelector('.error-modal-close');
        closeButton.style.cssText = `
            background: var(--primary);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 20px;
        `;
        document.body.appendChild(modal);
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(modal);
            }
        });
    },

    // 表單送出處理
    initFormSubmission() {
        const form = document.getElementById('subscriptionForm');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn   = form.querySelector('.submit-btn');
            const originalText= submitBtn.textContent;
            submitBtn.textContent = '處理中...';
            submitBtn.disabled   = true;
            setTimeout(() => {
                if (this.validateForm()) {
                    const formData = new FormData(form);
                    const data     = Object.fromEntries(formData);
                    // 將群組數量和總金額加入資料中
                    data.groupCount  = document.getElementById('groupCount')?.value || '1';
                    data.totalAmount = document.getElementById('totalPrice')?.textContent || 'NT$ 199';
                    // 送使用者至對應的金流頁面
                    this.redirectToPayment(data);
                }
                submitBtn.textContent = originalText;
                submitBtn.disabled   = false;
            }, 1000);
        });
        this.initTermsLinks();
    },

    // 啟用服務條款／隱私政策連結
    initTermsLinks() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('terms-link')) {
                e.preventDefault();
                e.stopPropagation();
                const type = e.target.getAttribute('data-type') || 
                             (e.target.textContent.includes('服務條款') ? 'terms' : 'privacy');
                if (type === 'terms') {
                    this.showTermsModal();
                } else if (type === 'privacy') {
                    this.showPrivacyModal();
                }
            }
        });
    },

    // 顯示服務條款彈窗
    showTermsModal() {
        const content = `
            <h3>服務條款</h3>
            <div class="terms-content">
                <h4>1. 服務說明</h4>
                <p>Speaka 提供 LINE 群組即時翻譯服務，支援多種語言間的雙向翻譯。</p>
                
                <h4>2. 使用規範</h4>
                <p>用戶同意合法使用本服務，不得用於違法或有害目的。</p>
                
                <h4>3. 服務費用</h4>
                <p>服務費用依所選方案計費，付款後即開始服務期間。</p>
                
                <h4>4. 服務品質</h4>
                <p>我們致力提供穩定的翻譯服務，但不保證翻譯結果的絕對準確性。</p>
                
                <h4>5. 隱私保護</h4>
                <p>我們承諾保護用戶隱私，翻譯內容僅用於提供服務，不會儲存或分析。</p>
                
                <h4>6. 服務變更</h4>
                <p>我們保留修改服務內容和條款的權利，變更將提前通知用戶。</p>
                
                <h4>7. 責任限制</h4>
                <p>本服務按現況提供，對於使用本服務造成的任何損失，我們不承擔責任。</p>
                
                <h4>8. 聯絡方式</h4>
                <p>如有疑問，請聯絡：talkeasenow@gmail.com 或 LINE: @537etdoz</p>
            </div>
        `;
        this.showModal('服務條款', content);
    },

    // 顯示隱私政策彈窗
    showPrivacyModal() {
        const content = `
            <h3>隱私政策</h3>
            <div class="terms-content">
                <h4>1. 資料收集</h4>
                <p>我們收集以下類型的個人資料：</p>
                <ul>
                    <li>聯絡資訊：姓名、電子郵件、電話號碼、地址</li>
                    <li>帳務資訊：發票資料、付款記錄</li>
                    <li>使用資料：服務使用情況、技術日誌</li>
                </ul>
                
                <h4>2. 資料用途</h4>
                <ul>
                    <li>提供翻譯服務</li>
                    <li>客戶支援與技術協助</li>
                    <li>帳務處理與發票開立</li>
                    <li>服務改善與品質提升</li>
                </ul>
                
                <h4>3. 資料保護</h4>
                <ul>
                    <li>採用業界標準的加密技術</li>
                    <li>限制員工存取權限</li>
                    <li>定期進行安全性檢查</li>
                    <li>遵循個人資料保護法規</li>
                </ul>
                
                <h4>4. 翻譯內容處理</h4>
                <ul>
                    <li>翻譯內容僅用於提供翻譯服務</li>
                    <li>不會儲存或分析群組對話內容</li>
                    <li>即時處理，不留存敏感資訊</li>
                </ul>
                
                <h4>5. 您的權利</h4>
                <ul>
                    <li>查詢個人資料</li>
                    <li>更正錯誤資料</li>
                    <li>刪除個人資料</li>
                    <li>停止資料處理</li>
                </ul>
                
                <h4>6. 聯絡我們</h4>
                <p>如有隱私相關問題，請聯絡：</p>
                <p>Email: talkeasenow@gmail.com<br>LINE: @537etdoz</p>
                
                <p style="margin-top: 20px; color: #64748b; font-size: 14px;">
                    最後更新日期：2025年1月
                </p>
            </div>
        `;
        this.showModal('隱私政策', content);
    },

    // 通用條款彈窗
    showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'terms-modal';
        modal.innerHTML = `
            <div class="terms-modal-overlay">
                <div class="terms-modal-content">
                    ${content}
                    <button class="terms-modal-close">我已了解</button>
                </div>
            </div>
        `;
        const styles = `
            .terms-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
            }
            .terms-modal-overlay {
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                backdrop-filter: blur(5px);
            }
            .terms-modal-content {
                background: white;
                border-radius: 16px;
                padding: 0;
                max-width: 600px;
                width: 100%;
                max-height: 80vh;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                display: flex;
                flex-direction: column;
            }
            .terms-modal-content h3 {
                background: var(--primary);
                color: white;
                margin: 0;
                padding: 20px 30px;
                font-size: 20px;
                font-weight: 600;
            }
            .terms-content {
                padding: 30px;
                overflow-y: auto;
                flex: 1;
            }
            .terms-content h4 {
                color: var(--text-primary);
                margin: 20px 0 10px 0;
                font-size: 16px;
                font-weight: 600;
            }
            .terms-content p, .terms-content li {
                color: var(--text-secondary);
                line-height: 1.6;
                margin-bottom: 8px;
            }
            .terms-content ul {
                margin-left: 20px;
                margin-bottom: 16px;
            }
            .terms-modal-close {
                background: var(--primary);
                color: white;
                border: none;
                padding: 16px 32px;
                font-weight: 600;
                cursor: pointer;
                margin: 0 30px 30px 30px;
                border-radius: 8px;
                transition: var(--transition);
            }
            .terms-modal-close:hover {
                background: var(--primary-hover);
            }
        `;
        if (!document.getElementById('terms-modal-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'terms-modal-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }
        document.body.appendChild(modal);
        const closeButton = modal.querySelector('.terms-modal-close');
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        modal.querySelector('.terms-modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                document.body.removeChild(modal);
            }
        });
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    },

    // 訂閱完成提示
    showSubscriptionConfirm(data) {
        const message = `
            感謝您的訂閱！
            
            訂閱資訊：
            群組數量：${data.groupCount} 個
            總金額：${data.totalAmount}
            
            我們將盡快為您開通服務。
            如有任何問題，請聯絡客服。
        `;
        alert(message);
    },

    // 導向金流頁面：根據所選支付方式跳轉到模擬付款頁
    redirectToPayment(data) {
        // 若表單資料中沒有 paymentMethod，嘗試從選中的單選框取得
        const method = data.paymentMethod || document.querySelector('input[name="paymentMethod"]:checked')?.value || 'linepay';
        // URI encode 避免中文參數問題
        const methodCode = encodeURIComponent(method);
        const groupCount = encodeURIComponent(data.groupCount || '1');
        const total      = encodeURIComponent(data.totalAmount || '');
        // 取得所選方案（計費週期）
        const periodVal  = data.billingPeriod || document.querySelector('input[name="billingPeriod"]:checked')?.value || '';
        const period     = encodeURIComponent(periodVal);
        // 加入 LINE ID，若表單有填寫則帶入參數
        const lineId     = encodeURIComponent(data.lineId || document.getElementById('lineId')?.value || '');
        // 將使用者導向模擬付款頁並攜帶資訊：方案、群組數、總金額、付款方式與 LINE ID
        window.location.href = `payment.html?method=${methodCode}&groupCount=${groupCount}&total=${total}&period=${period}&lineId=${lineId}`;
    },

    // 檢查 URL 參數以確認付款結果並在回到訂閱頁時提示用戶
    checkPaymentStatus() {
        const params = new URLSearchParams(window.location.search);
        const status = params.get('status');
        if (status === 'success') {
            const groupCount = params.get('groupCount') || '1';
            const total      = params.get('total')      || '';
            const period     = params.get('period')     || '';
            const lineId     = params.get('lineId')     || '';
            // 將方案代碼轉換成中文顯示
            const planMap = { monthly: '月繳', halfyearly: '半年繳', yearly: '年繳' };
            const planText= planMap[period] || '';
            let message   = `感謝您的付款！\n\n訂閱已成功開通。\n`;
            if (planText) message += `方案：${planText}\n`;
            message      += `群組數量：${groupCount} 個\n總金額：${total}\n\n`;
            if (lineId) {
                message += `您的 LINE ID：${lineId}\n`;
            }
            message      += `請加入官方 LINE 完成服務開通（官方 LINE：@537etdoz）。\n如有任何問題，請聯絡客服。`;
            alert(message);
            // 移除 URL 參數以避免重複提示
            history.replaceState(null, '', window.location.pathname);
        }
    },

    // 輔助可及性功能：鍵盤操作提示與標籤焦點
    initAccessibilityFeatures() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('using-keyboard');
            }
        });
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('using-keyboard');
        });
        document.querySelectorAll('.form-label').forEach(label => {
            label.addEventListener('click', function() {
                const input = this.parentNode.querySelector('.form-input, .form-select');
                if (input) input.focus();
            });
        });
    }
};

// 互動效果模組，提供按鈕波紋與卡片懸浮效果
const InteractiveEffects = {
    init() {
        this.initButtonEffects();
        this.initCardHoverEffects();
        this.initFormFocusEffects();
    },
    // 點擊按鈕產生波紋效果
    initButtonEffects() {
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.submit-btn, .billing-label, .payment-option');
            if (button && !button.disabled) {
                this.addRippleEffect(button, e);
            }
        });
    },
    addRippleEffect(element, event) {
        const ripple = document.createElement('span');
        const rect  = element.getBoundingClientRect();
        const size  = Math.max(rect.width, rect.height);
        const x     = event.clientX - rect.left - size / 2;
        const y     = event.clientY - rect.top  - size / 2;
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
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        setTimeout(() => {
            if (ripple.parentNode) ripple.remove();
        }, 400);
    },
    // 卡片懸浮效果
    initCardHoverEffects() {
        document.querySelectorAll('.subscription-card, .billing-label').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
            });
            card.addEventListener('mouseleave', function() {
                if (!this.classList.contains('selected')) {
                    this.style.transform = 'translateY(0)';
                }
            });
        });
    },
    // 表單焦點效果
    initFormFocusEffects() {
        document.querySelectorAll('.form-input, .form-select').forEach(input => {
            input.addEventListener('focus', function() {
                this.parentNode.classList.add('focused');
            });
            input.addEventListener('blur', function() {
                this.parentNode.classList.remove('focused');
            });
        });
    }
};

// 主初始化函數
function initializeSubscriptionPage() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSubscriptionPage);
        return;
    }
    try {
        SpeakaCore.init();
        SubscriptionPage.init();
        InteractiveEffects.init();
        console.log('🎉 訂閱頁面初始化完成！');
        window.dispatchEvent(new CustomEvent('subscriptionPageReady', { detail: { timestamp: Date.now() } }));
    } catch (error) {
        console.error('❌ 訂閱頁面初始化失敗:', error);
        // 如果初始化失敗，至少讓淡入元素顯示出來
        document.querySelectorAll('.fade-in').forEach(el => {
            el.classList.add('visible');
        });
    }
}

// 如果尚未注入動畫樣式，則添加
if (!document.getElementById('subscription-animations')) {
    const animationStyles = document.createElement('style');
    animationStyles.id = 'subscription-animations';
    animationStyles.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .focused .form-label {
            color: var(--primary);
        }
        
        .focused .form-input,
        .focused .form-select {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        
        .billing-label.selected {
            transform: translateY(-2px);
        }
        
        .payment-option.selected {
            transform: translateY(-1px);
        }
        
        .form-input:invalid {
            border-color: var(--error);
        }
        
        .form-input:valid {
            border-color: var(--success);
        }
        
        .loading-spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 0.8s ease-in-out infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .shake {
            animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        .success-checkmark {
            display: inline-block;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--success);
            position: relative;
            animation: successPop 0.3s ease-out;
        }
        
        .success-checkmark::after {
            content: '✓';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 12px;
            font-weight: bold;
        }
        
        @keyframes successPop {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
        
        /* 提升表單可用性 */
        .form-input:focus + .input-hint {
            color: var(--primary);
        }
        
        .error-message {
            animation: errorSlideIn 0.3s ease-out;
        }
        
        @keyframes errorSlideIn {
            from { opacity: 0; transform: translateY(-10px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        
        /* 改善行動裝置體驗 */
        @media (hover: none) {
            .billing-label:hover,
            .payment-option:hover,
            .subscription-card:hover {
                transform: none;
            }
        }
        
        /* 高對比模式支援 */
        @media (prefers-contrast: high) {
            .form-input,
            .form-select {
                border-width: 3px;
            }
            .billing-label,
            .payment-option {
                border-width: 3px;
            }
        }
        
        /* 減少動畫模式 */
        @media (prefers-reduced-motion: reduce) {
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;
    document.head.appendChild(animationStyles);
}

// 啟動應用程式
initializeSubscriptionPage();

// 將模組掛載到 window 方便外部呼叫
window.SubscriptionSpeaka = {
    Core: SpeakaCore,
    SubscriptionPage: SubscriptionPage,
    Effects: InteractiveEffects,
    init: initializeSubscriptionPage
};

// 全域函式：手動更新價格
window.updateSubscriptionPrice = function() {
    if (SubscriptionPage.isSubscriptionPage()) {
        SubscriptionPage.updatePrice();
    }
};

// 全域函式：手動驗證表單
window.validateSubscriptionForm = function() {
    if (SubscriptionPage.isSubscriptionPage()) {
        return SubscriptionPage.validateForm();
    }
    return false;
};

// 調試輔助函式，供開發者快速查詢資訊
window.debugSubscription = {
    // 顯示各方案價格
    showPrices: () => console.table(SubscriptionPage.prices),
    // 取得目前表單資料
    getCurrentData: () => {
        const form = document.getElementById('subscriptionForm');
        if (form) {
            const formData = new FormData(form);
            return Object.fromEntries(formData);
        }
        return null;
    },
    // 測試驗證結果
    testValidation: () => {
        return SubscriptionPage.validateForm();
    },
    // 顯示服務條款
    showTerms: () => {
        SubscriptionPage.showTermsModal();
    },
    // 顯示隱私政策
    showPrivacy: () => {
        SubscriptionPage.showPrivacyModal();
    }
};