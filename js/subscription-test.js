// 超級簡單的測試版本
console.log('=== 測試JS開始載入 ===');

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOM載入完成 ===');
    
    // 測試群組數量輸入
    const groupInput = document.getElementById('groupCount');
    if (groupInput) {
        console.log('找到群組輸入框');
        groupInput.addEventListener('input', function(e) {
            console.log('輸入事件觸發，值:', e.target.value);
        });
    } else {
        console.log('找不到群組輸入框');
    }
    
    // 測試計費週期選擇
    const radios = document.querySelectorAll('input[name="billingPeriod"]');
    console.log('找到計費週期選項數量:', radios.length);
    radios.forEach((radio, index) => {
        radio.addEventListener('change', function() {
            console.log('週期選擇改變:', this.value);
        });
    });
    
    // 測試浮動總計元素
    const floatingTotal = document.getElementById('floatingTotalPrice');
    if (floatingTotal) {
        console.log('找到浮動總計元素');
    } else {
        console.log('找不到浮動總計元素');
    }
    
    console.log('=== 測試初始化完成 ===');
});

console.log('=== 測試JS載入完成 ===');