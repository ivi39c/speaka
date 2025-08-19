/**
 * LINE Login 模組
 * 處理 LINE 登入流程和用戶認證
 */

class LineLogin {
    constructor(state, api) {
        this.state = state;
        this.api = api;
        this.channelId = 'DEMO_CHANNEL_ID'; // 模擬用的 Channel ID
        this.redirectUri = window.location.origin + '/line-callback.html';
        
        this.isProcessing = false;
    }

    /**
     * 開始 LINE 登入流程
     */
    async login() {
        if (this.isProcessing) return;

        try {
            this.isProcessing = true;
            this.state.setLoading(true, '準備登入...');

            // 模擬 LINE Login 流程
            await this.simulateLogin();

        } catch (error) {
            console.error('LINE 登入失敗:', error);
            this.handleLoginError(error);
        } finally {
            this.isProcessing = false;
            this.state.setLoading(false);
        }
    }

    /**
     * 模擬 LINE 登入流程
     */
    async simulateLogin() {
        // 顯示模擬登入對話框
        const shouldProceed = await this.showLoginDialog();
        
        if (!shouldProceed) {
            throw new Error('用戶取消登入');
        }

        // 模擬網路延遲
        await this.delay(1000);

        // 模擬成功登入
        const mockProfile = {
            userId: 'demo_user_001',
            displayName: '陳小美',
            pictureUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face&auto=format&q=80',
            statusMessage: 'Speaka 用戶'
        };

        // 儲存用戶資料
        await this.saveUserProfile(mockProfile);
        
        // 更新應用狀態
        this.state.login(mockProfile);
        
        // 顯示成功訊息
        this.showSuccessMessage('登入成功！歡迎使用 Speaka');

        // 觸發登入完成事件
        window.dispatchEvent(new CustomEvent('line:login:success', {
            detail: mockProfile
        }));
    }

    /**
     * 顯示登入對話框
     */
    async showLoginDialog() {
        return new Promise((resolve) => {
            // 創建現代化的對話框
            const dialog = this.createLoginDialog(resolve);
            document.body.appendChild(dialog);
            
            // 顯示動畫
            setTimeout(() => {
                dialog.classList.add('show');
            }, 10);
        });
    }

    /**
     * 創建登入對話框
     */
    createLoginDialog(resolve) {
        const dialog = document.createElement('div');
        dialog.className = 'line-login-dialog';
        dialog.innerHTML = `
            <div class="dialog-overlay"></div>
            <div class="dialog-content">
                <div class="dialog-header">
                    <div class="line-logo">
                        <span style="font-size: 24px;">💬</span>
                    </div>
                    <h3>LINE 登入</h3>
                    <p>使用 LINE 帳號快速登入 Speaka</p>
                </div>
                
                <div class="dialog-body">
                    <div class="login-preview">
                        <div style="font-size: 48px; margin-bottom: 12px;">👤</div>
                        <p><strong>陳小美</strong></p>
                        <p style="color: var(--text-secondary); font-size: 14px;">將會使用此 LINE 帳號登入</p>
                    </div>
                    
                    <div class="demo-notice">
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 12px; margin: 16px 0;">
                            <p style="margin: 0; font-size: 14px; color: #856404;">
                                <strong>📝 這是模擬版本</strong><br>
                                在正式環境中，這裡會跳轉到 LINE 進行真實登入驗證
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="dialog-actions">
                    <button class="btn btn-secondary dialog-cancel">取消</button>
                    <button class="btn btn-primary dialog-confirm" style="background: #00B900;">
                        模擬登入成功
                    </button>
                </div>
            </div>
        `;

        // 添加樣式
        const style = document.createElement('style');
        style.textContent = `
            .line-login-dialog {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .line-login-dialog.show {
                opacity: 1;
                visibility: visible;
            }
            
            .dialog-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(4px);
            }
            
            .dialog-content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-lg);
                width: 90%;
                max-width: 400px;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .dialog-header {
                text-align: center;
                padding: var(--space-xl) var(--space-lg) var(--space-lg);
                border-bottom: 1px solid var(--bg-tertiary);
            }
            
            .line-logo {
                width: 60px;
                height: 60px;
                background: #00B900;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto var(--space-md);
            }
            
            .dialog-header h3 {
                margin: 0 0 var(--space-sm) 0;
                font-size: var(--text-xl);
                color: var(--text-primary);
            }
            
            .dialog-header p {
                margin: 0;
                color: var(--text-secondary);
                font-size: var(--text-sm);
            }
            
            .dialog-body {
                padding: var(--space-lg);
            }
            
            .login-preview {
                text-align: center;
                padding: var(--space-lg);
                background: var(--bg-secondary);
                border-radius: var(--radius);
                margin-bottom: var(--space-md);
            }
            
            .dialog-actions {
                padding: var(--space-lg);
                display: flex;
                gap: var(--space-md);
                border-top: 1px solid var(--bg-tertiary);
            }
            
            .dialog-actions .btn {
                flex: 1;
            }
        `;
        
        document.head.appendChild(style);

        // 綁定事件
        const cancelBtn = dialog.querySelector('.dialog-cancel');
        const confirmBtn = dialog.querySelector('.dialog-confirm');
        const overlay = dialog.querySelector('.dialog-overlay');

        const close = (result) => {
            dialog.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(dialog);
                document.head.removeChild(style);
            }, 300);
            resolve(result);
        };

        cancelBtn.addEventListener('click', () => close(false));
        confirmBtn.addEventListener('click', () => close(true));
        overlay.addEventListener('click', () => close(false));

        return dialog;
    }

    /**
     * 儲存用戶資料
     */
    async saveUserProfile(profile) {
        try {
            // 儲存到 localStorage
            localStorage.setItem('lineProfile', JSON.stringify(profile));
            localStorage.setItem('lineAccessToken', 'mock_token_' + Date.now());
            
        } catch (error) {
            console.warn('儲存用戶資料失敗:', error);
        }
    }

    /**
     * 登出
     */
    async logout() {
        try {
            this.state.setLoading(true, '登出中...');

            // 清理本地資料
            localStorage.removeItem('lineProfile');
            localStorage.removeItem('lineAccessToken');

            // 更新應用狀態
            this.state.logout();

            // 顯示成功訊息
            this.showSuccessMessage('已成功登出');

            // 觸發登出事件
            window.dispatchEvent(new CustomEvent('line:logout:success'));

        } catch (error) {
            console.error('登出失敗:', error);
            this.showErrorMessage('登出失敗，請稍後再試');
        } finally {
            this.state.setLoading(false);
        }
    }

    /**
     * 檢查登入狀態
     */
    async checkAuthStatus() {
        try {
            const profile = localStorage.getItem('lineProfile');
            const token = localStorage.getItem('lineAccessToken');

            if (profile && token) {
                const userData = JSON.parse(profile);
                
                // 模擬 token 驗證
                if (token.startsWith('mock_token_')) {
                    this.state.login(userData);
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.warn('檢查登入狀態失敗:', error);
            this.clearAuthData();
            return false;
        }
    }

    /**
     * 清理認證資料
     */
    clearAuthData() {
        localStorage.removeItem('lineProfile');
        localStorage.removeItem('lineAccessToken');
    }

    /**
     * 處理登入錯誤
     */
    handleLoginError(error) {
        let message = '登入失敗，請稍後再試';
        
        if (error.message.includes('取消')) {
            message = '登入已取消';
        } else if (error.message.includes('網路')) {
            message = '網路連線異常，請檢查網路設定';
        }

        this.showErrorMessage(message);
    }

    /**
     * 顯示成功訊息
     */
    showSuccessMessage(message) {
        this.state.addNotification({
            type: 'success',
            message,
            duration: 3000
        });
    }

    /**
     * 顯示錯誤訊息
     */
    showErrorMessage(message) {
        this.state.addNotification({
            type: 'error',
            message,
            duration: 5000
        });
    }

    /**
     * 延遲函數
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 獲取當前用戶
     */
    getCurrentUser() {
        return this.state.getState().user;
    }

    /**
     * 檢查是否已登入
     */
    isLoggedIn() {
        return this.state.getState().isLoggedIn;
    }
}

export default LineLogin;