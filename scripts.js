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
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
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
            this.showCustomModal('方案選擇', message, [
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
        messageEl.textContent = message;
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
            });
        }
    },

    // 初始化表單提交
    initFormSubmission() {
        const form = document.getElementById('subscriptionForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // 收集表單數據
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // 添加價格資訊
            data.groupCount = document.getElementById('groupCount')?.value || '1';
            data.totalAmount = document.getElementById('totalPrice')?.textContent || 'NT$ 199';
            
            // 顯示確認彈窗
            SpeakaModal.showSubscriptionConfirm(data);
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
        SubscriptionPage.init(); // 新增訂閱頁面初始化
        Performance.init();
        
        console.log('Speaka 初始化完成');
    } catch (error) {
        console.error('Speaka 初始化失敗:', error);
    }
}

// ===== 全域對象導出更新 =====
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
