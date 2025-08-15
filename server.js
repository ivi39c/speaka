/**
 * Speaka LINE Login Backend API
 * 處理 LINE Login OAuth2 token 交換
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// LINE Channel 設定 (模擬版本 - 不含真實憑證)
const LINE_CHANNEL_ID = 'DEMO_CHANNEL_ID';
const LINE_CHANNEL_SECRET = 'DEMO_CHANNEL_SECRET';

// 中介軟體設定
app.use(express.json());
app.use(cors());

// 提供靜態文件 (你的前端網站)
app.use(express.static(path.join(__dirname)));

// ROOT 路由 - 重導向到 index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * LINE Login Token 交換 API
 * POST /api/line-token
 */
app.post('/api/line-token', async (req, res) => {
    try {
        const { code, redirectUri } = req.body;

        console.log('🔐 處理 LINE Login token 交換 (模擬模式)...');
        console.log('Code:', code ? 'received' : 'missing');
        console.log('Redirect URI:', redirectUri);

        if (!code) {
            return res.status(400).json({
                error: 'missing_code',
                message: '缺少授權碼'
            });
        }

        // 模擬 LINE API 響應 - 不會真正調用 LINE API
        console.log('✅ 模擬成功取得 LINE access token');
        
        // 回傳模擬的 token 資料給前端
        res.json({
            access_token: 'mock_access_token_123456789',
            token_type: 'Bearer',
            expires_in: 3600,
            scope: 'profile openid'
        });

    } catch (error) {
        console.error('❌ 模擬 LINE token 交換失敗:', error.message);
        
        res.status(500).json({
            error: 'token_exchange_failed',
            message: 'LINE token 交換失敗',
            details: error.message
        });
    }
});

/**
 * 健康檢查 API
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Speaka LINE Login API 運行中',
        timestamp: new Date().toISOString(),
        channel_id: LINE_CHANNEL_ID
    });
});

/**
 * LINE Login 狀態檢查 API
 * POST /api/line-verify
 */
app.post('/api/line-verify', async (req, res) => {
    try {
        const { access_token } = req.body;

        if (!access_token) {
            return res.status(400).json({
                error: 'missing_token',
                message: '缺少 access token'
            });
        }

        // 模擬 LINE API 驗證 - 不會真正調用 LINE API
        if (access_token === 'mock_access_token_123456789') {
            res.json({
                valid: true,
                profile: {
                    userId: 'mock_user_123',
                    displayName: '測試用戶',
                    pictureUrl: 'https://via.placeholder.com/28'
                }
            });
        } else {
            res.status(401).json({
                valid: false,
                error: 'invalid_token',
                message: 'LINE token 無效或已過期'
            });
        }

    } catch (error) {
        console.error('❌ 模擬 LINE token 驗證失敗:', error.message);
        
        res.status(401).json({
            valid: false,
            error: 'invalid_token',
            message: 'LINE token 無效或已過期'
        });
    }
});

// 錯誤處理中介軟體
app.use((error, req, res, next) => {
    console.error('伺服器錯誤:', error);
    res.status(500).json({
        error: 'internal_server_error',
        message: '伺服器內部錯誤'
    });
});

// 404 處理
app.use((req, res) => {
    res.status(404).json({
        error: 'not_found',
        message: 'API 路徑不存在'
    });
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log('🚀 Speaka LINE Login API 已啟動');
    console.log(`📍 伺服器運行於: http://localhost:${PORT}`);
    console.log(`🔗 API 端點: http://localhost:${PORT}/api/line-token`);
    console.log(`📱 LINE Channel ID: ${LINE_CHANNEL_ID}`);
    console.log('───────────────────────────────────');
    console.log('📋 可用路由:');
    console.log('  GET  /                    - 首頁');
    console.log('  POST /api/line-token      - LINE token 交換');
    console.log('  POST /api/line-verify     - LINE token 驗證');
    console.log('  GET  /api/health          - 健康檢查');
    console.log('───────────────────────────────────');
});

module.exports = app;
