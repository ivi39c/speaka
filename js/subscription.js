/* ===== Speaka 訂閱頁面優化腳本（修正版） ===== */

const SpeakaCore = {
  initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    let ticking = false;
    const updateNavbar = () => {
      const y = window.scrollY;
      if (y > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1)';
        navbar.style.borderBottom = '1px solid rgb(226 232 240)';
      } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
        navbar.style.borderBottom = '1px solid rgb(226 232 240 / 0.5)';
      }
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { requestAnimationFrame(updateNavbar); ticking = true; } };
    window.addEventListener('scroll', onScroll, { passive: true });
  },
  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', function (e) {
        if (this.classList.contains('terms-link')) return; // 條款連結不平滑
        e.preventDefault();
        const id = this.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        const headerOffset = 80;
        const offset = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      });
    });
  },
  initScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
      return;
    }
    const ob = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          ob.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.fade-in').forEach(el => ob.observe(el));
  },
  initPageLoad() {
    document.addEventListener('DOMContentLoaded', () => document.body.classList.add('loaded'));
    window.addEventListener('load', () => setTimeout(() => { document.body.style.opacity = '1'; }, 50));
  },
  normalizePlan(value) {
  if (!value) return null;
  const v = String(value).toLowerCase();
  const map = {
    'monthly': 'monthly', 'month': 'monthly', '1m': 'monthly', '1mo': 'monthly', 'm': 'monthly', '30d': 'monthly',
    'halfyear': 'halfyearly', 'half-year': 'halfyearly', 'halfyearly': 'halfyearly', 'semiannual': 'halfyearly', 'semi-annual': 'halfyearly', '6m': 'halfyearly', '6mo': 'halfyearly', '6months': 'halfyearly', '6month': 'halfyearly', 'half': 'halfyearly',
    'yearly': 'yearly', 'annual': 'yearly', 'annually': 'yearly', '12m': 'yearly', '12mo': 'yearly', '12months': 'yearly', 'year': 'yearly', 'y': 'yearly'
  };
  return map[v] || value; 
},

init() {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedPlan = this.normalizePlan(urlParams.get('plan'));
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

const SubscriptionPage = {
  prices: {
    monthly:    { price: 199,  period: '月' },
    halfyearly: { price: 1199, period: '半年', discount: '5%' },
    yearly:     { price: 2030, period: '年',   discount: '15%' }
  },
  normalizePlan(value) {
  if (!value) return null;
  const v = String(value).toLowerCase();
  const map = {
    'monthly': 'monthly', 'month': 'monthly', '1m': 'monthly', '1mo': 'monthly', 'm': 'monthly', '30d': 'monthly',
    'halfyear': 'halfyearly', 'half-year': 'halfyearly', 'halfyearly': 'halfyearly', 'semiannual': 'halfyearly', 'semi-annual': 'halfyearly', '6m': 'halfyearly', '6mo': 'halfyearly', '6months': 'halfyearly', '6month': 'halfyearly', 'half': 'halfyearly',
    'yearly': 'yearly', 'annual': 'yearly', 'annually': 'yearly', '12m': 'yearly', '12mo': 'yearly', '12months': 'yearly', 'year': 'yearly', 'y': 'yearly'
  };
  return map[v] || value; 
},

init() {
    if (!this.isSubscriptionPage()) return;
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
  isSubscriptionPage() { return document.getElementById('subscriptionForm') !== null; },
  initPriceCalculation() {
    const groupCountInput = document.getElementById('groupCount');
    const billingRadios   = document.querySelectorAll('input[name="billingPeriod"]');
    if (groupCountInput) {
      groupCountInput.addEventListener('input', (e) => {
        let value = parseInt(e.target.value) || 1;
        if (value < 1) value = 1;
        if (value > 999) value = 999;
        e.target.value = value;
        this.updatePrice();
      });
      groupCountInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') { e.preventDefault(); this.adjustGroupCount(1); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); this.adjustGroupCount(-1); }
      });
    }
    billingRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        this.updatePrice();
        this.highlightSelectedPlan(radio);
      });
    });
    const defaultRadio = document.querySelector('input[name="billingPeriod"]:checked');
    if (defaultRadio) this.highlightSelectedPlan(defaultRadio);
  },
  adjustGroupCount(delta) {
    const input = document.getElementById('groupCount');
    if (!input) return;
    let v = parseInt(input.value) || 1;
    v = Math.min(999, Math.max(1, v + delta));
    input.value = v;
    this.updatePrice();
  },
  highlightSelectedPlan(radio) {
    document.querySelectorAll('.billing-label').forEach(l => l.classList.remove('selected'));
    const label = radio.closest('.billing-option').querySelector('.billing-label');
    if (label) label.classList.add('selected');
  },
  updatePrice() {
    const groupCount = parseInt(document.getElementById('groupCount')?.value) || 1;
    const selected   = document.querySelector('input[name="billingPeriod"]:checked')?.value || 'monthly';
    const info       = this.prices[selected];
    if (!info) return;
    const unitPrice  = info.price;
    const total      = unitPrice * groupCount;
    this.updatePriceDisplay(unitPrice, groupCount, total, info.period);
    this.updatePageTitle(total);
  },
  updatePriceDisplay(unitPrice, groupCount, total, period) {
    const els = {
      unitPrice: document.getElementById('unitPrice'),
      groupQuantity: document.getElementById('groupQuantity'),
      subtotal: document.getElementById('subtotal'),
      totalPrice: document.getElementById('totalPrice')
    };
    if (els.unitPrice)  els.unitPrice.textContent  = `NT$ ${unitPrice.toLocaleString()} / 群組 / ${period}`;
    if (els.groupQuantity) els.groupQuantity.textContent = `${groupCount} 個群組`;
    if (els.subtotal)   els.subtotal.textContent   = `NT$ ${total.toLocaleString()}`;
    if (els.totalPrice) els.totalPrice.textContent = `NT$ ${total.toLocaleString()}`;
  },
  updatePageTitle(total) {
    const title = document.querySelector('.subscription-header h1 .price-highlight');
    if (title) title.textContent = `NT$ ${total.toLocaleString()}`;
  },
  initPaymentMethods() {
    document.querySelectorAll('.payment-option').forEach(option => {
      option.setAttribute('tabindex', '0'); // 可及性：允許鍵盤聚焦
      option.addEventListener('click', function () {
        document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
        const radio = this.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        this.style.transform = 'scale(0.98)';
        setTimeout(() => { this.style.transform = ''; }, 150);
      });
      option.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.click(); }
      });
    });
  },
  initInvoiceType() {
    const sel = document.getElementById('invoiceType');
    if (!sel) return;
    sel.addEventListener('change', (e) => this.toggleInvoiceFields(e.target.value));
    this.toggleInvoiceFields(sel.value);
  },
  toggleInvoiceFields(type) {
    const personal = document.querySelectorAll('.personal-field');
    const company  = document.querySelectorAll('.company-field');
    const carrierInput = document.getElementById('carrierNumber');
    const addressInput = document.getElementById('address');
    const companyName  = document.getElementById('companyName');
    const taxId        = document.getElementById('taxId');
    const companyAddr  = document.getElementById('companyAddress');
    if (type === 'company') {
      company.forEach(f => { f.classList.add('show'); f.style.display=''; f.style.opacity='0'; f.style.transform='translateY(-10px)'; setTimeout(()=>{ f.style.transition='all 0.3s ease'; f.style.opacity='1'; f.style.transform='translateY(0)'; },10); });
      personal.forEach(f => { f.classList.remove('show'); f.style.display='none'; });
      if (companyName) companyName.required = true;
      if (taxId) taxId.required = true;
      if (companyAddr) companyAddr.required = true;
      if (carrierInput) { carrierInput.required = false; carrierInput.value=''; }
      if (addressInput) { addressInput.required = false; addressInput.value=''; }
    } else if (type === 'personal') {
      personal.forEach(f => { f.classList.remove('show'); f.style.display=''; f.style.opacity='0'; f.style.transform='translateY(-10px)'; setTimeout(()=>{ f.style.transition='all 0.3s ease'; f.style.opacity='1'; f.style.transform='translateY(0)'; },10); });
      company.forEach(f => { f.classList.remove('show'); f.style.display='none'; });
      if (carrierInput) carrierInput.required = false;
      if (addressInput) addressInput.required = false;
      if (companyName) { companyName.required = false; companyName.value=''; }
      if (taxId) { taxId.required = false; taxId.value=''; }
      if (companyAddr) { companyAddr.required = false; companyAddr.value=''; }
    } else {
      personal.forEach(f => f.style.display='none');
      company.forEach(f => f.style.display='none');
      if (carrierInput) { carrierInput.required = false; carrierInput.value=''; }
      if (addressInput) { addressInput.required = false; addressInput.value=''; }
      if (companyName) { companyName.required = false; companyName.value=''; }
      if (taxId) { taxId.required = false; taxId.value=''; }
      if (companyAddr) { companyAddr.required = false; companyAddr.value=''; }
    }
  },
  initFormValidation() {
    const validators = {
      taxId: this.createTaxIdValidator(),
      phone: this.createPhoneValidator(),
      email: this.createEmailValidator(),
      contactName: this.createNameValidator()
    };
    Object.entries(validators).forEach(([id, validator]) => {
      const field = document.getElementById(id);
      if (!field) return;
      field.validator = validator;
      field.addEventListener('blur', function(){ this.validator.validate(this); });
      field.addEventListener('input', function(){ if (this.classList.contains('error')) this.validator.clearError(this); });
    });
  },
  createTaxIdValidator() {
    return {
      validate: (field) => {
        const value = field.value.replace(/\D/g, '');
        field.value = value.substring(0, 8);
        if (value.length === 0) { SubscriptionPage.clearFieldError(field); return true; }
        if (value.length !== 8) { SubscriptionPage.showFieldError(field, '統一編號必須為8位數字'); return false; }
        if (!SubscriptionPage.isValidTaxId(value)) { SubscriptionPage.showFieldError(field, '統一編號格式不正確'); return false; }
        SubscriptionPage.clearFieldError(field); return true;
      },
      clearError: (field) => SubscriptionPage.clearFieldError(field)
    };
  },
  createPhoneValidator() {
    return {
      validate: (field) => {
        const value = field.value.replace(/[\s\-\(\)]/g, '');
        if (value.length === 0) { SubscriptionPage.clearFieldError(field); return true; }
        const patterns = [/^09\d{8}$/, /^0[2-8]\d{7,8}$/, /^\+\d{8,15}$/];
        const ok = patterns.some(p => p.test(value));
        if (ok) { SubscriptionPage.clearFieldError(field); return true; }
        SubscriptionPage.showFieldError(field, '請輸入正確的電話號碼格式'); return false;
      },
      clearError: (field) => SubscriptionPage.clearFieldError(field)
    };
  },
  createEmailValidator() {
    return {
      validate: (field) => {
        const value = field.value.trim();
        if (value.length === 0) { SubscriptionPage.clearFieldError(field); return true; }
        const pat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (pat.test(value)) { SubscriptionPage.clearFieldError(field); return true; }
        SubscriptionPage.showFieldError(field, '請輸入正確的電子郵件格式'); return false;
      },
      clearError: (field) => SubscriptionPage.clearFieldError(field)
    };
  },
  createNameValidator() {
    return {
      validate: (field) => {
        const value = field.value.trim();
        if (value.length === 0) { SubscriptionPage.clearFieldError(field); return true; }
        if (value.length >= 2 && value.length <= 20) { SubscriptionPage.clearFieldError(field); return true; }
        SubscriptionPage.showFieldError(field, '姓名長度應為2-20個字符'); return false;
      },
      clearError: (field) => SubscriptionPage.clearFieldError(field)
    };
  },
  showFieldError(field, message) {
    this.clearFieldError(field);
    field.classList.add('error');
    field.style.borderColor = 'var(--error)';
    const div = document.createElement('div');
    div.className = 'error-message';
    div.textContent = message;
    field.parentNode.appendChild(div);
  },
  clearFieldError(field) {
    field.classList.remove('error');
    field.style.borderColor = '';
    field.parentNode.querySelectorAll('.error-message').forEach(n => n.remove());
  },
  isValidTaxId(taxId) {
    if (!/^\d{8}$/.test(taxId)) return false;
    const weights = [1,2,1,2,1,2,4,1];
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      const p = parseInt(taxId[i], 10) * weights[i];
      sum += Math.floor(p / 10) + (p % 10);
    }
    if (sum % 10 === 0) return true;
    // 特例：第 7 碼為 7 時，sum+1 可整除也視為合法
    return taxId[6] == '7' && (sum + 1) % 10 == 0;
  },
  validateForm() {
    let ok = true;
    const errors = [];
    const required = [
      { id: 'contactName', name: '聯絡人姓名' },
      { id: 'email', name: '電子郵件' },
      { id: 'phone', name: '聯絡電話' },
      { id: 'invoiceType', name: '發票類型' }
    ];
    required.forEach(f => {
      const el = document.getElementById(f.id);
      if (el && !el.value.trim()) { errors.push(f.name + '為必填欄位'); this.showFieldError(el, f.name + '為必填欄位'); ok = false; }
    });
    const invoiceType = document.getElementById('invoiceType')?.value;
    if (invoiceType === 'company') {
      const companyName = document.getElementById('companyName');
      const taxId = document.getElementById('taxId');
      if (!companyName?.value.trim()) { errors.push('公司名稱為必填欄位'); this.showFieldError(companyName, '公司名稱為必填欄位'); ok = false; }
      if (!taxId?.value.trim()) { errors.push('統一編號為必填欄位'); this.showFieldError(taxId, '統一編號為必填欄位'); ok = false; }
      else if (taxId.validator && !taxId.validator.validate(taxId)) ok = false;
    }
    ['email','phone','contactName'].forEach(id => {
      const f = document.getElementById(id);
      if (f && f.value && f.validator) if (!f.validator.validate(f)) ok = false;
    });
    const method = document.querySelector('input[name="paymentMethod"]:checked');
    if (!method) { errors.push('請選擇支付方式'); ok = false; }
    const agree = document.getElementById('agreeTerms');
    if (agree && !agree.checked) { errors.push('請同意服務條款和隱私政策'); ok = false; }
    if (!ok && errors.length) this.showValidationErrors(errors);
    return ok;
  },
  showValidationErrors(errors) {
    const msg = '請修正以下錯誤：\\n\\n' + errors.join('\\n');
    this.showErrorModal('表單驗證錯誤', msg);
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
            ${message.split('\\n\\n')[1].split('\\n').map(e => `<div class="error-item">• ${e}</div>`).join('')}
          </div>
          <button class="error-modal-close">確定</button>
        </div>
      </div>
    `;
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:10000;';
    const overlay = modal.querySelector('.error-modal-overlay');
    overlay.style.cssText = 'width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;padding:20px;';
    const content = modal.querySelector('.error-modal-content');
    content.style.cssText = 'background:white;border-radius:16px;padding:32px;max-width:400px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);';
    const btn = modal.querySelector('.error-modal-close');
    btn.style.cssText = 'background:var(--primary);color:white;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;margin-top:20px;';
    document.body.appendChild(modal);
    btn.addEventListener('click', () => document.body.removeChild(modal));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) document.body.removeChild(modal); });
  },
  initFormSubmission() {
    const form = document.getElementById('subscriptionForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.submit-btn');
      const t = btn.textContent;
      btn.textContent = '處理中...'; btn.disabled = true;
      setTimeout(() => {
        if (this.validateForm()) {
          const fd = new FormData(form);
          const data = Object.fromEntries(fd);
          data.groupCount = document.getElementById('groupCount')?.value || '1';
          data.totalAmount = document.getElementById('totalPrice')?.textContent || 'NT$ 199';
          this.redirectToPayment(data);
        }
        btn.textContent = t; btn.disabled = false;
      }, 1000);
    });
    this.initTermsLinks();
  },
  initTermsLinks() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('.terms-link');
      if (!link) return;
      e.preventDefault();
      e.stopPropagation();
      const type = link.getAttribute('data-type') || (link.textContent.includes('服務條款') ? 'terms' : 'privacy');
      (type === 'terms') ? this.showTermsModal() : this.showPrivacyModal();
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
        <p>我們收集聯絡資訊、帳務資訊與使用資料，以提供服務與技術支援。</p>
        <h4>2. 資料保護</h4>
        <p>採用加密技術並限制權限，依個資法規進行管理。</p>
        <h4>3. 翻譯內容處理</h4>
        <p>翻譯內容僅用於即時服務，不留存敏感資訊。</p>
        <h4>4. 您的權利</h4>
        <p>您可查詢、更正或刪除個人資料，並要求停止處理。</p>
        <p style="margin-top: 20px; color: #64748b; font-size: 14px;">最後更新日期：2025年1月</p>
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
    const styles = `
      .terms-modal{position:fixed;top:0;left:0;width:100%;height:100%;z-index:10000;}
      .terms-modal-overlay{width:100%;height:100%;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(5px);}
      .terms-modal-content{background:#fff;border-radius:16px;padding:0;max-width:600px;width:100%;max-height:80vh;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3);display:flex;flex-direction:column;}
      .terms-modal-content h3{background:var(--primary);color:#fff;margin:0;padding:20px 30px;font-size:20px;font-weight:600;}
      .terms-content{padding:30px;overflow-y:auto;flex:1;}
      .terms-modal-close{background:var(--primary);color:#fff;border:none;padding:16px 32px;font-weight:600;cursor:pointer;margin:0 30px 30px 30px;border-radius:8px;transition:var(--transition);}
      .terms-modal-close:hover{background:var(--primary-hover);}
    `;
    if (!document.getElementById('terms-modal-styles')) {
      const style = document.createElement('style'); style.id='terms-modal-styles'; style.textContent = styles; document.head.appendChild(style);
    }
    document.body.appendChild(modal);
    const btn = modal.querySelector('.terms-modal-close');
    btn.addEventListener('click', () => document.body.removeChild(modal));
    modal.querySelector('.terms-modal-overlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) document.body.removeChild(modal); });
    const esc = (e)=>{ if (e.key==='Escape'){ document.body.removeChild(modal); document.removeEventListener('keydown', esc); } };
    document.addEventListener('keydown', esc);
  },
  showSubscriptionConfirm(data) {
    const msg = `感謝您的訂閱！\\n\\n訂閱資訊：\\n群組數量：${data.groupCount} 個\\n總金額：${data.totalAmount}\\n\\n我們將盡快為您開通服務。`;
    alert(msg);
  },
  redirectToPayment(data) {
    const method = data.paymentMethod || document.querySelector('input[name="paymentMethod"]:checked')?.value || 'linepay';
    const methodCode = encodeURIComponent(method);
    const groupCount = encodeURIComponent(data.groupCount || '1');
    const total      = encodeURIComponent(data.totalAmount || '');
    const periodVal  = data.billingPeriod || document.querySelector('input[name="billingPeriod"]:checked')?.value || '';
    const period     = encodeURIComponent(periodVal);
    const lineId     = encodeURIComponent(data.lineId || document.getElementById('lineId')?.value || '');
    window.location.href = `payment.html?method=${methodCode}&groupCount=${groupCount}&total=${total}&period=${period}&lineId=${lineId}`;
  },
  checkPaymentStatus() {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    if (status !== 'success') return;
    const groupCount = params.get('groupCount') || '1';
    const total = params.get('total') || '';
    const period = params.get('period') || '';
    const lineId = params.get('lineId') || '';
    const planMap = { monthly: '月繳', halfyearly: '半年繳', yearly: '年繳' };
    const planText = planMap[period] || '';
    let msg = `感謝您的付款！\\n\\n訂閱已成功開通。\\n`;
    if (planText) msg += `方案：${planText}\\n`;
    msg += `群組數量：${groupCount} 個\\n總金額：${total}\\n\\n`;
    if (lineId) msg += `您的 LINE ID：${lineId}\\n`;
    msg += `請加入官方 LINE 完成服務開通（官方 LINE：@537etdoz）。\\n如有任何問題，請聯絡客服。`;
    alert(msg);
    history.replaceState(null, '', window.location.pathname);
  },
  initAccessibilityFeatures() {
    document.addEventListener('keydown', (e) => { if (e.key === 'Tab') document.body.classList.add('using-keyboard'); });
    document.addEventListener('mousedown', () => document.body.classList.remove('using-keyboard'));
    document.querySelectorAll('.form-label').forEach(label => {
      label.addEventListener('click', function () {
        const input = this.parentNode.querySelector('.form-input, .form-select');
        if (input) input.focus();
      });
    });
  }
};

const InteractiveEffects = {
  normalizePlan(value) {
  if (!value) return null;
  const v = String(value).toLowerCase();
  const map = {
    'monthly': 'monthly', 'month': 'monthly', '1m': 'monthly', '1mo': 'monthly', 'm': 'monthly', '30d': 'monthly',
    'halfyear': 'halfyearly', 'half-year': 'halfyearly', 'halfyearly': 'halfyearly', 'semiannual': 'halfyearly', 'semi-annual': 'halfyearly', '6m': 'halfyearly', '6mo': 'halfyearly', '6months': 'halfyearly', '6month': 'halfyearly', 'half': 'halfyearly',
    'yearly': 'yearly', 'annual': 'yearly', 'annually': 'yearly', '12m': 'yearly', '12mo': 'yearly', '12months': 'yearly', 'year': 'yearly', 'y': 'yearly'
  };
  return map[v] || value; 
},

init() { this.initButtonEffects(); this.initCardHoverEffects(); this.initFormFocusEffects(); },
  initButtonEffects() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.submit-btn, .billing-label, .payment-option');
      if (target && !target.disabled) this.addRippleEffect(target, e);
    });
  },
  addRippleEffect(el, event) {
    const ripple = document.createElement('span');
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;position:absolute;border-radius:50%;background:rgba(255,255,255,.6);transform:scale(0);animation:ripple .4s ease-out;pointer-events:none;z-index:1;`;
    el.style.position = 'relative'; el.style.overflow = 'hidden'; el.appendChild(ripple);
    setTimeout(() => { if (ripple.parentNode) ripple.remove(); }, 400);
  },
  initCardHoverEffects() {
    document.querySelectorAll('.subscription-card, .billing-label').forEach(card => {
      card.addEventListener('mouseenter', function(){ this.style.transform='translateY(-2px)'; });
      card.addEventListener('mouseleave', function(){ if (!this.classList.contains('selected')) this.style.transform='translateY(0)'; });
    });
  },
  initFormFocusEffects() {
    document.querySelectorAll('.form-input, .form-select').forEach(input => {
      input.addEventListener('focus', function(){ this.parentNode.classList.add('focused'); });
      input.addEventListener('blur', function(){ this.parentNode.classList.remove('focused'); });
    });
  }
};

function initializeSubscriptionPage() {
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initializeSubscriptionPage); return; }
  try {
    SpeakaCore.init();
    SubscriptionPage.init();
    InteractiveEffects.init();
    console.log('🎉 訂閱頁面初始化完成！');
    window.dispatchEvent(new CustomEvent('subscriptionPageReady', { detail: { timestamp: Date.now() } }));
  } catch (err) {
    console.error('❌ 訂閱頁面初始化失敗:', err);
    document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
  }
}

if (!document.getElementById('subscription-animations')) {
  const s = document.createElement('style'); s.id='subscription-animations'; s.textContent = `
    @keyframes ripple { to { transform: scale(4); opacity: 0; } }
    .focused .form-label { color: var(--primary); }
    .focused .form-input, .focused .form-select { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
    .billing-label.selected { transform: translateY(-2px); }
    .payment-option.selected { transform: translateY(-1px); }
    .form-input:invalid { border-color: var(--error); }
    .form-input:valid { border-color: var(--success); }
  `; document.head.appendChild(s);
}

initializeSubscriptionPage();

window.SubscriptionSpeaka = { Core: SpeakaCore, SubscriptionPage, Effects: InteractiveEffects, init: initializeSubscriptionPage };
window.updateSubscriptionPrice = function(){ if (SubscriptionPage.isSubscriptionPage()) SubscriptionPage.updatePrice(); };
window.validateSubscriptionForm = function(){ return SubscriptionPage.isSubscriptionPage() ? SubscriptionPage.validateForm() : false; };
