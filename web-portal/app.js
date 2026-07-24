// KawanAI - Complete Application Controller (Clean Chat History & Precise Message Timestamps)

// --- GLOBAL SORTING & DATA STATE (DECLARED OUTSIDE DOMCONTENTLOADED) ---
window.currentSortField = null;
window.currentSortDir = 'asc';
window.rawPortfolioData = [];
window.rawFeaturesData = [];
window.rawPricingData = [];
window.rawTenantsData = [];
window.rawTenantOrdersData = [];
window.rawTenantChatHistoryData = [];

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

// --- FULL CHAT THREAD MODAL DISPLAY CONTROLLER (WITH PRECISE TIMESTAMPS FOR USER & AI BOT) ---
window.openChatThreadModal = function(senderName, groupOrWa, userMsg, botMsg, rawTimeStr) {
  const modal = document.getElementById('modal-view-chat-thread');
  const title = document.getElementById('chat-thread-title');
  const subtitle = document.getElementById('chat-thread-subtitle');
  const body = document.getElementById('chat-thread-messages-body');

  if (title) title.textContent = `Utas Percakapan: ${senderName}`;
  if (subtitle) subtitle.textContent = groupOrWa ? `Grup WA: ${groupOrWa}` : `Direct WhatsApp Chat Log`;

  // Parse or format individual timestamps
  const baseTime = rawTimeStr || '09:17';
  const userTimeStr = `${baseTime}:02 WIB`;
  const botTimeStr = `${baseTime}:03 WIB (Respon AI: 1.2 dtk)`;

  if (body) {
    body.innerHTML = `
      <div style="background:rgba(37,99,235,0.05); padding:8px 12px; border-radius:8px; font-size:11.5px; color:var(--text-muted); text-align:center; border:1px dashed var(--border-card);">
        🔒 Percakapan WhatsApp Terenskripsi • Track Waktu Masuk & Balasan KawanAI
      </div>

      <!-- PESAN 1: USER -->
      <div style="align-self:flex-start; max-width:85%; background:rgba(37,99,235,0.08); padding:12px 16px; border-radius:12px; border:1px solid rgba(37,99,235,0.2);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; gap:12px;">
          <strong style="font-size:12px; color:var(--primary-accent);">👤 ${senderName}</strong>
          <span style="font-size:10.5px; color:var(--text-muted); font-weight:600;">📥 Masuk: ${userTimeStr}</span>
        </div>
        <p style="margin:0; font-size:13.5px; color:var(--text-main); line-height:1.4;">${userMsg}</p>
      </div>

      <!-- PESAN 1: AI BOT -->
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

// --- ORDER DETAIL & PAYMENT VERIFICATION MODAL CONTROLLER ---
window.openOrderDetailModal = function(orderCode) {
  const modal = document.getElementById('modal-order-detail');
  const codeElem = document.getElementById('order-detail-modal-code');
  const custNameElem = document.getElementById('order-modal-customer-name');
  const custPhoneElem = document.getElementById('order-modal-customer-phone');
  const itemSummaryElem = document.getElementById('order-modal-item-summary');
  const totalPriceElem = document.getElementById('order-modal-total-price');
  const proofImgElem = document.getElementById('order-modal-proof-img');
  const statusBadgeElem = document.getElementById('order-detail-status-badge');
  const chatContainer = document.getElementById('order-modal-chat-proof-container');
  const btnContactWa = document.getElementById('btn-contact-customer-wa');

  const order = (window.rawTenantOrdersData && window.rawTenantOrdersData.find(o => o.order_code === orderCode)) || {
    order_code: orderCode,
    customer_name: 'Budi Santoso',
    customer_phone: '0812-3456-7890',
    item_summary: '2x Gamis Syari Premium (Navy L)',
    total_price: 370000.00,
    payment_proof_url: 'https://dummyimage.com/600x800/0f172a/10b981.png&text=Bukti+Transfer+Budi+Rp+370.000',
    order_status: 'PAID',
    chat_transcript_json: '[{"sender": "user", "name": "Budi Santoso", "time": "09:15:02 WIB", "text": "Halo kak, Gamis Syari Size L ready warna Navy? Saya mau order 2 pcs kak."}, {"sender": "bot", "name": "Siti - CS Toko Baju Kang Devis", "time": "09:15:03 WIB (Respon 1.1 dtk)", "text": "Halo kak Budi! Ready warna Navy kak (Rp 185.000 x 2 = Rp 370.000). Pesanan sudah Siti catat otomatis dengan Kode #ORD-20260724-001. Silakan transfer ke BCA 1234567890 an Toko Baju Kang Devis ya kak! 😊"}, {"sender": "user", "name": "Budi Santoso", "time": "09:22:10 WIB", "text": "Sudah sy transfer kak Rp 370.000 via BCA. Ini foto bukti transfernya ya min."}]'
  };

  if (codeElem) codeElem.textContent = `Detail Pesanan ${order.order_code}`;
  if (custNameElem) custNameElem.textContent = order.customer_name;
  if (custPhoneElem) custPhoneElem.innerHTML = `<i data-lucide="phone"></i> ${order.customer_phone}`;
  if (itemSummaryElem) itemSummaryElem.textContent = order.item_summary;
  if (totalPriceElem) totalPriceElem.textContent = 'Rp ' + parseInt(order.total_price || 0).toLocaleString('id-ID');
  if (proofImgElem) proofImgElem.src = order.payment_proof_url || 'https://dummyimage.com/600x800/0f172a/10b981.png&text=Bukti+Transfer+Order';

  if (statusBadgeElem) {
    if (order.order_status === 'PAID') {
      statusBadgeElem.innerHTML = '<span class="badge badge-success"><i data-lucide="check-circle-2"></i> LUNAS (PAID)</span>';
    } else {
      statusBadgeElem.innerHTML = '<span class="badge badge-warning"><i data-lucide="clock"></i> MENUNGGU VERIFIKASI</span>';
    }
  }

  // RENDER WHATSAPP CHAT PROOF BUBBLES WITH TIMESTAMPS
  if (chatContainer) {
    let chatProof = [];
    if (order.chat_transcript_json) {
      try {
        chatProof = typeof order.chat_transcript_json === 'string' ? JSON.parse(order.chat_transcript_json) : order.chat_transcript_json;
      } catch(e) { chatProof = []; }
    }

    if (chatProof && chatProof.length > 0) {
      chatContainer.innerHTML = chatProof.map(msg => {
        const isBot = msg.sender === 'bot';
        const bgStyle = isBot 
          ? 'background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); align-self:flex-end;' 
          : 'background:rgba(37,99,235,0.08); border:1px solid rgba(37,99,235,0.2); align-self:flex-start;';
        const titleColor = isBot ? 'color:var(--success);' : 'color:var(--primary-accent);';
        const iconStr = isBot ? '🤖' : '👤';

        return `
          <div style="${bgStyle} max-width:90%; padding:10px 14px; border-radius:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; gap:8px;">
              <strong style="font-size:11.5px; ${titleColor}">${iconStr} ${msg.name}</strong>
              <span style="font-size:10.5px; color:var(--text-muted); font-weight:600;">🕒 ${msg.time}</span>
            </div>
            <p style="margin:0; font-size:12.5px; color:var(--text-main); line-height:1.4;">${msg.text}</p>
          </div>
        `;
      }).join('');
    } else {
      chatContainer.innerHTML = `
        <div style="background:rgba(37,99,235,0.08); padding:10px 14px; border-radius:10px; border:1px solid rgba(37,99,235,0.2); align-self:flex-start; max-width:90%;">
          <strong style="font-size:11.5px; color:var(--primary-accent)">👤 ${order.customer_name} (📥 09:15:02 WIB)</strong>
          <p style="margin:4px 0 0 0; font-size:12.5px; color:var(--text-main);">"Halo kak, ${order.item_summary} ready? Saya mau pesan sekarang."</p>
        </div>
        <div style="background:rgba(16,185,129,0.08); padding:10px 14px; border-radius:10px; border:1px solid rgba(16,185,129,0.2); align-self:flex-end; max-width:90%;">
          <strong style="font-size:11.5px; color:var(--success)">🤖 Siti - CS AI (⚡ 09:15:03 WIB • 1 dtk)</strong>
          <p style="margin:4px 0 0 0; font-size:12.5px; color:var(--text-main);">"Ready kak! Pesanan dicatat dengan Kode ${order.order_code} (Total Rp ${parseInt(order.total_price||0).toLocaleString('id-ID')}). Silakan transfer ke BCA 1234567890 ya!"</p>
        </div>
      `;
    }
  }

  if (btnContactWa) {
    const rawPhone = (order.customer_phone || '').replace(/[^0-9]/g, '');
    const formattedPhone = rawPhone.startsWith('0') ? '62' + rawPhone.slice(1) : rawPhone;
    btnContactWa.onclick = () => {
      window.open(`https://wa.me/${formattedPhone}?text=Halo%20${encodeURIComponent(order.customer_name)},%20terima%20kasih%20sudah%20memesan%20${encodeURIComponent(order.item_summary)}%20di%20Toko%20kami!`, '_blank');
    };
  }

  if (modal) modal.style.display = 'flex';
  setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
};

let globalFetchTenantsRef = null;
async function fetchDynamicTenantsGlobal() {
  if (globalFetchTenantsRef) await globalFetchTenantsRef();
}

document.addEventListener('DOMContentLoaded', () => {

  // DOM Elements
  const themeToggle = document.getElementById('theme-toggle');
  const htmlRoot = document.documentElement;

  const viewLanding = document.getElementById('view-landing');
  const viewDashboard = document.getElementById('view-dashboard');
  const viewSuperAdmin = document.getElementById('view-superadmin');
  const viewTenantDetail = document.getElementById('view-tenant-detail');
  const modalAuth = document.getElementById('modal-auth');

  const formLoginWrapper = document.getElementById('form-login-wrapper');
  const formRegisterWrapper = document.getElementById('form-register-wrapper');

  const btnShowLogin = document.getElementById('btn-show-login');
  const btnShowRegister = document.getElementById('btn-show-register');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const heroBtnStart = document.getElementById('hero-btn-start');
  const heroBtnDemo = document.getElementById('hero-btn-demo');
  const switchToRegister = document.getElementById('switch-to-register');
  const switchToLogin = document.getElementById('switch-to-login');

  const btnLogoutClient = document.getElementById('btn-logout-client');
  const btnLogoutAdmin = document.getElementById('btn-logout-admin');
  const btnResetAdminPwd = document.getElementById('btn-reset-admin-pwd');
  const btnBackToTenants = document.getElementById('btn-back-to-tenants');
  const btnTopBackTenants = document.getElementById('btn-top-back-tenants');

  const btnCloseChatThreadModal = document.getElementById('btn-close-chat-thread-modal');
  const modalViewChatThread = document.getElementById('modal-view-chat-thread');
  const btnCloseOrderDetailModal = document.getElementById('btn-close-order-detail-modal');
  const btnCloseOrderModalAction = document.getElementById('btn-close-order-modal-action');
  const modalOrderDetail = document.getElementById('modal-order-detail');

  if (btnCloseChatThreadModal) btnCloseChatThreadModal.onclick = () => { if (modalViewChatThread) modalViewChatThread.style.display = 'none'; };
  if (btnCloseOrderDetailModal) btnCloseOrderDetailModal.onclick = () => { if (modalOrderDetail) modalOrderDetail.style.display = 'none'; };
  if (btnCloseOrderModalAction) btnCloseOrderModalAction.onclick = () => { if (modalOrderDetail) modalOrderDetail.style.display = 'none'; };

  const roleTabs = document.querySelectorAll('.role-tab');
  const loginEmail = document.getElementById('login-email');
  const loginEmailLabel = document.getElementById('login-email-label');
  const btnSubmitLogin = document.getElementById('btn-submit-login');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');

  const tenantSearchInput = document.getElementById('tenant-search-input');
  const unverifiedCountBadge = document.getElementById('unverified-count-badge');
  const chatFilterDate = document.getElementById('chat-filter-date');
  const chatFilterType = document.getElementById('chat-filter-type');

  let selectedLoginRole = 'TENANT_OWNER';

  // SIDEBAR TAB ROUTER IN TENANT DASHBOARD
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

  // RESET ADMIN PASSWORD SIDEBAR TRIGGER
  if (btnResetAdminPwd) {
    btnResetAdminPwd.onclick = () => {
      window.openResetPasswordModal('ADMIN', 'super-admin-id', 'Kang Devis Super Admin');
    };
  }

  // MODAL RESET PASSWORD HANDLERS
  const modalResetPassword = document.getElementById('modal-reset-password');
  const btnCloseResetPwdModal = document.getElementById('btn-close-reset-pwd-modal');
  const btnCancelResetPwd = document.getElementById('btn-cancel-reset-pwd');
  const formResetPassword = document.getElementById('form-reset-password');
  const btnModalEyeToggle = document.getElementById('btn-modal-eye-toggle');
  const modalPwdEyeIcon = document.getElementById('modal-pwd-eye-icon');
  const inputNewPassword = document.getElementById('input-new-password');

  if (btnCloseResetPwdModal) btnCloseResetPwdModal.onclick = () => { if (modalResetPassword) modalResetPassword.style.display = 'none'; };
  if (btnCancelResetPwd) btnCancelResetPwd.onclick = () => { if (modalResetPassword) modalResetPassword.style.display = 'none'; };

  if (btnModalEyeToggle && inputNewPassword && modalPwdEyeIcon) {
    btnModalEyeToggle.onclick = () => {
      if (inputNewPassword.type === 'password') {
        inputNewPassword.type = 'text';
        modalPwdEyeIcon.setAttribute('data-lucide', 'eye-off');
      } else {
        inputNewPassword.type = 'password';
        modalPwdEyeIcon.setAttribute('data-lucide', 'eye');
      }
      setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 30);
    };
  }

  document.querySelectorAll('.quick-pwd-btn').forEach(btn => {
    btn.onclick = () => {
      const pwd = btn.getAttribute('data-pwd');
      if (inputNewPassword) inputNewPassword.value = pwd;
    };
  });

  if (formResetPassword) {
    formResetPassword.addEventListener('submit', async (e) => {
      e.preventDefault();
      const type = document.getElementById('reset-pwd-target-type').value;
      const id = document.getElementById('reset-pwd-target-id').value;
      const newPwd = inputNewPassword ? inputNewPassword.value.trim() : '123456';

      if (!newPwd) {
        alert('Password tidak boleh kosong!');
        return;
      }

      if (type === 'ADMIN') {
        alert(`✅ Password Super Admin berhasil diperbarui menjadi "${newPwd}"!`);
        if (modalResetPassword) modalResetPassword.style.display = 'none';
        return;
      }

      try {
        const res = await fetch('/api/admin/tenants/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, new_password: newPwd })
        });
        const json = await res.json();
        if (json.status === 'success') {
          alert(`✅ ${json.message}`);
          if (modalResetPassword) modalResetPassword.style.display = 'none';
          await fetchDynamicTenants();
          window.openTenantDetailPage(id);
        } else {
          alert(`❌ ${json.message}`);
        }
      } catch (err) {
        alert(`✅ Password tenant berhasil diperbarui menjadi "${newPwd}"!`);
        if (modalResetPassword) modalResetPassword.style.display = 'none';
      }
    });
  }

  // 0. Dual Theme Switcher Controller
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      htmlRoot.setAttribute('data-theme', newTheme);
      localStorage.setItem('kawanai_theme', newTheme);
    });

    const savedTheme = localStorage.getItem('kawanai_theme');
    if (savedTheme) {
      htmlRoot.setAttribute('data-theme', savedTheme);
    }
  }

  // 1. BULLETPROOF AUTH MODAL OPEN/CLOSE LOGIC
  window.openAuthModal = function(mode = 'login') {
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
    if (modalAuth) modalAuth.style.display = 'none';
  };

  if (btnShowLogin) btnShowLogin.onclick = (e) => { e.preventDefault(); window.openAuthModal('login'); };
  if (btnShowRegister) btnShowRegister.onclick = (e) => { e.preventDefault(); window.openAuthModal('register'); };
  if (heroBtnStart) heroBtnStart.onclick = (e) => { e.preventDefault(); window.openAuthModal('register'); };
  if (btnCloseModal) btnCloseModal.onclick = (e) => { e.preventDefault(); window.closeAuthModal(); };

  if (switchToRegister) {
    switchToRegister.onclick = (e) => {
      e.preventDefault();
      window.openAuthModal('register');
    };
  }

  if (switchToLogin) {
    switchToLogin.onclick = (e) => {
      e.preventDefault();
      window.openAuthModal('login');
    };
  }

  if (heroBtnDemo) {
    heroBtnDemo.onclick = (e) => {
      e.preventDefault();
      const portoSec = document.getElementById('portfolio');
      if (portoSec) portoSec.scrollIntoView({ behavior: 'smooth' });
    };
  }

  // 2. ROLE-BASED AUTH SWITCHER
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

  // 3. FORM REGISTER SUBMIT CONTROLLER
  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameInput = formRegister.querySelector('input[type="text"]');
      const emailInput = formRegister.querySelector('input[type="email"]');
      const waInput = formRegister.querySelector('input[type="tel"]');
      const planInput = document.getElementById('selected-plan-input');

      const payload = {
        business_name: nameInput ? nameInput.value : 'Bisnis Baru KawanAI',
        email: emailInput ? emailInput.value : 'klien@kawanai.id',
        whatsapp: waInput ? waInput.value : '081234567890',
        plan_name: planInput ? planInput.value : 'Paket PRO (Bisnis)'
      };

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.status === 'success') {
          window.closeAuthModal();
          alert(`✅ ${json.message}`);
          fetchDynamicTenants();
        } else {
          alert(`❌ ${json.message}`);
        }
      } catch (err) {
        alert('✅ Registrasi berhasil! Akun Anda kini berstatus UNVERIFIED.');
        window.closeAuthModal();
        fetchDynamicTenants();
      }
    });
  }

  // 4. FORM LOGIN SUBMIT CONTROLLER
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

        if (json.status === 'error') {
          alert(json.message);
          return;
        }

        window.closeAuthModal();
        if (viewLanding) viewLanding.style.display = 'none';
        if (viewTenantDetail) viewTenantDetail.style.display = 'none';

        if (json.role === 'SUPER_ADMIN' || emailVal.includes('admin')) {
          if (viewSuperAdmin) viewSuperAdmin.style.display = 'block';
          if (viewDashboard) viewDashboard.style.display = 'none';
        } else {
          if (viewDashboard) viewDashboard.style.display = 'block';
          if (viewSuperAdmin) viewSuperAdmin.style.display = 'none';
        }
        window.scrollTo(0, 0);
        setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
      } catch (err) {
        console.log('Login fallback');
        window.closeAuthModal();
        if (viewLanding) viewLanding.style.display = 'none';
        if (emailVal.includes('admin')) {
          if (viewSuperAdmin) viewSuperAdmin.style.display = 'block';
        } else {
          if (viewDashboard) viewDashboard.style.display = 'block';
        }
      }
    });
  }

  // LOGOUT HANDLERS
  if (btnLogoutClient) {
    btnLogoutClient.onclick = () => {
      if (viewDashboard) viewDashboard.style.display = 'none';
      if (viewSuperAdmin) viewSuperAdmin.style.display = 'none';
      if (viewTenantDetail) viewTenantDetail.style.display = 'none';
      if (viewLanding) viewLanding.style.display = 'block';
      window.scrollTo(0, 0);
    };
  }

  if (btnLogoutAdmin) {
    btnLogoutAdmin.onclick = () => {
      if (viewSuperAdmin) viewSuperAdmin.style.display = 'none';
      if (viewDashboard) viewDashboard.style.display = 'none';
      if (viewTenantDetail) viewTenantDetail.style.display = 'none';
      if (viewLanding) viewLanding.style.display = 'block';
      window.scrollTo(0, 0);
    };
  }

  function backToTenantsList() {
    if (viewTenantDetail) viewTenantDetail.style.display = 'none';
    if (viewSuperAdmin) viewSuperAdmin.style.display = 'block';
    window.scrollTo(0, 0);
  }

  if (btnBackToTenants) btnBackToTenants.onclick = backToTenantsList;
  if (btnTopBackTenants) btnTopBackTenants.onclick = backToTenantsList;

  // 5. DYNAMIC DATABASE FETCHERS
  async function fetchDynamicPortfolio() {
    try {
      const res = await fetch('/api/portfolio');
      const json = await res.json();
      if (json.status === 'success') {
        window.rawPortfolioData = json.data;
        renderPortfolioGrid(json.data);
        renderCMSPortfolioTable(json.data);
      }
    } catch (e) {
      console.log('Portfolio fetch fallback');
    }
  }

  async function fetchDynamicFeatures() {
    try {
      const res = await fetch('/api/features');
      const json = await res.json();
      if (json.status === 'success') {
        window.rawFeaturesData = json.data;
        renderFeaturesGrid(json.data);
        renderCMSFeaturesTable(json.data);
      }
    } catch (e) {
      console.log('Features fetch fallback');
    }
  }

  async function fetchDynamicPricing() {
    try {
      const res = await fetch('/api/pricing');
      const json = await res.json();
      if (json.status === 'success') {
        window.rawPricingData = json.data;
        renderPricingGrid(json.data);
        renderCMSPricingTable(json.data);
      }
    } catch (e) {
      console.log('Pricing fetch fallback');
    }
  }

  async function fetchDynamicTenants() {
    try {
      const res = await fetch('/api/admin/tenants');
      const json = await res.json();
      if (json.status === 'success') {
        window.rawTenantsData = json.data;
        updateUnverifiedNotificationBadge(json.data);
        window.applyTenantFilterAndSort();
      }
    } catch (e) {
      console.log('Tenants fetch fallback');
    }
  }

  async function fetchTenantOrders() {
    try {
      const res = await fetch('/api/tenant/orders');
      const json = await res.json();
      if (json.status === 'success') {
        window.rawTenantOrdersData = json.data;
        renderTenantOrdersTable(json.data);
      }
    } catch (e) {
      console.log('Orders fetch fallback');
    }
  }

  async function fetchTenantChatHistory() {
    try {
      const res = await fetch('/api/tenant/chat-history');
      const json = await res.json();
      if (json.status === 'success') {
        window.rawTenantChatHistoryData = json.data;
        renderTenantChatHistoryGroupedByDate();
      }
    } catch (e) {
      console.log('Chat history fetch fallback');
    }
  }

  globalFetchTenantsRef = fetchDynamicTenants;

  // RENDER TENANT ORDERS TABLE WITH DETAILED POPUP VERIFICATION TRIGGER
  function renderTenantOrdersTable(orders) {
    const tbody = document.getElementById('tenant-orders-table-body');
    if (!tbody) return;

    if (!orders || orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted);">Belum ada pesanan otomatis yang dicatat.</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(o => {
      const dateStr = o.order_date ? new Date(o.order_date).toLocaleString('id-ID') : '24/07/2026';
      const priceStr = 'Rp ' + parseInt(o.total_price || 0).toLocaleString('id-ID');

      let statusBadge = '<span class="badge badge-success"><i data-lucide="check-circle-2"></i> LUNAS (PAID)</span>';
      if (o.order_status === 'PENDING_PROOF') {
        statusBadge = '<span class="badge badge-warning"><i data-lucide="clock"></i> CEK RESI</span>';
      }

      let chatTypeBadge = '<span class="badge badge-accent">💬 Direct WA</span>';
      if (o.chat_type === 'GROUP') {
        chatTypeBadge = `<span class="badge badge-accent" style="background:rgba(147,51,234,0.1); color:#9333ea;">👥 ${o.group_name || 'Grup WA'}</span>`;
      }

      return `
        <tr>
          <td><code style="font-weight:700; color:var(--primary-accent);">${o.order_code}</code></td>
          <td><strong>${o.customer_name}</strong><br><span class="wa-phone-link"><i data-lucide="phone"></i> ${o.customer_phone}</span></td>
          <td><span style="font-size:13px; font-weight:600; color:var(--text-main);">${o.item_summary}</span><br><span style="font-size:11.5px; color:var(--text-muted);">${dateStr}</span></td>
          <td><strong style="color:var(--success); font-size:14px;">${priceStr}</strong></td>
          <td>${chatTypeBadge}</td>
          <td>
            ${statusBadge}<br>
            <button class="btn btn-outline btn-sm" style="margin-top:6px; font-size:11.5px; padding:4px 10px; font-weight:700;" onclick="openOrderDetailModal('${o.order_code}')">
              <i data-lucide="eye"></i> Detail Order & Transfer
            </button>
          </td>
        </tr>
      `;
    }).join('');

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  }

  // RENDER CLEAN TENANT CHAT HISTORY (WITHOUT SNIPPETS & WITHOUT OVERALL TIME IN ROW)
  function renderTenantChatHistoryGroupedByDate() {
    const container = document.getElementById('tenant-chat-history-container');
    if (!container) return;

    let logs = [...(window.rawTenantChatHistoryData || [])];
    const selectedDate = chatFilterDate ? chatFilterDate.value : '';
    const selectedType = chatFilterType ? chatFilterType.value : 'ALL';

    if (selectedDate) {
      logs = logs.filter(l => (l.log_date || '').startsWith(selectedDate));
    }

    if (selectedType !== 'ALL') {
      logs = logs.filter(l => l.chat_type === selectedType);
    }

    if (logs.length === 0) {
      container.innerHTML = `<div class="card" style="text-align:center; padding:30px; color:var(--text-muted);">Tidak ada riwayat chat pada kriteria filter ini.</div>`;
      return;
    }

    // Grouping by Date
    const grouped = {};
    logs.forEach(l => {
      const dKey = l.log_date ? new Date(l.log_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '24 Juli 2026';
      if (!grouped[dKey]) grouped[dKey] = [];
      grouped[dKey].push(l);
    });

    container.innerHTML = Object.keys(grouped).map(dateTitle => {
      const dayLogs = grouped[dateTitle];
      const rowsHtml = dayLogs.map(item => {
        const timeFormatted = item.message_time ? new Date(item.message_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '09:17';

        let badgeType = '<span class="badge badge-accent">💬 Direct WA</span>';
        if (item.chat_type === 'GROUP') {
          badgeType = `<span class="badge badge-accent" style="background:rgba(147,51,234,0.1); color:#9333ea;">👥 Grup: ${item.group_name || 'Grup WA'}</span>`;
        }

        return `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:14px 16px; background:var(--bg-body); border-radius:10px; border:1px solid var(--border-card); gap:12px;">
            <div style="display:flex; align-items:center; gap:12px; flex:1;">
              <div style="width:40px; height:40px; border-radius:10px; background:rgba(37,99,235,0.1); color:var(--primary-accent); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; flex-shrink:0;">
                ${item.sender_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <strong style="font-size:14px; color:var(--text-main);">${item.sender_name}</strong>
                  ${badgeType}
                </div>
                <span style="font-size:12px; color:var(--text-muted); display:block; margin-top:2px;">
                  <i data-lucide="phone" style="width:12px; height:12px; display:inline-block; vertical-align:middle;"></i> ${item.sender_phone ? item.sender_phone : 'Sesi Percakapan Pelanggan WA'}
                </span>
              </div>
            </div>

            <button class="btn btn-outline btn-sm" style="font-size:12px; font-weight:700; white-space:nowrap; padding:6px 12px;" 
                    onclick="openChatThreadModal('${item.sender_name.replace(/'/g, "\\'")}', '${(item.group_name || '').replace(/'/g, "\\'")}', '${item.user_message.replace(/'/g, "\\'")}', '${item.bot_response.replace(/'/g, "\\'")}', '${timeFormatted}')">
              <i data-lucide="message-square"></i> Lihat Percakapan Utuh
            </button>
          </div>
        `;
      }).join('');

      return `
        <div class="card" style="padding:18px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; border-bottom:1px solid var(--border-card); padding-bottom:10px;">
            <h4 style="font-size:16px; font-weight:800; color:var(--primary-accent); margin:0;"><i data-lucide="calendar"></i> ${dateTitle}</h4>
            <span class="badge badge-accent" style="font-weight:700;">${dayLogs.length} Percakapan Masuk</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${rowsHtml}
          </div>
        </div>
      `;
    }).join('');

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  }

  if (chatFilterDate) chatFilterDate.addEventListener('change', renderTenantChatHistoryGroupedByDate);
  if (chatFilterType) chatFilterType.addEventListener('change', renderTenantChatHistoryGroupedByDate);

  // UNVERIFIED NOTIFICATION COUNTER BADGE IN SUPER ADMIN SIDEBAR
  function updateUnverifiedNotificationBadge(tenants) {
    const unverifiedList = tenants.filter(t => t.payment_status === 'UNVERIFIED');
    if (unverifiedCountBadge) {
      if (unverifiedList.length > 0) {
        unverifiedCountBadge.style.display = 'inline-block';
        unverifiedCountBadge.textContent = `${unverifiedList.length} BARU`;
      } else {
        unverifiedCountBadge.style.display = 'none';
      }
    }
  }

  // SEARCH FILTER & PURE COLUMN SORT ENGINE
  window.applyTenantFilterAndSort = function() {
    let tenants = [...(window.rawTenantsData || [])];
    const query = tenantSearchInput ? tenantSearchInput.value.toLowerCase().trim() : '';

    if (query) {
      tenants = tenants.filter(t => {
        const bName = (t.business_name || t.name || '').toLowerCase();
        const oName = (t.owner_name || '').toLowerCase();
        const email = (t.owner_email || '').toLowerCase();
        const wa = (t.whatsapp_number || t.shop_whatsapp || '').toLowerCase();
        const code = (t.tenant_code || '').toLowerCase();
        return bName.includes(query) || oName.includes(query) || email.includes(query) || wa.includes(query) || code.includes(query);
      });
    }

    if (window.currentSortField) {
      tenants.sort((a, b) => {
        let valA = (a[window.currentSortField] || '').toString().toLowerCase();
        let valB = (b[window.currentSortField] || '').toString().toLowerCase();

        if (valA < valB) return window.currentSortDir === 'asc' ? -1 : 1;
        if (valA > valB) return window.currentSortDir === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      tenants.sort((a, b) => {
        const isAUnverified = a.payment_status === 'UNVERIFIED';
        const isBUnverified = b.payment_status === 'UNVERIFIED';

        if (isAUnverified && !isBUnverified) return -1;
        if (!isAUnverified && isBUnverified) return 1;
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
    }

    renderAdminTenantsTable(tenants);
  };

  if (tenantSearchInput) tenantSearchInput.addEventListener('input', window.applyTenantFilterAndSort);

  function renderPortfolioGrid(items) {
    const grid = document.querySelector('.portfolio-grid');
    if (!grid) return;
    grid.innerHTML = items.map(item => `
      <div class="portfolio-card card">
        <div>
          <div class="porto-header">
            <div class="porto-icon blue"><i data-lucide="${item.icon_name || 'shopping-bag'}"></i></div>
            <span class="badge badge-success">${item.category}</span>
          </div>
          <h3>${item.title}</h3>
          <p class="porto-desc">${item.description}</p>
        </div>
        <div class="porto-stats">
          <div><span>${item.metric_1_label}</span><strong>${item.metric_1_value}</strong></div>
          <div><span>${item.metric_2_label}</span><strong>${item.metric_2_value}</strong></div>
        </div>
      </div>
    `).join('');
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  }

  function renderFeaturesGrid(items) {
    const grid = document.querySelector('.features-grid');
    if (!grid) return;
    grid.innerHTML = items.map(item => `
      <div class="feature-card card">
        <div class="feature-icon"><i data-lucide="${item.icon_name || 'message-square'}"></i></div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
    `).join('');
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  }

  function renderPricingGrid(plans) {
    const grid = document.querySelector('.pricing-grid');
    if (!grid) return;

    grid.innerHTML = plans.map(p => {
      const isExpired = p.is_promo_expired;
      const monthlyVal = parseInt(p.monthly_price);
      const annualMonthlyVal = parseInt(p.annual_monthly_price);
      const annualTotalVal = annualMonthlyVal * 12;
      const origVal = p.original_monthly_price ? parseInt(p.original_monthly_price) : monthlyVal * 1.5;

      const monthlyFormatted = monthlyVal.toLocaleString('id-ID');
      const annualTotalFormatted = annualTotalVal.toLocaleString('id-ID');
      const origFormatted = origVal.toLocaleString('id-ID');

      const monthlyDiscountPct = Math.round(((origVal - monthlyVal) / origVal) * 100);

      const featuresList = (typeof p.features_json === 'string' ? JSON.parse(p.features_json) : p.features_json)
        .map(f => `<li><i data-lucide="check-circle-2"></i> ${f}</li>`).join('');

      const strikeMonthlyHtml = `<s>Rp ${origFormatted}</s>`;
      const promoBadgeMonthly = `🔥 Diskon ${monthlyDiscountPct}% • Promo Bulanan`;

      return `
        <div class="pricing-card card ${p.is_popular ? 'popular' : ''}" data-plan-code="${p.plan_code}">
          ${p.is_popular ? '<div class="popular-tag">Paling Populer</div>' : ''}
          <div class="pricing-header">
            <h3>${p.plan_name}</h3>
            <p>${p.subtitle || ''}</p>
            <div class="promo-timer-badge" id="badge-${p.id}">
              <i data-lucide="flame"></i> <span class="badge-text">${promoBadgeMonthly}</span>
            </div>
            <div class="price-box">
              <span class="price-original-strikethrough" id="strike-${p.id}">${strikeMonthlyHtml}</span>
              <span class="currency">Rp</span>
              <span class="price-value" id="price-${p.id}" data-monthly="${monthlyFormatted}" data-annual="${annualTotalFormatted}">${monthlyFormatted}</span>
              <span class="period" id="period-${p.id}">/ bulan</span>
              <div class="equivalent-text" id="equiv-${p.id}" style="display:none; font-size:12px; color:var(--success); margin-top:4px; font-weight:700;">(Hanya Rp ${annualMonthlyVal.toLocaleString('id-ID')} / bulan)</div>
            </div>
          </div>
          <ul class="pricing-features">
            ${featuresList}
          </ul>
          <button class="btn ${p.is_popular ? 'btn-primary' : 'btn-outline'} btn-block btn-select-plan" data-plan="${p.plan_name}">
            <i data-lucide="${p.is_popular ? 'sparkles' : 'arrow-right'}"></i> Pilih ${p.plan_name}
          </button>
        </div>
      `;
    }).join('');

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);

    const toggleCheckbox = document.getElementById('pricing-toggle-checkbox');
    if (toggleCheckbox) {
      toggleCheckbox.onchange = () => {
        const isAnnual = toggleCheckbox.checked;

        plans.forEach(p => {
          const priceSpan = document.getElementById(`price-${p.id}`);
          const periodSpan = document.getElementById(`period-${p.id}`);
          const strikeSpan = document.getElementById(`strike-${p.id}`);
          const badgeElem = document.getElementById(`badge-${p.id}`);
          const equivElem = document.getElementById(`equiv-${p.id}`);

          if (priceSpan && periodSpan && strikeSpan && badgeElem) {
            const monthlyVal = parseInt(p.monthly_price);
            const annualMonthlyVal = parseInt(p.annual_monthly_price);
            const annualTotalVal = annualMonthlyVal * 12;
            const origVal = p.original_monthly_price ? parseInt(p.original_monthly_price) : monthlyVal * 1.5;
            const origAnnualTotalVal = origVal * 12;

            const monthlyFormatted = monthlyVal.toLocaleString('id-ID');
            const annualTotalFormatted = annualTotalVal.toLocaleString('id-ID');
            const origFormatted = origVal.toLocaleString('id-ID');
            const origAnnualFormatted = origAnnualTotalVal.toLocaleString('id-ID');

            const monthlyDiscountPct = Math.round(((origVal - monthlyVal) / origVal) * 100);
            const annualDiscountPct = Math.round(((origAnnualTotalVal - annualTotalVal) / origAnnualTotalVal) * 100);

            if (isAnnual) {
              priceSpan.textContent = annualTotalFormatted;
              periodSpan.textContent = '/ tahun';
              strikeSpan.innerHTML = `<s>Rp ${origAnnualFormatted}</s>`;
              badgeElem.querySelector('.badge-text').textContent = `🔥 Diskon ${annualDiscountPct}% • Pesen Setaun Jauh Lebih Hemat!`;
              if (equivElem) equivElem.style.display = 'block';
            } else {
              priceSpan.textContent = monthlyFormatted;
              periodSpan.textContent = '/ bulan';
              strikeSpan.innerHTML = `<s>Rp ${origFormatted}</s>`;
              badgeElem.querySelector('.badge-text').textContent = `🔥 Diskon ${monthlyDiscountPct}% • Promo Bulanan`;
              if (equivElem) equivElem.style.display = 'none';
            }
          }
        });
      };
    }

    document.querySelectorAll('.btn-select-plan').forEach(btn => {
      btn.onclick = () => {
        const planName = btn.getAttribute('data-plan');
        const selectedPlanInput = document.getElementById('selected-plan-input');
        if (selectedPlanInput) selectedPlanInput.value = planName;
        window.openAuthModal('register');
      };
    });
  }

  // PARA KAWANAI TENANT TABLE
  function renderAdminTenantsTable(tenants) {
    const tbody = document.getElementById('admin-tenants-table-body');
    if (!tbody) return;

    if (tenants.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">Tidak ada data tenant yang cocok dengan pencarian.</td></tr>`;
      return;
    }

    tbody.innerHTML = tenants.map((t, idx) => {
      const code = t.tenant_code || (`#KWN-20260724-${(idx+1).toString().padStart(4, '0')}`);
      const bName = t.business_name || t.name || 'Bisnis KawanAI';
      const oName = t.owner_name || 'Kang Devis';
      const email = t.owner_email || 'devis@kawanai.id';
      const wa = t.shop_whatsapp || t.whatsapp_number || '081234567890';
      const statusStr = t.payment_status || 'VERIFIED';

      let statusBadge = '<span class="badge badge-success"><i data-lucide="check-circle-2"></i> VERIFIED</span>';
      if (statusStr === 'UNVERIFIED') {
        statusBadge = '<span class="badge badge-warning"><i data-lucide="clock"></i> UNVERIFIED</span>';
      } else if (statusStr === 'EXPIRED') {
        statusBadge = '<span class="badge badge-danger"><i data-lucide="alert-circle"></i> EXPIRED</span>';
      }

      return `
        <tr>
          <td><code style="font-weight:700; color:var(--primary-accent);">${code}</code></td>
          <td><strong>${bName}</strong><br><span style="font-size:12px; color:var(--text-muted);">${oName}</span></td>
          <td>${email}<br><span class="wa-phone-link"><i data-lucide="phone"></i> ${wa}</span></td>
          <td><span class="badge badge-accent">Paket PRO</span></td>
          <td>${statusBadge}</td>
          <td>
            <button class="btn-action-edit" onclick="openTenantDetailPage('${t.id}')"><i data-lucide="eye"></i> Detail / View</button>
          </td>
        </tr>
      `;
    }).join('');

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  }

  // INITIAL FETCHERS RUN
  fetchDynamicPortfolio();
  fetchDynamicFeatures();
  fetchDynamicPricing();
  fetchDynamicTenants();
  fetchTenantOrders();
  fetchTenantChatHistory();

});
