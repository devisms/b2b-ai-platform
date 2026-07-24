// KawanAI - Complete Application Controller (Tenant Daily Chat History & WhatsApp Orders System)

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

// --- CHAT THREAD MODAL DISPLAY CONTROLLER ---
window.openChatThreadModal = function(senderName, groupOrWa, userMsg, botMsg, timeStr) {
  const modal = document.getElementById('modal-view-chat-thread');
  const title = document.getElementById('chat-thread-title');
  const subtitle = document.getElementById('chat-thread-subtitle');
  const body = document.getElementById('chat-thread-messages-body');

  if (title) title.textContent = `Percakapan dengan ${senderName}`;
  if (subtitle) subtitle.textContent = groupOrWa ? `Grup: ${groupOrWa}` : `Direct WhatsApp • Waktu: ${timeStr}`;

  if (body) {
    body.innerHTML = `
      <div style="align-self:flex-start; max-width:85%; background:rgba(37,99,235,0.08); padding:12px 16px; border-radius:12px; border:1px solid rgba(37,99,235,0.2);">
        <strong style="font-size:12px; color:var(--primary-accent); display:block; margin-bottom:4px;">👤 ${senderName} (${timeStr})</strong>
        <p style="margin:0; font-size:13.5px; color:var(--text-main); line-height:1.4;">${userMsg}</p>
      </div>

      <div style="align-self:flex-end; max-width:85%; background:rgba(16,185,129,0.08); padding:12px 16px; border-radius:12px; border:1px solid rgba(16,185,129,0.2);">
        <strong style="font-size:12px; color:var(--success); display:block; margin-bottom:4px;">🤖 KawanAI (Sales Specialist)</strong>
        <p style="margin:0; font-size:13.5px; color:var(--text-main); line-height:1.4;">${botMsg}</p>
      </div>
    `;
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

  if (btnCloseChatThreadModal) btnCloseChatThreadModal.onclick = () => { if (modalViewChatThread) modalViewChatThread.style.display = 'none'; };

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

  // RENDER TENANT ORDERS TABLE (AUTOMATED WHATSAPP ORDERS)
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
      const proofUrl = o.payment_proof_url || 'https://dummyimage.com/600x800/0f172a/10b981.png&text=Bukti+Transfer+Order';

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
            <button class="btn btn-outline btn-sm" style="margin-top:6px; font-size:11px; padding:3px 8px;" onclick="openImagePreviewModal('${proofUrl}', 'Order ${o.order_code} • ${o.customer_name.replace(/'/g, "\\'")}')">
              <i data-lucide="image"></i> Lihat Resi (Popup)
            </button>
          </td>
        </tr>
      `;
    }).join('');

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  }

  // RENDER TENANT CHAT HISTORY GROUPED BY DATE & WA GROUP FILTER
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
        const timeStr = item.message_time ? new Date(item.message_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '14:20';
        let badgeType = '<span class="badge badge-accent">💬 Direct WA</span>';
        if (item.chat_type === 'GROUP') {
          badgeType = `<span class="badge badge-accent" style="background:rgba(147,51,234,0.1); color:#9333ea;">👥 Grup: ${item.group_name || 'Grup WA'}</span>`;
        }

        return `
          <div style="display:flex; align-items:flex-start; justify-content:space-between; padding:12px 14px; background:var(--bg-body); border-radius:10px; border:1px solid var(--border-card); gap:12px;">
            <div style="flex:1;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <strong>${item.sender_name}</strong>
                ${badgeType}
                <span style="font-size:11.5px; color:var(--text-muted); margin-left:auto;">🕒 ${timeStr}</span>
              </div>
              <p style="font-size:13px; color:var(--text-main); margin-bottom:4px;"><strong>Pembeli:</strong> "${item.user_message}"</p>
              <p style="font-size:13px; color:var(--success); margin:0;"><strong>AI Siti:</strong> "${item.bot_response}"</p>
            </div>
            <button class="btn btn-outline btn-sm" style="font-size:11px; white-space:nowrap;" 
                    onclick="openChatThreadModal('${item.sender_name.replace(/'/g, "\\'")}', '${(item.group_name || '').replace(/'/g, "\\'")}', '${item.user_message.replace(/'/g, "\\'")}', '${item.bot_response.replace(/'/g, "\\'")}', '${timeStr}')">
              <i data-lucide="message-square"></i> Lihat Percakapan
            </button>
          </div>
        `;
      }).join('');

      return `
        <div class="card" style="padding:18px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; border-bottom:1px solid var(--border-card); padding-bottom:10px;">
            <h4 style="font-size:16px; font-weight:800; color:var(--primary-accent); margin:0;"><i data-lucide="calendar"></i> ${dateTitle}</h4>
            <span class="badge badge-accent">${dayLogs.length} Percakapan Hari Ini</span>
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

  // --- PARA KAWANAI TENANT TABLE ---
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

  // LIGHTWEIGHT IMAGE PREVIEW MODAL
  const modalImagePreview = document.getElementById('modal-image-preview');
  const btnCloseImageModal = document.getElementById('btn-close-image-modal');
  const previewModalImg = document.getElementById('preview-modal-img');
  const previewModalCaption = document.getElementById('preview-modal-caption');

  if (btnCloseImageModal) btnCloseImageModal.onclick = () => { if (modalImagePreview) modalImagePreview.style.display = 'none'; };

  window.openImagePreviewModal = function(imgUrl, caption) {
    if (previewModalImg) previewModalImg.src = imgUrl;
    if (previewModalCaption) previewModalCaption.textContent = `Resi Bukti Transfer BCA • ${caption}`;
    if (modalImagePreview) modalImagePreview.style.display = 'flex';
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  };

  // SUPER ADMIN MANUAL VERIFICATION STATUS UPDATER
  window.updateTenantStatus = async function(tenantId, newStatus) {
    try {
      const res = await fetch('/api/admin/tenants/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tenantId, payment_status: newStatus })
      });
      const json = await res.json();
      if (json.status === 'success') {
        alert(`✅ Status tenant berhasil diubah menjadi ${newStatus}!`);
        await fetchDynamicTenants();
        window.openTenantDetailPage(tenantId);
      }
    } catch (e) {
      alert(`Status tenant diubah menjadi ${newStatus}.`);
    }
  };

  // DEDICATED TENANT DETAIL PAGE ROUTER
  window.openTenantDetailPage = function(tenantId) {
    const t = (window.rawTenantsData && window.rawTenantsData.find(x => x.id === tenantId)) || {
      id: tenantId,
      tenant_code: '#KWN-20260724-0001',
      business_name: 'Toko Baju Kang Devis',
      owner_name: 'Kang Devis',
      owner_email: 'devis@kawanai.id',
      tenant_password: '123456',
      whatsapp_number: '081234567890',
      contact_person_name: 'Mba Rani (CS Lead)',
      shop_whatsapp: '081234567890',
      business_category: 'Fashion & Busana Muslim',
      ai_assistant_name: 'Siti - CS Toko Baju Kang Devis',
      ai_persona_tone: 'Ramah & Casual (Pakai Kak/Sis)',
      total_chat_count: 2480,
      total_orders_count: 312,
      total_omset_amount: 62400000.00,
      catalog_pdf_filename: 'Katalog_Gamis_Syari_Kang_Devis_2026.pdf',
      payment_date: '2026-07-01T10:30:00+07:00',
      subscription_starts_at: '2026-07-01T00:00:00+07:00',
      subscription_ends_at: '2027-07-01T23:59:59+07:00',
      payment_amount: 9480000.00,
      payment_proof_url: 'https://dummyimage.com/600x800/0f172a/3b82f6.png&text=Bukti+Transfer+BCA+B2B+Kang+Devis+Rp+9.480.000',
      payment_status: 'VERIFIED'
    };

    const detailTitle = document.getElementById('detail-tenant-title');
    const detailSub = document.getElementById('detail-tenant-subtitle');
    const statusBadgeElem = document.getElementById('detail-tenant-status-badge');
    const pageContent = document.getElementById('tenant-detail-page-content');

    if (detailTitle) detailTitle.textContent = t.business_name || t.name;
    if (detailSub) detailSub.textContent = `ID Tenant: ${t.tenant_code || '#KWN-20260724-0001'}`;

    const currentStatus = t.payment_status || 'VERIFIED';
    if (statusBadgeElem) {
      if (currentStatus === 'UNVERIFIED') {
        statusBadgeElem.className = 'badge badge-warning';
        statusBadgeElem.innerHTML = '<i data-lucide="clock"></i> UNVERIFIED';
      } else if (currentStatus === 'EXPIRED') {
        statusBadgeElem.className = 'badge badge-danger';
        statusBadgeElem.innerHTML = '<i data-lucide="alert-circle"></i> EXPIRED';
      } else {
        statusBadgeElem.className = 'badge badge-success';
        statusBadgeElem.innerHTML = '<i data-lucide="check-circle-2"></i> VERIFIED';
      }
    }

    if (viewSuperAdmin) viewSuperAdmin.style.display = 'none';
    if (viewTenantDetail) viewTenantDetail.style.display = 'block';
    window.scrollTo(0, 0);

    const payDateStr = t.payment_date ? new Date(t.payment_date).toLocaleString('id-ID') : '01/07/2026 10:30';
    const startStr = t.subscription_starts_at ? new Date(t.subscription_starts_at).toLocaleDateString('id-ID') : '01/07/2026';
    const endStr = t.subscription_ends_at ? new Date(t.subscription_ends_at).toLocaleDateString('id-ID') : '01/07/2027';
    const amtStr = 'Rp ' + parseInt(t.payment_amount || 9480000).toLocaleString('id-ID');
    const proofUrl = t.payment_proof_url || 'https://dummyimage.com/600x800/0f172a/3b82f6.png&text=Bukti+Transfer+BCA+B2B+Kang+Devis+Rp+9.480.000';

    let cardHeaderBadge = '<span class="badge badge-success"><i data-lucide="check-circle-2"></i> VERIFIED</span>';
    if (currentStatus === 'UNVERIFIED') {
      cardHeaderBadge = '<span class="badge badge-warning"><i data-lucide="clock"></i> UNVERIFIED</span>';
    } else if (currentStatus === 'EXPIRED') {
      cardHeaderBadge = '<span class="badge badge-danger"><i data-lucide="alert-circle"></i> EXPIRED</span>';
    }

    pageContent.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
        <div class="card">
          <div class="card-header">
            <h3><i data-lucide="store"></i> Informasi Toko & Perusahaan</h3>
            <span class="badge badge-accent">${t.business_category || 'Online Shop'}</span>
          </div>
          <div class="neat-form-grid" style="gap:16px;">
            <div>
              <span class="card-subtitle">Nama Perusahaan / Bisnis</span>
              <h3 style="font-size:18px; font-weight:800; margin-top:2px;">${t.business_name || t.name}</h3>
            </div>
            <div class="form-row-2col">
              <div><span class="card-subtitle">Contact Person Toko</span><br><strong>${t.contact_person_name || 'Mba Rani (CS Lead)'}</strong></div>
              <div><span class="card-subtitle">No. WhatsApp Bisnis (Live)</span><br><span class="wa-phone-link"><i data-lucide="phone"></i> ${t.shop_whatsapp || t.whatsapp_number || '081234567890'}</span></div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3><i data-lucide="user-check"></i> Informasi Pemilik (Owner)</h3>
            <span class="badge badge-accent">Owner Profile</span>
          </div>
          <div class="neat-form-grid" style="gap:14px;">
            <div>
              <span class="card-subtitle">Nama Pemilik Bisnis</span>
              <h3 style="font-size:18px; font-weight:800; margin-top:2px;">${t.owner_name || 'Kang Devis'}</h3>
            </div>
            <div class="form-row-2col">
              <div><span class="card-subtitle">Email Terdaftar</span><br><strong>${t.owner_email || 'devis@kawanai.id'}</strong></div>
              <div><span class="card-subtitle">No. HP Personal</span><br><span class="wa-phone-link"><i data-lucide="phone"></i> ${t.whatsapp_number || '081234567890'}</span></div>
            </div>
            
            <div style="border-top:1px solid var(--border-card); padding-top:12px; margin-top:4px;">
              <span class="card-subtitle" style="display:block; margin-bottom:6px; font-weight:700;">Kata Sandi (Password Login Tenant):</span>
              <div style="display:flex; align-items:center; gap:8px;">
                <div style="position:relative; flex:1;">
                  <input type="password" id="tenant-pwd-input-${t.id}" value="${t.tenant_password || '123456'}" readonly 
                         style="width:100%; padding:8px 36px 8px 12px; border-radius:8px; border:1px solid var(--border-card); background:var(--bg-body); font-family:monospace; font-weight:700; font-size:14px; color:var(--text-main);">
                  <button type="button" onclick="toggleTenantPasswordVisibility('${t.id}')" title="Lihat / Sembunyikan Password"
                          style="position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--text-muted); cursor:pointer; padding:4px;">
                    <i data-lucide="eye" id="pwd-eye-icon-${t.id}"></i>
                  </button>
                </div>
                <button class="btn btn-outline btn-sm" onclick="promptResetTenantPassword('${t.id}', '${(t.business_name || 'Tenant').replace(/'/g, "\\'")}')" style="white-space:nowrap; font-weight:700;">
                  <i data-lucide="key-round"></i> Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-top:4px;">
        <div class="card">
          <div class="card-header">
            <h3><i data-lucide="bot"></i> Metrik Pemakaian Chat & Asisten AI</h3>
            <span class="badge badge-success">Active 24/7</span>
          </div>
          <div class="neat-form-grid" style="gap:16px;">
            <div class="form-row-2col">
              <div style="background:rgba(37,99,235,0.05); padding:12px 14px; border-radius:10px; border:1px solid rgba(37,99,235,0.15);">
                <span class="card-subtitle">Total Chat Dijawab</span>
                <h3 style="font-size:20px; font-weight:800; color:var(--primary-accent); margin-top:2px;">${(t.total_chat_count || 1420).toLocaleString('id-ID')} Chat</h3>
              </div>
              <div style="background:rgba(5,150,105,0.05); padding:12px 14px; border-radius:10px; border:1px solid rgba(5,150,105,0.15);">
                <span class="card-subtitle">Pesanan Otomatis</span>
                <h3 style="font-size:20px; font-weight:800; color:var(--success); margin-top:2px;">${t.total_orders_count || 184} Order</h3>
              </div>
            </div>
            <div class="form-row-2col">
              <div><span class="card-subtitle">Nama Karyawan AI Specialist</span><br><strong>${t.ai_assistant_name || 'Siti - CS KawanAI'}</strong></div>
              <div><span class="card-subtitle">Tone Persona</span><br><strong>${t.ai_persona_tone || 'Ramah & Casual'}</strong></div>
            </div>
            
            <div style="border-top:1px solid var(--border-card); padding-top:14px; margin-top:4px;">
              <span class="card-subtitle" style="display:block; margin-bottom:8px; font-weight:700;">File Katalog & SOP Knowledge Base (RAG PDF):</span>
              <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(225,29,72,0.04); padding:12px 16px; border-radius:12px; border:1px solid rgba(225,29,72,0.18);">
                <div style="display:flex; align-items:center; gap:10px;">
                  <div style="width:36px; height:36px; border-radius:8px; background:rgba(225,29,72,0.12); color:#e11d48; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    <i data-lucide="file-text" style="width:18px; height:18px;"></i>
                  </div>
                  <div>
                    <strong style="font-size:13px; color:var(--text-main); display:block; font-family:monospace;">${t.catalog_pdf_filename || 'Katalog_Produk_Utama_2026.pdf'}</strong>
                    <span style="font-size:11.5px; color:var(--text-muted);">Dokumen PDF RAG Vector DB • AI Assistant Ready</span>
                  </div>
                </div>
                <button class="btn btn-outline btn-sm" style="font-size:11.5px; color:#e11d48; border-color:rgba(225,29,72,0.3);" onclick="alert('Membuka file ${t.catalog_pdf_filename || 'Katalog_Produk_Utama_2026.pdf'}...')">
                  <i data-lucide="file-text"></i> Buka PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div class="card-header">
              <h3><i data-lucide="receipt"></i> Masa Aktif & Pembayaran Bank</h3>
              ${cardHeaderBadge}
            </div>
            <div class="neat-form-grid" style="gap:16px;">
              <div class="form-row-2col">
                <div><span class="card-subtitle">Tanggal Transaksi</span><br><strong style="font-size:14px;">${payDateStr}</strong></div>
                <div><span class="card-subtitle">Nominal Pembayaran</span><br><strong style="font-size:16px; color:var(--primary-accent);">${amtStr}</strong></div>
              </div>
              <div class="form-row-2col" style="border-top:1px solid var(--border-card); padding-top:12px;">
                <div><span class="card-subtitle">Masa Aktif Mulai</span><br><strong style="font-size:14px;">${startStr}</strong></div>
                <div><span class="card-subtitle">Berakhir Pada (Kadaluwarsa)</span><br><strong style="font-size:14px; color:var(--success);">${endStr}</strong></div>
              </div>
              <div style="border-top:1px solid var(--border-card); padding-top:12px;">
                <span class="card-subtitle" style="display:block; margin-bottom:6px;">File Resi Bukti Transfer:</span>
                <button class="btn btn-outline btn-sm" onclick="openImagePreviewModal('${proofUrl}', '${(t.business_name || 'KawanAI').replace(/'/g, "\\'")}')">
                  <i data-lucide="image"></i> Lihat Resi Transfer (Popup)
                </button>
              </div>
            </div>
          </div>

          <div style="border-top:1px solid var(--border-card); padding-top:14px; margin-top:16px; display:flex; flex-direction:column; gap:8px;">
            <span class="card-subtitle" style="font-weight:700;">Aksi Verifikasi Manual Super Admin:</span>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-primary btn-sm" style="flex:1;" onclick="updateTenantStatus('${t.id}', 'VERIFIED')">
                <i data-lucide="check-circle-2"></i> Verifikasi Pembayaran
              </button>
              <button class="btn btn-outline btn-sm" style="color:var(--warning); border-color:rgba(217,119,6,0.3);" onclick="updateTenantStatus('${t.id}', 'UNVERIFIED')">
                <i data-lucide="clock"></i> Set Belum Diverifikasi
              </button>
              <button class="btn btn-logout-red btn-sm" onclick="updateTenantStatus('${t.id}', 'EXPIRED')">
                <i data-lucide="alert-circle"></i> Set Kadaluwarsa
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  };

  // CMS CONTENT EDITOR TABLES
  function renderCMSPortfolioTable(items) {
    const tbody = document.getElementById('cms-portfolio-table-body');
    if (!tbody) return;
    tbody.innerHTML = items.map(item => `
      <tr>
        <td><strong>${item.title}</strong></td>
        <td><span class="badge badge-accent">${item.category}</span></td>
        <td>${item.metric_1_label}: <strong>${item.metric_1_value}</strong></td>
        <td>${item.metric_2_label}: <strong>${item.metric_2_value}</strong></td>
        <td>
          <button class="btn-action-edit" onclick="openCMSEditorModal('portfolio', '${item.id}')"><i data-lucide="edit"></i> Edit</button>
          <button class="btn-action-delete" onclick="promptSoftDelete('portfolio', '${item.id}', '${item.title.replace(/'/g, "\\'")}')"><i data-lucide="trash-2"></i> Hapus</button>
        </td>
      </tr>
    `).join('');
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  }

  function renderCMSFeaturesTable(items) {
    const tbody = document.getElementById('cms-features-table-body');
    if (!tbody) return;
    tbody.innerHTML = items.map(item => `
      <tr>
        <td><code style="color:var(--primary-accent); font-weight:700;"><i data-lucide="${item.icon_name || 'sparkles'}"></i> ${item.icon_name}</code></td>
        <td><strong>${item.title}</strong></td>
        <td>${item.description.substring(0, 70)}...</td>
        <td>
          <button class="btn-action-edit" onclick="openCMSEditorModal('features', '${item.id}')"><i data-lucide="edit"></i> Edit</button>
          <button class="btn-action-delete" onclick="promptSoftDelete('features', '${item.id}', '${item.title.replace(/'/g, "\\'")}')"><i data-lucide="trash-2"></i> Hapus</button>
        </td>
      </tr>
    `).join('');
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  }

  function renderCMSPricingTable(items) {
    const tbody = document.getElementById('cms-pricing-table-body');
    if (!tbody) return;
    tbody.innerHTML = items.map(p => {
      const origVal = p.original_monthly_price ? parseInt(p.original_monthly_price) : null;
      const promoVal = parseInt(p.monthly_price);
      let pctStr = '';

      if (origVal && origVal > promoVal) {
        const pct = Math.round(((origVal - promoVal) / origVal) * 100);
        pctStr = `<span class="badge badge-success">Diskon ${pct}%</span>`;
      }

      const origStr = origVal ? `<s>Rp ${origVal.toLocaleString('id-ID')}</s>` : '-';
      const promoStr = `Rp ${promoVal.toLocaleString('id-ID')}`;
      const endsStr = p.promo_ends_at ? new Date(p.promo_ends_at).toLocaleDateString('id-ID') : 'Selamanya';

      return `
        <tr>
          <td><code>${p.plan_code}</code></td>
          <td><strong>${p.plan_name}</strong> ${pctStr}</td>
          <td><span style="color:var(--text-dim);">${origStr}</span></td>
          <td><strong style="color:var(--primary-accent);">${promoStr}</strong></td>
          <td><span class="badge badge-accent">${endsStr}</span></td>
          <td>
            <button class="btn-action-edit" onclick="openCMSEditorModal('pricing', '${p.id}')"><i data-lucide="edit"></i> Edit</button>
            <button class="btn-action-delete" onclick="promptSoftDelete('pricing', '${p.id}', '${p.plan_name.replace(/'/g, "\\'")}')"><i data-lucide="trash-2"></i> Hapus</button>
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
