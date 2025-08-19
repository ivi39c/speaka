/* ===== Payment頁面腳本 v1.2.0 - 2025.08.18 ===== */


// 讀取 URL 參數
const params     = new URLSearchParams(window.location.search);
const method     = params.get('method') || '';
const groupCount = params.get('groupCount') || '1';
const total      = params.get('total') || '';
const period     = params.get('period') || '';

// 顯示訂單資訊
const infoEl       = document.getElementById('info');
const lineInfoEl   = document.getElementById('lineInfo');
const decodedMethod= decodeURIComponent(method);
const decodedLineId= params.get('lineId') ? decodeURIComponent(params.get('lineId')) : '';

infoEl.textContent = `付款方式：${decodedMethod}，群組數量：${groupCount}，總金額：${total}`;

// 如果有傳入 LINE ID，顯示於付款頁讓使用者確認
if (decodedLineId) {
    lineInfoEl.textContent = `您的 LINE ID：${decodedLineId}`;
}

// 完成付款後導回訂閱頁並帶上成功標記與 LINE ID
document.getElementById('finishBtn').addEventListener('click', () => {
    const returnUrl = `subscription.html?status=success&groupCount=${encodeURIComponent(groupCount)}&total=${encodeURIComponent(total)}&period=${encodeURIComponent(period)}&lineId=${encodeURIComponent(decodedLineId)}`;
    window.location.href = returnUrl;
});