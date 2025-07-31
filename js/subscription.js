        let currentValue = parseInt(input.value) || 1;
        let newValue = currentValue + delta;
        
        if (newValue < 1) newValue = 1;
        if (newValue > 999) newValue = 999;
        
        input.value = newValue;
        this.updatePrice();
    },

    highlightSelectedPlan(radio) {
        // 移除所有高亮
        document.querySelectorAll('.billing-label').forEach(label => {
            label.classList.remove('selected');
        });
        
        // 高亮選中的方案
        const selectedLabel = radio.closest('.billing-option').querySelector('.billing-label');
        if (selectedLabel) {
            selectedLabel.classList.add('selected');
        }
    },

    updatePrice() {
        const groupCount = parseInt(document.getElementById('groupCount')?.value) || 1;
        const selectedPeriod = document.querySelector('input[name="billingPeriod"]:checked')?.value || 'monthly';
        const priceInfo = this.prices[selectedPeriod];
        
        if (!priceInfo) return;
        
        const unitPrice = priceInfo.price;
        const total = unitPrice * groupCount;

        // 更新價格顯示
        this.updatePriceDisplay(unitPrice, groupCount, total, priceInfo.period);
        
        // 更新頁面標題中的價格（如果存在）
        this.updatePageTitle(total);
    },

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

    updatePageTitle(total) {
        const titleElement = document.querySelector('.subscription-header h1 .price-highlight');
        if (titleElement) {
            titleElement.textContent = `NT$ ${total.toLocaleString()}`;
        }
    },

    initPaymentMethods() {
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', function() {
                // 移除所有選中狀態
                document.querySelectorAll('.payment-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // 設定當前選中
                this.classList.add('selected');
                const radio = this.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                }
                
                // 添加視覺反饋
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });

            // 鍵盤支援
            option.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    },

    initInvoiceType() {
        const invoiceTypeSelect = document.getElementById('invoiceType');
        if (!invoiceTypeSelect) return;

        invoiceTypeSelect.addEventListener('change', (e) => {
            this.toggleCompanyFields(e.target.value === 'company');
        });

        // 初始設定
        this.toggleCompanyFields(invoiceTypeSelect.value === 'company');
    },

    toggleCompanyFields(show) {
        const companyFields = document.querySelectorAll('.company-field');
        const companyName = document.getElementById('companyName');
        const taxId = document.getElementById('taxId');
        
        companyFields.forEach(field => {
            field.style.display = show ? 'flex' : 'none';
            
            // 添加過渡動畫
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

    initFormValidation() {
        // 即時驗證設定
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
                
                // 即時驗證
                field.addEventListener('blur', function() {
                    this.validator.validate(this);
                });
                
                // 輸入時清除錯誤
                field.addEventListener('input', function() {
                    if (this.classList.contains('error')) {
                        this.validator.clearError(this);
                    }
                });
            }
        });
    },

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

    createPhoneValidator() {
        return {
            validate: (field) => {
                const value = field.value.replace(/[\s\-\(\)]/g, '');
                
                if (value.length === 0) {
                    this.clearFieldError(field);
                    return true;
                }
                
                const patterns = [
                    /^09\d{8}$/, // 台灣手機
                    /^0[2-8]\d{7,8}$/, // 市話
                    /^\+\d{8,15}$/ // 國際號碼
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

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('error');
        field.style.borderColor = 'var(--error)';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    },

    clearFieldError(field) {
        field.classList.remove('error');
        field.style.borderColor = '';
        
        const errorMessages = field.parentNode.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
    },

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

    validateForm() {
        let isValid = true;
        const errors = [];

        // 驗證必填欄位
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
                this.showFieldError(input, `${field.name}為必填欄位`);
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

        // 個別欄位驗證
        ['email', 'phone', 'contactName'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && field.value && field.validator) {
                if (!field.validator.validate(field)) {
                    isValid = false;
                }
            }
        });

        // 支付方式驗證
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (!paymentMethod) {
            errors.push('請選擇支付方式');
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

    showValidationErrors(errors) {
        const errorMessage = '請修正以下錯誤：\n\n' + errors.join('\n');
        
        // 創建錯誤提示彈窗
        this.showErrorModal('表單驗證錯誤', errorMessage);
        
        // 滾動到第一個錯誤欄位
        const firstError = document.querySelector('.form-input.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => firstError.focus(), 500);
        }
    },

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

        // 添加樣式
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

        // 關閉事件
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(modal);
            }
        });
    },

    initFormSubmission() {
        const form = document.getElementById('subscriptionForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // 顯示載入狀態
            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '處理中...';
            submitBtn.disabled = true;

            // 模擬驗證延遲
            setTimeout(() => {
                if (this.validateForm()) {
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData);
                    
                    // 添加計算的價格資訊
                    data.groupCount = document.getElementById('groupCount')?.value || '1';
                    data.totalAmount = document.getElementById('totalPrice')?.textContent || 'NT$ 199';
                    
                    this.showSubscriptionConfirm(data);
                }
                
                // 恢復按鈕狀態
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1000);
        });

        this.initTermsLinks();
    },

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

        // 添加樣式
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

        // 添加樣式到頁面
        if (!document.getElementById('terms-modal-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'terms-modal-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }

        document.body.appendChild(modal);

        // 關閉事件
        const closeButton = modal.querySelector('.terms-modal-close');
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('.terms-modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                document.body.removeChild(modal);
            }
        });

        // ESC 鍵關閉
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    },

    showSubscriptionConfirm(data) {
        // 這裡可以整合支付系統或顯示確認彈窗
        const message = `
            感謝您的訂閱！
            
            訂閱資訊：
            群組數量：${data.groupCount} 個
            總金額：${data.totalAmount}
            
            我們將盡快為您開通服務。
            如有任何問題，請聯絡客服。
        `;
        
        alert(message);
        
        // 可以在這裡跳轉到確認頁面或付款頁面
        // window.location.href = 'confirmation.html';
    },

    initAccessibilityFeatures() {
        // 鍵盤導航支援
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('using-keyboard');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('using-keyboard');
        });

        // 表單標籤點擊支援
        document.querySelectorAll('.form-label').forEach(label => {
            label.addEventListener('click', function() {
                const input = this.parentNode.querySelector('.form-input, .form-select');
                if (input) input.focus();
            });
        });
    }
};

// 互動效果模組
const InteractiveEffects = {
    init() {
        this.initButtonEffects();
        this.initCardHoverEffects();
        this.initFormFocusEffects();
    },

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
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
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
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 400);
    },

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
        
        // 發送初始化完成事件
        window.dispatchEvent(new CustomEvent('subscriptionPageReady', {
            detail: { timestamp: Date.now() }
        }));
        
    } catch (error) {
        console.error('❌ 訂閱頁面初始化失敗:', error);
        
        // 確保基本功能仍然可用
        document.querySelectorAll('.fade-in').forEach(el => {
            el.classList.add('visible');
        });
    }
}

// 添加必要的 CSS 動畫
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
            from { 
                opacity: 0; 
                transform: translateY(-10px); 
            }
            to { 
                opacity: 1; 
                transform: translateY(0); 
            }
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

// 導出模組供外部使用
window.SubscriptionSpeaka = {
    Core: SpeakaCore,
    SubscriptionPage: SubscriptionPage,
    Effects: InteractiveEffects,
    init: initializeSubscriptionPage
};

// 添加一些實用的全域函數
window.updateSubscriptionPrice = function() {
    if (SubscriptionPage.isSubscriptionPage()) {
        SubscriptionPage.updatePrice();
    }
};

window.validateSubscriptionForm = function() {
    if (SubscriptionPage.isSubscriptionPage()) {
        return SubscriptionPage.validateForm();
    }
    return false;
};

// 調試輔助函數
window.debugSubscription = {
    showPrices: () => console.table(SubscriptionPage.prices),
    getCurrentData: () => {
        const form = document.getElementById('subscriptionForm');
        if (form) {
            const formData = new FormData(form);
            return Object.fromEntries(formData);
        }
        return null;
    },
    testValidation: () => {
        return SubscriptionPage.validateForm();
    },
    showTerms: () => {
        SubscriptionPage.showTermsModal();
    },
    showPrivacy: () => {
        SubscriptionPage.showPrivacyModal();
    }
};/* ===== Speaka 訂閱頁面優化腳本 ===== */

// 繼承主頁面的核心功能
const SpeakaCore = {
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

    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
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

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    },

    initScrollAnimations() {
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('.fade-in').forEach(el => {
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
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    },

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

    init() {
        // 預選方案
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
    prices: {
        monthly: { price: 199, period: '月' },
        quarterly: { price: 579, period: '季', discount: '5%' },
        halfyearly: { price: 1199, period: '半年', discount: '10%' },
        yearly: { price: 2030, period: '年', discount: '15%' }
    },

    init() {
        if (!this.isSubscriptionPage()) return;
        
        this.initPriceCalculation();
        this.initPaymentMethods();
        this.initInvoiceType();
        this.initFormValidation();
        this.initFormSubmission();
        this.initAccessibilityFeatures();
        this.updatePrice();
        
        console.log('✅ 訂閱頁面初始化完成');
    },

    isSubscriptionPage() {
        return document.getElementById('subscriptionForm') !== null;
    },

    initPriceCalculation() {
        const groupCountInput = document.getElementById('groupCount');
        const billingRadios = document.querySelectorAll('input[name="billingPeriod"]');

        if (groupCountInput) {
            // 限制輸入範圍
            groupCountInput.addEventListener('input', (e) => {
                let value = parseInt(e.target.value) || 1;
                if (value < 1) value = 1;
                if (value > 999) value = 999;
                e.target.value = value;
                this.updatePrice();
            });

            // 鍵盤操作支援
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

        // 初始設定
        const defaultRadio = document.querySelector('input[name="billingPeriod"]:checked');
        if (defaultRadio) {
            this.highlightSelectedPlan(defaultRadio);
        }
    },

    adjustGroupCount(delta) {
        const input = document.getElementById('groupCount');
        if (!input) return;
        
        let currentValue = parseInt(input.value) || 