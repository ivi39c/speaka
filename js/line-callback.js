/* ===== LINE Callback處理腳本 v1.0.0 - 2025.08.15 ===== */

console.log('%c🔗 LineCallback.js v1.0.0 載入完成', 'color: #06d6a0; font-weight: bold; font-size: 12px;');

// 處理 LINE Login 回調
(async function handleLineCallback() {
    try {
        // 獲取 URL 參數
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        // 檢查是否有錯誤
        if (error) {
            throw new Error(`LINE 授權失敗: ${error}`);
        }

        if (!code) {
            throw new Error('未收到授權碼');
        }

        // 驗證 state 參數
        const storedState = localStorage.getItem('lineLoginState');
        if (!storedState || state !== storedState) {
            throw new Error('安全驗證失敗，請重新登入');
        }

        // 清理 state
        localStorage.removeItem('lineLoginState');

        // 呼叫後端 API 交換 access token
        const response = await fetch('/api/line-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: code,
                redirectUri: window.location.origin + '/line-callback.html'
            }),
        });

        if (!response.ok) {
            throw new Error(`伺服器錯誤: ${response.status}`);
        }

        const tokenData = await response.json();

        if (!tokenData.access_token) {
            throw new Error('未能取得訪問令牌');
        }

        // 使用 access token 獲取用戶資料
        const profileResponse = await fetch('https://api.line.me/v2/profile', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`
            }
        });

        if (!profileResponse.ok) {
            throw new Error('無法取得用戶資料');
        }

        const profile = await profileResponse.json();

        // 儲存用戶資料到 localStorage
        localStorage.setItem('lineProfile', JSON.stringify(profile));
        localStorage.setItem('lineAccessToken', tokenData.access_token);

        // 延遲一點時間以提供更好的用戶體驗
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);

    } catch (error) {
        console.error('LINE Login 錯誤:', error);
        
        // 顯示錯誤訊息
        const loadingContainer = document.querySelector('.loading-container');
        const errorContainer = document.getElementById('errorContainer');
        
        if (loadingContainer) {
            loadingContainer.style.display = 'none';
        }
        
        if (errorContainer) {
            errorContainer.style.display = 'block';
            const errorMessage = errorContainer.querySelector('p');
            if (errorMessage) {
                errorMessage.textContent = error.message || '登入過程發生錯誤';
            }
        }
    }
})();