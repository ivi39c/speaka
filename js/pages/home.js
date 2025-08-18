/**
 * 首頁控制器
 */

class HomePage {
    constructor(state, router) {
        this.state = state;
        this.router = router;
    }

    async render() {
        return `
            <div class="home-page">
                <section class="hero">
                    <div class="container">
                        <div class="hero-content">
                            <h1>專業<span class="highlight">多語系翻譯</span>機器人</h1>
                            <p class="subtitle">LINE 群組即時翻譯解決方案</p>
                            <p>專為群組溝通打造的智能翻譯機器人，支援多種語言與翻譯引擎選擇</p>
                            
                            <div class="hero-buttons">
                                <div class="primary-buttons">
                                    <a href="/subscription" class="btn btn-primary">🚀 立即開始使用</a>
                                    <button id="heroLineLoginBtn" class="btn btn-line-login">
                                        LINE 登入
                                    </button>
                                </div>
                                <a href="#features" class="btn btn-secondary">📊 查看功能</a>
                            </div>
                        </div>
                        
                        <div class="hero-demo">
                            <div class="chat-demo">
                                <div class="chat-message">
                                    <div class="message-bubble">明天休假，大家好好休息 🇹🇼</div>
                                </div>
                                <div class="chat-message">
                                    <div class="message-bubble">Ngày mai nghỉ, mọi người nghỉ ngơi thật tốt nhé 🇻🇳</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" class="features">
                    <div class="container">
                        <h2>為什麼選擇 Speaka？</h2>
                        <div class="features-grid">
                            <div class="feature-card">
                                <div class="feature-icon">⚡</div>
                                <h3>即時翻譯</h3>
                                <p>支援中文與多種東南亞語言的即時雙向翻譯</p>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon">🎯</div>
                                <h3>一鍵安裝</h3>
                                <p>邀請機器人加入群組即可使用，無需繁複設定</p>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon">🔒</div>
                                <h3>安全翻譯</h3>
                                <p>每個群組獨立翻譯處理，確保訊息不混亂</p>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon">🚀</div>
                                <h3>無限制</h3>
                                <p>不限制翻譯訊息數量，讓您盡情溝通</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        `;
    }

    async init() {
        // 綁定 LINE 登入按鈕
        const loginBtn = document.getElementById('heroLineLoginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', async () => {
                const LineLogin = (await import('../modules/auth/line-login.js')).default;
                const lineLogin = new LineLogin(this.state);
                await lineLogin.login();
            });
        }
    }

    destroy() {
        // 清理事件監聽器
    }
}

export default HomePage;