/* ===== Index頁面內嵌腳本整合 v1.0.0 - 2025.08.15 ===== */

console.log('%c📄 IndexInline.js v1.0.0 載入完成', 'color: #f59e0b; font-weight: bold; font-size: 12px;');

// 載入性能監控和資源預載入
(function() {
    // 預載入關鍵資源
    const prefetchResources = [
        'subscription.html',
        'js/optimized-main.js'
    ];
    
    prefetchResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = resource;
        document.head.appendChild(link);
    });
    
    // CSS 載入回退
    const criticalCSS = document.querySelector('link[href*="critical.css"]');
    if (criticalCSS) {
        criticalCSS.onerror = function() {
            console.warn('Critical CSS 載入失敗，使用內聯樣式');
            // 這裡可以添加內聯的關鍵 CSS
        };
    }
    
    // 性能標記
    if ('performance' in window && 'mark' in performance) {
        performance.mark('head-end');
    }
})();