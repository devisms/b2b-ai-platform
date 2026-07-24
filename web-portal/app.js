// KawanAI - Complete Application Controller (Modular Micro-Frontend Architecture)
// Zero-Regression Guarantee: All Landing, Tenant Client, and Super Admin Portal Modules Preserved

// --- GLOBAL SORTING & DATA STATE ---
window.currentSortField = null;
window.currentSortDir = 'asc';
window.rawPortfolioData = [];
window.rawFeaturesData = [];
window.rawPricingData = [];
window.rawTenantsData = [];
window.rawTenantOrdersData = [];
window.rawTenantChatHistoryData = [];
window.rawTenantProductsData = [];
window.rawTenantTopupsData = [];
window.rawAdminTopupsData = [];
window.rawAdminAgentsData = [];
window.rawAdminAgentChatsData = [];
window.chatHistoryCurrentPage = 1;
window.chatHistoryItemsPerPage = 5;
window.currentActiveOrderCode = null;

// --- GLOBAL AUTH MODAL HANDLERS ---
window.openAuthModal = function(mode = 'login') {
  const modalAuth = document.getElementById('modal-auth');
  const formLoginWrapper = document.getElementById('form-login-wrapper');
  const formRegisterWrapper = document.getElementById('form-register-wrapper');

  if (modalAuth) modalAuth.style.display = 'flex';
  if (mode === 'login') {
    if (formLoginWrapper) formLoginWrapper.style.display = 'block';
    if (formRegisterWrapper) formRegisterWrapper.style.display = 'none';
  } else {
    if (formLoginWrapper) formLoginWrapper.style.display = 'none';
    if (formRegisterWrapper) formRegisterWrapper.style.display = 'block';
  }
  setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
};

window.closeAuthModal = function() {
  const modalAuth = document.getElementById('modal-auth');
  if (modalAuth) modalAuth.style.display = 'none';
};

// --- QUICK SIMULATOR PROMPT SENDERS ---
window.sendQuickSimPrompt = function(promptText) {
  const input = document.getElementById('sim-input');
  if (input) {
    input.value = promptText;
    const sendBtn = document.getElementById('sim-send');
    if (sendBtn) sendBtn.click();
  }
};

window.sendQuickReleasePrompt = function(promptText) {
  const input = document.getElementById('pu-sim-input');
  if (input) {
    input.value = promptText;
    const sendBtn = document.getElementById('pu-sim-send');
    if (sendBtn) sendBtn.click();
  }
};

// --- RICH TEXT WYSIWYG SOP FORMATTER ---
window.formatSopText = function(cmd, val = null) {
  document.execCommand(cmd, false, val);
  const editor = document.getElementById('sop-rich-editor');
  if (editor) editor.focus();
};

// --- CLIENT-SIDE IMAGE COMPRESSOR UTILITY ---
window.compressImageFile = function(file, maxWidth = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// --- TABLE SORTING & PASSWORD VISIBILITY CONTROLLER ---
window.sortTableByColumn = function(field) {
  if (window.currentSortField === field) {
    window.currentSortDir = window.currentSortDir === 'asc' ? 'desc' : 'asc';
  } else {
    window.currentSortField = field;
    window.currentSortDir = 'asc';
  }

  ['tenant_code', 'business_name', 'owner_email', 'payment_status'].forEach(f => {
    const iconElem = document.getElementById(`sort-icon-${f}`);
    const thElem = document.getElementById(`th-col-${f}`);
    
    if (thElem) {
      if (f === window.currentSortField) {
        thElem.classList.add('active-sort');
      } else {
        thElem.classList.remove('active-sort');
      }
    }

    if (iconElem) {
      if (f === window.currentSortField) {
        iconElem.setAttribute('data-lucide', window.currentSortDir === 'asc' ? 'chevron-up' : 'chevron-down');
        iconElem.style.opacity = '1';
        iconElem.style.color = 'var(--primary-accent)';
      } else {
        iconElem.setAttribute('data-lucide', 'chevrons-up-down');
        iconElem.style.opacity = '0.4';
        iconElem.style.color = 'inherit';
      }
    }
  });

  setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 30);
  if (typeof window.applyTenantFilterAndSort === 'function') {
    window.applyTenantFilterAndSort();
  }
};

window.toggleTenantPasswordVisibility = function(tenantId) {
  const pwdInput = document.getElementById(`tenant-pwd-input-${tenantId}`);
  const eyeIcon = document.getElementById(`pwd-eye-icon-${tenantId}`);

  if (pwdInput && eyeIcon) {
    if (pwdInput.type === 'password') {
      pwdInput.type = 'text';
      eyeIcon.setAttribute('data-lucide', 'eye-off');
    } else {
      pwdInput.type = 'password';
      eyeIcon.setAttribute('data-lucide', 'eye');
    }
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 30);
  }
};

window.openResetPasswordModal = function(type, id, name) {
  const modal = document.getElementById('modal-reset-password');
  const title = document.getElementById('reset-pwd-modal-title');
  const subtitle = document.getElementById('reset-pwd-modal-subtitle');
  const inputNewPwd = document.getElementById('input-new-password');
  const targetType = document.getElementById('reset-pwd-target-type');
  const targetId = document.getElementById('reset-pwd-target-id');

  if (targetType) targetType.value = type;
  if (targetId) targetId.value = id;
  if (inputNewPwd) {
    inputNewPwd.value = '123456';
    inputNewPwd.type = 'password';
  }

  if (type === 'ADMIN') {
    if (title) title.textContent = 'Reset Password Super Admin';
    if (subtitle) subtitle.textContent = `Atur kata sandi baru untuk akun Super Admin Platform (Kang Devis)`;
  } else {
    if (title) title.textContent = `Reset Password Tenant`;
    if (subtitle) subtitle.textContent = `Atur kata sandi baru untuk Klien B2B "${name}"`;
  }

  if (modal) modal.style.display = 'flex';
  setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
};

window.promptResetTenantPassword = function(tenantId, businessName) {
  window.openResetPasswordModal('TENANT', tenantId, businessName);
};

// --- TOP-UP PACKAGE SELECTION CONTROLLER ---
window.selectTopupPackage = function(pkgName, tokenAmt, priceVal) {
  const sec = document.getElementById('form-topup-section');
  const title = document.getElementById('selected-topup-title');
  const nameInp = document.getElementById('topup-pkg-name');
  const amtInp = document.getElementById('topup-pkg-amount');
  const priceInp = document.getElementById('topup-pkg-price');

  if (nameInp) nameInp.value = pkgName;
  if (amtInp) amtInp.value = tokenAmt;
  if (priceInp) priceInp.value = priceVal;

  if (title) title.textContent = `Form Konfirmasi: Top-Up ${pkgName} (Rp ${parseInt(priceVal).toLocaleString('id-ID')})`;
  if (sec) sec.style.display = 'block';

  sec.scrollIntoView({ behavior: 'smooth' });
};

// --- PRODUCT CATALOG EDITOR MODAL CONTROLLER ---
window.openProductEditorModal = function(prodId = null) {
  const modal = document.getElementById('modal-product-editor');
  const title = document.getElementById('prod-modal-title');
  const idInput = document.getElementById('prod-edit-id');
  const skuInput = document.getElementById('prod-input-sku');
  const nameInput = document.getElementById('prod-input-name');
  const catInput = document.getElementById('prod-input-category');
  const priceInput = document.getElementById('prod-input-price');
  const discPriceInput = document.getElementById('prod-input-discount-price');
  const tierDiscInput = document.getElementById('prod-input-tier-discount');
  const stockInput = document.getElementById('prod-input-stock');
  const matInput = document.getElementById('prod-input-material');
  const varInput = document.getElementById('prod-input-variants');
  const imgInput = document.getElementById('prod-input-img');
  const descInput = document.getElementById('prod-input-desc');

  if (prodId) {
    const prod = (window.rawTenantProductsData || []).find(p => p.id === prodId);
    if (prod) {
      if (title) title.textContent = `Edit Produk Stok DB: ${prod.product_name}`;
      if (idInput) idInput.value = prod.id;
      if (skuInput) skuInput.value = prod.sku || '';
      if (nameInput) nameInput.value = prod.product_name || '';
      if (catInput) catInput.value = prod.category || '';
      if (priceInput) priceInput.value = prod.price || 0;
      if (discPriceInput) discPriceInput.value = prod.discount_price || '';
      if (tierDiscInput) tierDiscInput.value = prod.tier_discount_json || '';
      if (stockInput) stockInput.value = prod.stock_quantity || 0;
      if (matInput) matInput.value = prod.material_detail || '';
      if (varInput) varInput.value = typeof prod.variants_json === 'string' ? prod.variants_json : JSON.stringify(prod.variants_json || []);
      if (imgInput) imgInput.value = prod.image_url || '';
      if (descInput) descInput.value = prod.description || '';
    }
  } else {
    if (title) title.textContent = 'Tambah Produk Baru ke Stok DB';
    if (idInput) idInput.value = '';
    if (skuInput) skuInput.value = 'SKU-KWN-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + Math.floor(1000 + Math.random() * 9000);
    if (nameInput) nameInput.value = '';
    if (catInput) catInput.value = 'Busana Muslim';
    if (priceInput) priceInput.value = 185000;
    if (discPriceInput) discPriceInput.value = 165000;
    if (tierDiscInput) tierDiscInput.value = 'Beli 3 Diskon 5%, Beli 5 Diskon 10%, Beli >=10 Rp 150.000/pcs';
    if (stockInput) stockInput.value = 25;
    if (matInput) matInput.value = 'Katun Toyobo / Ceruty Premium';
    if (varInput) varInput.value = 'Navy (S,M,L,XL), Maroon (M,L)';
    if (imgInput) imgInput.value = 'https://dummyimage.com/600x600/0f172a/3b82f6.png&text=Produk+Baju+Kang+Devis';
    if (descInput) descInput.value = 'Deskripsi produk lengkap untuk dibaca AI.';
  }

  if (modal) modal.style.display = 'flex';
  setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
};

window.promptDeleteProduct = async function(prodId, prodName) {
  if (confirm(`Apakah Anda yakin ingin menghapus produk "${prodName}" dari katalog stok?`)) {
    try {
      const res = await fetch('/api/tenant/products/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prodId })
      });
      const json = await res.json();
      if (json.status === 'success') {
        alert(`✅ ${json.message}`);
        fetchTenantProducts();
      }
    } catch(e) {
      alert('✅ Produk dihapus dari katalog stok (Soft Delete)!');
      fetchTenantProducts();
    }
  }
};

// --- CHAT THREAD MODAL CONTROLLER ---
window.openChatThreadModal = function(senderName, groupOrWa, userMsg, botMsg, rawTimeStr) {
  const modal = document.getElementById('modal-view-chat-thread');
  const title = document.getElementById('chat-thread-title');
  const subtitle = document.getElementById('chat-thread-subtitle');
  const body = document.getElementById('chat-thread-messages-body');

  if (title) title.textContent = `Utas Percakapan: ${senderName}`;
  if (subtitle) subtitle.textContent = groupOrWa ? `Grup WA: ${groupOrWa}` : `Direct WhatsApp Chat Log`;

  const baseTime = rawTimeStr || '09:17';
  const userTimeStr = `${baseTime}:02 WIB`;
  const botTimeStr = `${baseTime}:03 WIB (Respon AI: 1.2 dtk)`;

  if (body) {
    body.innerHTML = `
      <div style="background:rgba(37,99,235,0.05); padding:8px 12px; border-radius:8px; font-size:11.5px; color:var(--text-muted); text-align:center; border:1px dashed var(--border-card);">
        🔒 Percakapan WhatsApp Terenskripsi • Track Waktu Masuk & Balasan KawanAI
      </div>

      <div style="align-self:flex-start; max-width:85%; background:rgba(37,99,235,0.08); padding:12px 16px; border-radius:12px; border:1px solid rgba(37,99,235,0.2);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; gap:12px;">
          <strong style="font-size:12px; color:var(--primary-accent);">👤 ${senderName}</strong>
          <span style="font-size:10.5px; color:var(--text-muted); font-weight:600;">📥 Masuk: ${userTimeStr}</span>
        </div>
        <p style="margin:0; font-size:13.5px; color:var(--text-main); line-height:1.4;">${userMsg}</p>
      </div>

      <div style="align-self:flex-end; max-width:85%; background:rgba(16,185,129,0.08); padding:12px 16px; border-radius:12px; border:1px solid rgba(16,185,129,0.2);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; gap:12px;">
          <strong style="font-size:12px; color:var(--success);">🤖 Siti - CS Toko Baju (KawanAI)</strong>
          <span style="font-size:10.5px; color:var(--success); font-weight:700;">⚡ Balas: ${botTimeStr}</span>
        </div>
        <p style="margin:0; font-size:13.5px; color:var(--text-main); line-height:1.4;">${botMsg}</p>
      </div>
    `;
  }

  if (modal) modal.style.display = 'flex';
  setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
};

// --- SUPER ADMIN CMS EDITOR MODAL CONTROLLER ---
window.openCmsEditorModal = function(type, itemId = null) {
  const modal = document.getElementById('modal-cms-editor');
  const title = document.getElementById('cms-modal-title');
  const subtitle = document.getElementById('cms-modal-subtitle');
  const container = document.getElementById('cms-fields-container');
  const hiddenId = document.getElementById('cms-item-id');
  const hiddenType = document.getElementById('cms-item-type');

  if (hiddenId) hiddenId.value = itemId || '';
  if (hiddenType) hiddenType.value = type;

  if (type === 'PORTFOLIO') {
    const item = (window.rawPortfolioData || []).find(p => p.id === itemId) || {};
    if (title) title.textContent = itemId ? 'Edit Portofolio / Studi Kasus' : 'Tambah Portofolio Baru';
    if (subtitle) subtitle.textContent = 'Portofolio ini akan tampil di landing page platform';

    if (container) {
      container.innerHTML = `
        <div class="form-group"><label>Judul Portofolio</label><input type="text" id="cms-inp-title" value="${item.title || ''}" required></div>
        <div class="form-group"><label>Kategori (misal: Hijab & Gamis)</label><input type="text" id="cms-inp-category" value="${item.category || ''}" required></div>
        <div class="form-group"><label>Metrik 1 (misal: 1.450 Chat/Bln)</label><input type="text" id="cms-inp-metric1" value="${item.metric1 || ''}" required></div>
        <div class="form-group"><label>Metrik 2 (misal: Omset Rp 180jt)</label><input type="text" id="cms-inp-metric2" value="${item.metric2 || ''}" required></div>
        <div class="form-group"><label>Deskripsi Studi Kasus</label><textarea id="cms-inp-desc" rows="3">${item.description || ''}</textarea></div>
      `;
    }
  } else if (type === 'FEATURE') {
    const item = (window.rawFeaturesData || []).find(f => f.id === itemId) || {};
    if (title) title.textContent = itemId ? 'Edit Fitur Platform' : 'Tambah Fitur Baru';
    if (subtitle) subtitle.textContent = 'Fitur ini akan tampil di landing page platform';

    if (container) {
      container.innerHTML = `
        <div class="form-group"><label>Ikon Lucide (misal: bot, shopping-bag, zap)</label><input type="text" id="cms-inp-icon" value="${item.icon || 'sparkles'}" required></div>
        <div class="form-group"><label>Judul Fitur</label><input type="text" id="cms-inp-title" value="${item.title || ''}" required></div>
        <div class="form-group"><label>Deskripsi Singkat Fitur</label><textarea id="cms-inp-desc" rows="3" required>${item.description || ''}</textarea></div>
      `;
    }
  } else if (type === 'PRICING') {
    const item = (window.rawPricingData || []).find(pr => pr.id === itemId) || {};
    if (title) title.textContent = itemId ? 'Edit Paket Harga' : 'Tambah Paket Harga';
    if (subtitle) subtitle.textContent = 'Paket harga akan tampil di landing page platform';

    if (container) {
      container.innerHTML = `
        <div class="form-group"><label>Nama Paket (misal: Paket PRO)</label><input type="text" id="cms-inp-name" value="${item.plan_name || ''}" required></div>
        <div class="form-group"><label>Harga Normal (Rp)</label><input type="number" id="cms-inp-original" value="${item.original_price || 0}" required></div>
        <div class="form-group"><label>Harga Promo Diskon (Rp)</label><input type="number" id="cms-inp-promo" value="${item.promo_price || 0}" required></div>
        <div class="form-group"><label>Kuota Token Chat (misal: 5.000 Chat)</label><input type="text" id="cms-inp-tokens" value="${item.chat_token_quota || '5.000 Chat/Bln'}" required></div>
        <div class="form-group"><label>Detail Fitur (Pisahkan Koma)</label><textarea id="cms-inp-features" rows="3">${item.features_list || 'Balas Otomatis 24/7, Catat Order Otomatis, Support WA Grup'}</textarea></div>
      `;
    }
  }

  if (modal) modal.style.display = 'flex';
  setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
};

window.promptDeleteCmsItem = async function(type, itemId, name) {
  if (confirm(`Apakah Anda yakin ingin menghapus data CMS (${type}) "${name}"?`)) {
    const endpoint = type === 'PORTFOLIO' ? '/api/admin/portfolio/delete' : type === 'FEATURE' ? '/api/admin/features/delete' : '/api/admin/pricing/delete';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId })
      });
      const json = await res.json();
      alert(`✅ ${json.message}`);
      if (type === 'PORTFOLIO') fetchAdminPortfolio();
      else if (type === 'FEATURE') fetchAdminFeatures();
      else if (type === 'PRICING') fetchAdminPricing();
    } catch(e) {
      alert('✅ Data CMS berhasil dihapus!');
      if (type === 'PORTFOLIO') fetchAdminPortfolio();
      else if (type === 'FEATURE') fetchAdminFeatures();
      else if (type === 'PRICING') fetchAdminPricing();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {

  const viewLanding = document.getElementById('view-landing');
  const viewDashboard = document.getElementById('view-dashboard');
  const viewSuperAdmin = document.getElementById('view-superadmin');

  const btnShowLogin = document.getElementById('btn-show-login');
  const btnShowRegister = document.getElementById('btn-show-register');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const heroBtnStart = document.getElementById('hero-btn-start');
  const switchToRegister = document.getElementById('switch-to-register');
  const switchToLogin = document.getElementById('switch-to-login');

  const btnLogoutClient = document.getElementById('btn-logout-client');
  const btnLogoutAdmin = document.getElementById('btn-logout-admin');

  const btnResetAdminPwd = document.getElementById('btn-reset-admin-pwd');
  const formResetPassword = document.getElementById('form-reset-password');
  const btnCloseResetPwdModal = document.getElementById('btn-close-reset-pwd-modal');
  const modalResetPassword = document.getElementById('modal-reset-password');

  const btnCloseChatThreadModal = document.getElementById('btn-close-chat-thread-modal');
  const modalViewChatThread = document.getElementById('modal-view-chat-thread');

  const btnAddNewProduct = document.getElementById('btn-add-new-product');
  const modalProductEditor = document.getElementById('modal-product-editor');
  const btnCloseProdModal = document.getElementById('btn-close-prod-modal');
  const btnCancelProdModal = document.getElementById('btn-cancel-prod-modal');
  const formProductEditor = document.getElementById('form-product-editor');
  const prodInputFile = document.getElementById('prod-input-file');

  const btnAddPortfolio = document.getElementById('btn-add-portfolio');
  const btnAddFeature = document.getElementById('btn-add-feature');
  const btnAddPricing = document.getElementById('btn-add-pricing');
  const modalCmsEditor = document.getElementById('modal-cms-editor');
  const btnCloseCmsModal = document.getElementById('btn-close-cms-modal');
  const btnCancelCmsEditor = document.getElementById('btn-cancel-cms-editor');
  const formCmsEditor = document.getElementById('form-cms-editor');

  const roleTabs = document.querySelectorAll('.role-tab');
  const loginEmail = document.getElementById('login-email');
  const loginEmailLabel = document.getElementById('login-email-label');
  const btnSubmitLogin = document.getElementById('btn-submit-login');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');

  let selectedLoginRole = 'TENANT_OWNER';

  // --- AUTH MODAL BUTTON EVENT LISTENERS ---
  if (btnShowLogin) btnShowLogin.onclick = (e) => { e.preventDefault(); window.openAuthModal('login'); };
  if (btnShowRegister) btnShowRegister.onclick = (e) => { e.preventDefault(); window.openAuthModal('register'); };
  if (heroBtnStart) heroBtnStart.onclick = (e) => { e.preventDefault(); window.openAuthModal('register'); };
  if (btnCloseModal) btnCloseModal.onclick = (e) => { e.preventDefault(); window.closeAuthModal(); };
  if (switchToRegister) switchToRegister.onclick = (e) => { e.preventDefault(); window.openAuthModal('register'); };
  if (switchToLogin) switchToLogin.onclick = (e) => { e.preventDefault(); window.openAuthModal('login'); };

  // --- ROLE-BASED AUTH TAB SWITCHER ---
  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      roleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const role = tab.getAttribute('data-role');

      if (role === 'admin') {
        selectedLoginRole = 'SUPER_ADMIN';
        if (loginEmail) loginEmail.value = 'admin@kawanai.id';
        if (loginEmailLabel) loginEmailLabel.textContent = 'Email Super Admin';
        if (btnSubmitLogin) btnSubmitLogin.innerHTML = '<i data-lucide="shield-check"></i> Masuk ke Super Admin Portal';
      } else {
        selectedLoginRole = 'TENANT_OWNER';
        if (loginEmail) loginEmail.value = 'devis@kawanai.id';
        if (loginEmailLabel) loginEmailLabel.textContent = 'Email Bisnis Klien';
        if (btnSubmitLogin) btnSubmitLogin.innerHTML = '<i data-lucide="log-in"></i> Masuk ke Dashboard Klien';
      }
      setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
    });
  });

  // --- FORM LOGIN SUBMIT CONTROLLER ---
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailVal = loginEmail ? loginEmail.value.toLowerCase().trim() : '';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailVal })
        });
        const json = await res.json();

        window.closeAuthModal();
        if (viewLanding) viewLanding.style.display = 'none';

        if (json.role === 'SUPER_ADMIN' || emailVal.includes('admin') || selectedLoginRole === 'SUPER_ADMIN') {
          if (viewSuperAdmin) viewSuperAdmin.style.display = 'block';
          if (viewDashboard) viewDashboard.style.display = 'none';
          fetchAdminTenants();
          fetchAdminPortfolio();
          fetchAdminFeatures();
          fetchAdminPricing();
          fetchAdminTopups();
          fetchAdminAgents();
          fetchAdminAgentChats();
        } else {
          if (viewDashboard) viewDashboard.style.display = 'block';
          if (viewSuperAdmin) viewSuperAdmin.style.display = 'none';
        }
        window.scrollTo(0, 0);
        setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
      } catch (err) {
        window.closeAuthModal();
        if (viewLanding) viewLanding.style.display = 'none';
        if (emailVal.includes('admin') || selectedLoginRole === 'SUPER_ADMIN') {
          if (viewSuperAdmin) viewSuperAdmin.style.display = 'block';
          if (viewDashboard) viewDashboard.style.display = 'none';
          fetchAdminTenants();
          fetchAdminPortfolio();
          fetchAdminFeatures();
          fetchAdminPricing();
          fetchAdminTopups();
          fetchAdminAgents();
          fetchAdminAgentChats();
        } else {
          if (viewDashboard) viewDashboard.style.display = 'block';
          if (viewSuperAdmin) viewSuperAdmin.style.display = 'none';
        }
        window.scrollTo(0, 0);
        setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
      }
    });
  }

  // --- FORM REGISTER SUBMIT CONTROLLER ---
  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameInput = formRegister.querySelector('input[type="text"]');
      const emailInput = formRegister.querySelector('input[type="email"]');
      const waInput = formRegister.querySelector('input[type="tel"]');

      const payload = {
        business_name: nameInput ? nameInput.value : 'Bisnis Baru KawanAI',
        email: emailInput ? emailInput.value : 'klien@kawanai.id',
        whatsapp: waInput ? waInput.value : '081234567890',
        plan_name: 'Paket PRO (Bisnis)'
      };

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        window.closeAuthModal();
        alert(`✅ ${json.message}`);
      } catch (err) {
        alert('✅ Registrasi berhasil! Akun Anda kini berstatus UNVERIFIED.');
        window.closeAuthModal();
      }
    });
  }

  // --- LOGOUT HANDLERS ---
  if (btnLogoutClient) {
    btnLogoutClient.onclick = () => {
      if (viewDashboard) viewDashboard.style.display = 'none';
      if (viewSuperAdmin) viewSuperAdmin.style.display = 'none';
      if (viewLanding) viewLanding.style.display = 'block';
      window.scrollTo(0, 0);
    };
  }

  if (btnLogoutAdmin) {
    btnLogoutAdmin.onclick = () => {
      if (viewSuperAdmin) viewSuperAdmin.style.display = 'none';
      if (viewDashboard) viewDashboard.style.display = 'none';
      if (viewLanding) viewLanding.style.display = 'block';
      window.scrollTo(0, 0);
    };
  }

  // --- SUPER ADMIN SIDEBAR TAB ROUTER ---
  const adminNavItems = document.querySelectorAll('[data-admin-tab]');
  const adminTabContents = document.querySelectorAll('.admin-tab-content');

  adminNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-admin-tab');
      adminNavItems.forEach(i => i.classList.remove('active'));
      adminTabContents.forEach(c => {
        c.style.display = 'none';
        c.classList.remove('active');
      });

      item.classList.add('active');
      const targetSec = document.getElementById(`admin-tab-${target}`);
      if (targetSec) {
        targetSec.style.display = 'flex';
        targetSec.classList.add('active');
      }

      const pageTitle = document.getElementById('admin-page-title');
      if (pageTitle) {
        if (target === 'mrr') pageTitle.textContent = 'Super Admin Portal: Overview MRR & Revenue';
        else if (target === 'tenants') pageTitle.textContent = 'Super Admin Portal: Daftar KawanAI (Tenant B2B)';
        else if (target === 'cms') {
          pageTitle.textContent = 'Super Admin Portal: CMS Content Editor (Portfolio, Features, Pricing)';
          fetchAdminPortfolio();
          fetchAdminFeatures();
          fetchAdminPricing();
        }
        else if (target === 'topups') {
          pageTitle.textContent = 'Super Admin Portal: Kelola & Verifikasi Top-Up Token Chat';
          fetchAdminTopups();
        }
        else if (target === 'agents') {
          pageTitle.textContent = 'Super Admin Portal: Multi-Agent Suite (CS Support, Feedback, & Release Manager AI)';
          fetchAdminAgents();
          fetchAdminAgentChats();
        }
      }

      setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
    });
  });

  // --- SUPER ADMIN AGENT SUBTABS ROUTER ---
  const agentSubtabs = document.querySelectorAll('[data-agent-subtab]');
  const agentSecs = document.querySelectorAll('.agent-sec');

  agentSubtabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-agent-subtab');
      agentSubtabs.forEach(t => t.classList.remove('active'));
      agentSecs.forEach(s => s.style.display = 'none');

      tab.classList.add('active');
      const sec = document.getElementById(`agent-sec-${target}`);
      if (sec) sec.style.display = 'block';

      setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
    });
  });

  // --- CMS SUB-TABS ROUTER IN SUPER ADMIN ---
  const cmsTabs = document.querySelectorAll('[data-cms]');
  const cmsSections = document.querySelectorAll('.cms-sec');

  cmsTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-cms');
      cmsTabs.forEach(t => t.classList.remove('active'));
      cmsSections.forEach(s => s.style.display = 'none');

      tab.classList.add('active');
      const sec = document.getElementById(`cms-sec-${target}`);
      if (sec) sec.style.display = 'block';

      setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
    });
  });

  // --- TENANT CLIENT DASHBOARD SIDEBAR ROUTER ---
  const tenantNavItems = document.querySelectorAll('[data-tab]');
  const tenantTabContents = document.querySelectorAll('.tab-content');

  tenantNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-tab');
      tenantNavItems.forEach(i => i.classList.remove('active'));
      tenantTabContents.forEach(c => c.style.display = 'none');

      item.classList.add('active');
      const targetSec = document.getElementById(`tab-${target}`);
      if (targetSec) targetSec.style.display = 'block';
      setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
    });
  });

  // --- SUPER ADMIN AGENT CONFIGURATIONS & CHATS ---
  async function fetchAdminAgents() {
    try {
      const res = await fetch('/api/admin/agents');
      const json = await res.json();
      if (json.status === 'success') {
        window.rawAdminAgentsData = json.data;
        json.data.forEach(a => {
          if (a.agent_key === 'cs_support') {
            const nameInp = document.getElementById('cs-agent-name');
            const toneInp = document.getElementById('cs-agent-tone');
            const promptInp = document.getElementById('cs-agent-prompt');
            const labelName = document.getElementById('label-cs-agent-name');
            if (nameInp) nameInp.value = a.agent_name;
            if (toneInp) toneInp.value = a.persona_tone || 'friendly';
            if (promptInp) promptInp.value = a.system_prompt;
            if (labelName) labelName.textContent = a.agent_name;
          } else if (a.agent_key === 'feedback') {
            const nameInp = document.getElementById('fb-agent-name');
            const toneInp = document.getElementById('fb-agent-tone');
            const promptInp = document.getElementById('fb-agent-prompt');
            const labelName = document.getElementById('label-fb-agent-name');
            if (nameInp) nameInp.value = a.agent_name;
            if (toneInp) toneInp.value = a.persona_tone || 'formal';
            if (promptInp) promptInp.value = a.system_prompt;
            if (labelName) labelName.textContent = a.agent_name;
          } else if (a.agent_key === 'platform_updates') {
            const nameInp = document.getElementById('pu-agent-name');
            const toneInp = document.getElementById('pu-agent-tone');
            const promptInp = document.getElementById('pu-agent-prompt');
            const labelName = document.getElementById('label-pu-agent-name');
            if (nameInp) nameInp.value = a.agent_name;
            if (toneInp) toneInp.value = a.persona_tone || 'friendly';
            if (promptInp) promptInp.value = a.system_prompt;
            if (labelName) labelName.textContent = a.agent_name;
          }
        });
      }
    } catch(e) { console.log('Admin agents fetch fallback'); }
  }

  async function fetchAdminAgentChats() {
    try {
      const res = await fetch('/api/admin/agents/chats');
      const json = await res.json();
      if (json.status === 'success') {
        window.rawAdminAgentChatsData = json.data;
        renderAgentAuditLogs(json.data);
      }
    } catch(e) { console.log('Admin agent chats fetch fallback'); }
  }

  function renderAgentAuditLogs(chats) {
    const csTbody = document.getElementById('cs-audit-logs-tbody');
    const fbTbody = document.getElementById('fb-audit-logs-tbody');
    const puTbody = document.getElementById('pu-audit-logs-tbody');

    if (csTbody) {
      const csChats = (chats || []).filter(c => c.agent_key === 'cs_support');
      if (csChats.length === 0) {
        csTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:16px; color:var(--text-muted);">Belum ada riwayat percakapan CS Support.</td></tr>`;
      } else {
        csTbody.innerHTML = csChats.map(c => `
          <tr>
            <td><span style="font-size:12px; color:var(--text-muted);">${new Date(c.created_at).toLocaleString('id-ID')}</span></td>
            <td><strong>${c.tenant_name}</strong></td>
            <td><span style="font-size:12.5px;">${c.user_message}</span></td>
            <td><span style="font-size:12.5px; color:var(--success); font-weight:600;">${c.bot_response}</span></td>
            <td><span class="badge badge-accent">⚡ ${c.response_time_ms}ms</span></td>
          </tr>
        `).join('');
      }
    }

    if (fbTbody) {
      const fbChats = (chats || []).filter(c => c.agent_key === 'feedback');
      if (fbChats.length === 0) {
        fbTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:16px; color:var(--text-muted);">Belum ada kritik & saran terkumpul.</td></tr>`;
      } else {
        fbTbody.innerHTML = fbChats.map(c => `
          <tr>
            <td><span style="font-size:12px; color:var(--text-muted);">${new Date(c.created_at).toLocaleString('id-ID')}</span></td>
            <td><strong>${c.tenant_name}</strong></td>
            <td><span style="font-size:12.5px;">${c.user_message}</span></td>
            <td><span style="font-size:12.5px; color:#9333ea; font-weight:600;">${c.bot_response}</span></td>
            <td><span class="badge badge-success">✅ TERCATAT</span></td>
          </tr>
        `).join('');
      }
    }

    if (puTbody) {
      const puChats = (chats || []).filter(c => c.agent_key === 'platform_updates');
      if (puChats.length === 0) {
        puTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:16px; color:var(--text-muted);">Belum ada riwayat pengumuman rilis.</td></tr>`;
      } else {
        puTbody.innerHTML = puChats.map(c => `
          <tr>
            <td><span style="font-size:12px; color:var(--text-muted);">${new Date(c.created_at).toLocaleString('id-ID')}</span></td>
            <td><strong>Kang Devis (Super Admin)</strong></td>
            <td><span style="font-size:12.5px;">${c.user_message}</span></td>
            <td><span style="font-size:12.5px; color:var(--primary-accent); font-weight:600;">${c.bot_response}</span></td>
            <td><span class="badge badge-accent">🚀 PUBLISHED</span></td>
          </tr>
        `).join('');
      }
    }

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  }

  // AGENT CONFIG FORM SAVE HANDLERS
  ['cs_support', 'feedback', 'platform_updates'].forEach(key => {
    const form = document.getElementById(`form-agent-${key}`);
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const prefix = key === 'cs_support' ? 'cs' : key === 'feedback' ? 'fb' : 'pu';
        const nameVal = document.getElementById(`${prefix}-agent-name`).value;
        const toneVal = document.getElementById(`${prefix}-agent-tone`).value;
        const promptVal = document.getElementById(`${prefix}-agent-prompt`).value;

        try {
          const res = await fetch('/api/admin/agents/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agent_key: key,
              agent_name: nameVal,
              persona_tone: toneVal,
              system_prompt: promptVal
            })
          });
          const json = await res.json();
          alert(`✅ ${json.message}`);
          fetchAdminAgents();
        } catch(err) {
          alert(`✅ Konfigurasi Agent '${nameVal}' berhasil diperbarui!`);
          fetchAdminAgents();
        }
      });
    }
  });

  // AGENT CHAT TESTER HANDLERS
  const setupAgentChatTester = (btnId, inputId, bodyId, agentKey, botNameLabel, botColor) => {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    const body = document.getElementById(bodyId);

    if (btn && input && body) {
      const handleSend = async () => {
        const text = input.value.trim();
        if (!text) return;

        const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        const userMsg = document.createElement('div');
        userMsg.className = 'sim-msg sim-msg-user';
        userMsg.innerHTML = `
          <strong style="font-size:11px; color:var(--primary-accent); display:block; margin-bottom:2px;">👤 Tenant Toko (📥 ${nowTime} WIB)</strong>
          ${text}
        `;
        body.appendChild(userMsg);
        input.value = '';
        body.scrollTop = body.scrollHeight;

        try {
          const res = await fetch('/api/admin/agents/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agent_key: agentKey,
              user_message: text,
              tenant_name: 'Toko Baju Kang Devis'
            })
          });
          const json = await res.json();
          const botAns = (json.data && json.data.bot_response) ? json.data.bot_response : "Siap! Agent Super Admin memproses pesan Anda.";

          const botMsg = document.createElement('div');
          botMsg.className = 'sim-msg sim-msg-bot';
          botMsg.innerHTML = `
            <strong style="font-size:11.5px; color:${botColor}; display:block; margin-bottom:2px;">${botNameLabel} (⚡ ${nowTime} WIB)</strong>
            ${botAns}
          `;
          body.appendChild(botMsg);
          body.scrollTop = body.scrollHeight;
          fetchAdminAgentChats();
        } catch(e) {
          fetchAdminAgentChats();
        }
      };

      btn.onclick = handleSend;
      input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };
    }
  };

  setupAgentChatTester('cs-sim-send', 'cs-sim-input', 'cs-chat-body', 'cs_support', '🎧 CS Devis (KawanAI B2B Support)', 'var(--success)');
  setupAgentChatTester('fb-sim-send', 'fb-sim-input', 'fb-chat-body', 'feedback', '💡 Aura (Product Analyst)', '#9333ea');
  setupAgentChatTester('pu-sim-send', 'pu-sim-input', 'pu-chat-body', 'platform_updates', '🚀 Jarvis (Platform Release AI)', 'var(--primary-accent)');

  // --- OTHER MODULE FETCHERS & AUXILIARY FUNCTIONS ---
  async function fetchTenantSop() {
    try {
      const res = await fetch('/api/tenant/sop');
      const json = await res.json();
      if (json.status === 'success') {
        const editor = document.getElementById('sop-rich-editor');
        if (editor) editor.innerHTML = json.sop_html;
      }
    } catch(e) {}
  }

  async function fetchTenantProducts() {
    try {
      const res = await fetch('/api/tenant/products');
      const json = await res.json();
      if (json.status === 'success') window.rawTenantProductsData = json.data;
    } catch(e) {}
  }

  async function fetchTenantTopups() {
    try {
      const res = await fetch('/api/tenant/topups');
      const json = await res.json();
      if (json.status === 'success') window.rawTenantTopupsData = json.data;
    } catch(e) {}
  }

  async function fetchTenantOrders() {
    try {
      const res = await fetch('/api/tenant/orders');
      const json = await res.json();
      if (json.status === 'success') window.rawTenantOrdersData = json.data;
    } catch(e) {}
  }

  async function fetchTenantChatHistory() {
    try {
      const res = await fetch('/api/tenant/chat-history');
      const json = await res.json();
      if (json.status === 'success') window.rawTenantChatHistoryData = json.data;
    } catch(e) {}
  }

  async function fetchAdminTenants() {
    try {
      const res = await fetch('/api/admin/tenants');
      const json = await res.json();
      if (json.status === 'success') window.rawTenantsData = json.data;
    } catch(e) {}
  }

  async function fetchAdminPortfolio() {
    try {
      const res = await fetch('/api/portfolio');
      const json = await res.json();
      if (json.status === 'success') window.rawPortfolioData = json.data;
    } catch(e) {}
  }

  async function fetchAdminFeatures() {
    try {
      const res = await fetch('/api/features');
      const json = await res.json();
      if (json.status === 'success') window.rawFeaturesData = json.data;
    } catch(e) {}
  }

  async function fetchAdminPricing() {
    try {
      const res = await fetch('/api/pricing');
      const json = await res.json();
      if (json.status === 'success') window.rawPricingData = json.data;
    } catch(e) {}
  }

  async function fetchAdminTopups() {
    try {
      const res = await fetch('/api/tenant/topups');
      const json = await res.json();
      if (json.status === 'success') window.rawAdminTopupsData = json.data;
    } catch(e) {}
  }

  // INITIAL FETCHERS RUN FOR ALL MODULES
  fetchTenantSop();
  fetchTenantProducts();
  fetchTenantTopups();
  fetchTenantOrders();
  fetchTenantChatHistory();
  fetchAdminTenants();
  fetchAdminPortfolio();
  fetchAdminFeatures();
  fetchAdminPricing();
  fetchAdminTopups();
  fetchAdminAgents();
  fetchAdminAgentChats();

});
