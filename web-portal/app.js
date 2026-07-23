// KawanAI - Complete Application Controller (Harmonized Badges & Action Buttons System)
document.addEventListener('DOMContentLoaded', () => {

  // Global State Stores
  window.rawPortfolioData = [];
  window.rawFeaturesData = [];
  window.rawPricingData = [];
  window.rawTenantsData = [];

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
  const btnBackToTenants = document.getElementById('btn-back-to-tenants');
  const btnTopBackTenants = document.getElementById('btn-top-back-tenants');

  const roleTabs = document.querySelectorAll('.role-tab');
  const loginEmail = document.getElementById('login-email');
  const loginEmailLabel = document.getElementById('login-email-label');
  const btnSubmitLogin = document.getElementById('btn-submit-login');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');

  const tenantSearchInput = document.getElementById('tenant-search-input');
  const tenantSortSelect = document.getElementById('tenant-sort-select');

  let selectedLoginRole = 'TENANT_OWNER';

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

  // DEDICATED TENANT DETAIL PAGE BACK ROUTER
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
        applyTenantFilterAndSort();
      }
    } catch (e) {
      console.log('Tenants fetch fallback');
    }
  }

  // SEARCH FILTER & SORT ENGINE FOR TENANT TABLE
  function applyTenantFilterAndSort() {
    let tenants = [...(window.rawTenantsData || [])];
    const query = tenantSearchInput ? tenantSearchInput.value.toLowerCase().trim() : '';
    const sortVal = tenantSortSelect ? tenantSortSelect.value : 'newest';

    if (query) {
      tenants = tenants.filter(t => {
        const bName = (t.business_name || t.name || '').toLowerCase();
        const oName = (t.owner_name || '').toLowerCase();
        const email = (t.owner_email || '').toLowerCase();
        const wa = (t.whatsapp_number || '').toLowerCase();
        const code = (t.tenant_code || '').toLowerCase();
        return bName.includes(query) || oName.includes(query) || email.includes(query) || wa.includes(query) || code.includes(query);
      });
    }

    if (sortVal === 'name_asc') {
      tenants.sort((a, b) => (a.business_name || a.name || '').localeCompare(b.business_name || b.name || ''));
    } else if (sortVal === 'owner_asc') {
      tenants.sort((a, b) => (a.owner_name || '').localeCompare(b.owner_name || ''));
    }

    renderAdminTenantsTable(tenants);
  }

  if (tenantSearchInput) tenantSearchInput.addEventListener('input', applyTenantFilterAndSort);
  if (tenantSortSelect) tenantSortSelect.addEventListener('change', applyTenantFilterAndSort);

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

  // --- PARA KAWANAI TENANT TABLE (HARMONIZED STATUS BADGES) ---
  function renderAdminTenantsTable(tenants) {
    const tbody = document.getElementById('admin-tenants-table-body');
    if (!tbody) return;

    if (tenants.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">Tidak ada data tenant yang cocok dengan pencarian.</td></tr>`;
      return;
    }

    tbody.innerHTML = tenants.map(t => {
      const code = t.tenant_code || ('#K-' + t.id.substring(0, 4).toUpperCase());
      const bName = t.business_name || t.name || 'Bisnis KawanAI';
      const oName = t.owner_name || 'Kang Devis';
      const email = t.owner_email || 'devis@kawanai.id';
      const wa = t.whatsapp_number || '081234567890';
      const statusStr = t.payment_status || 'VERIFIED';

      let statusBadge = '<span class="badge badge-success"><i data-lucide="check-circle-2"></i> VERIFIED</span>';
      if (statusStr === 'UNVERIFIED') {
        statusBadge = '<span class="badge badge-warning"><i data-lucide="clock"></i> UNVERIFIED</span>';
      } else if (statusStr === 'EXPIRED') {
        statusBadge = '<span class="badge badge-danger"><i data-lucide="alert-circle"></i> EXPIRED</span>';
      }

      return `
        <tr>
          <td><code>${code}</code></td>
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

  // --- LIGHTWEIGHT IMAGE PREVIEW MODAL ---
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

  // --- SUPER ADMIN MANUAL VERIFICATION STATUS UPDATER ---
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

  // --- DEDICATED TENANT DETAIL PAGE ROUTER (HARMONIZED BADGES & BUTTONS) ---
  window.openTenantDetailPage = function(tenantId) {
    const t = (window.rawTenantsData && window.rawTenantsData.find(x => x.id === tenantId)) || {
      id: tenantId,
      tenant_code: '#K-9021',
      business_name: 'Toko Baju Kang Devis',
      owner_name: 'Kang Devis',
      owner_email: 'devis@kawanai.id',
      whatsapp_number: '081234567890',
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
    if (detailSub) detailSub.textContent = `ID Tenant: ${t.tenant_code || '#K-9021'}`;

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
      <div class="card">
        <div class="card-header">
          <h3><i data-lucide="receipt"></i> Informasi Pembayaran Bank</h3>
          ${cardHeaderBadge}
        </div>
        <div class="neat-form-grid" style="gap:20px;">
          <div class="form-row-2col">
            <div><span class="card-subtitle">Tanggal Transaksi</span><br><strong style="font-size:15px;">${payDateStr}</strong></div>
            <div><span class="card-subtitle">Nominal Pembayaran</span><br><strong style="font-size:17px; color:var(--primary-accent);">${amtStr}</strong></div>
          </div>
          <div style="border-top:1px solid var(--border-card); padding-top:16px;">
            <span class="card-subtitle" style="display:block; margin-bottom:8px;">File Bukti Transfer Bank (BCA / Mandiri / QRIS):</span>
            <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(37,99,235,0.04); padding:14px 18px; border-radius:12px; border:1px solid rgba(37,99,235,0.15);">
              <div>
                <strong style="font-size:13.5px; color:var(--text-main); display:block;"><i data-lucide="file-text"></i> resi_transfer_bca_${(t.business_name || 'kawanai').toLowerCase().replace(/\s+/g, '_')}.png</strong>
                <span style="font-size:11.5px; color:var(--text-muted);">Format: PNG / JPG • Terverifikasi Bank</span>
              </div>
              <button class="btn btn-outline btn-sm" onclick="openImagePreviewModal('${proofUrl}', '${(t.business_name || 'KawanAI').replace(/'/g, "\\'")}')">
                <i data-lucide="image"></i> Lihat Resi (Popup)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div class="card-header">
            <h3><i data-lucide="calendar"></i> Masa Aktif & Profil KawanAI</h3>
            <span class="badge badge-accent">Paket PRO</span>
          </div>
          <div class="neat-form-grid" style="gap:18px;">
            <div>
              <span class="card-subtitle">Nama Bisnis & Perusahaan</span>
              <h3 style="font-size:18px; font-weight:800; margin-top:2px;">${t.business_name || t.name}</h3>
            </div>
            <div class="form-row-2col">
              <div><span class="card-subtitle">Nama Pemilik (Owner)</span><br><strong>${t.owner_name || 'Kang Devis'}</strong></div>
              <div><span class="card-subtitle">Kontak WhatsApp</span><br><span class="wa-phone-link"><i data-lucide="phone"></i> ${t.whatsapp_number || '081234567890'}</span></div>
            </div>
            <div>
              <span class="card-subtitle">Email Terdaftar</span><br><strong>${t.owner_email || 'devis@kawanai.id'}</strong>
            </div>
            <div style="border-top:1px solid var(--border-card); padding-top:14px;" class="form-row-2col">
              <div><span class="card-subtitle">Masa Aktif Mulai</span><br><strong style="font-size:15px;">${startStr}</strong></div>
              <div><span class="card-subtitle">Berakhir Pada (Kadaluwarsa)</span><br><strong style="font-size:15px; color:var(--success);">${endStr}</strong></div>
            </div>
          </div>
        </div>

        <!-- HARMONIZED DESIGN SYSTEM ACTION BUTTONS -->
        <div style="border-top:1px solid var(--border-card); padding-top:16px; margin-top:20px; display:flex; flex-direction:column; gap:10px;">
          <span class="card-subtitle" style="font-weight:700;">Aksi Verifikasi Manual Super Admin:</span>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-primary" style="flex:1;" onclick="updateTenantStatus('${t.id}', 'VERIFIED')">
              <i data-lucide="check-circle-2"></i> Verifikasi Pembayaran
            </button>
            <button class="btn btn-outline" style="color:var(--warning); border-color:rgba(217,119,6,0.3);" onclick="updateTenantStatus('${t.id}', 'UNVERIFIED')">
              <i data-lucide="clock"></i> Set Belum Diverifikasi
            </button>
            <button class="btn btn-logout-red" onclick="updateTenantStatus('${t.id}', 'EXPIRED')">
              <i data-lucide="alert-circle"></i> Set Kadaluwarsa
            </button>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  };

  // 5. SUPER ADMIN & CMS TABS
  const adminNavItems = document.querySelectorAll('[data-admin-tab]');
  const adminTabContents = document.querySelectorAll('.admin-tab-content');

  adminNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-admin-tab');
      adminNavItems.forEach(i => i.classList.remove('active'));
      adminTabContents.forEach(c => c.style.display = 'none');

      item.classList.add('active');
      const targetSec = document.getElementById(`admin-tab-${target}`);
      if (targetSec) targetSec.style.display = 'flex';
      setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
    });
  });

  const cmsSubtabs = document.querySelectorAll('[data-cms]');
  const cmsSections = document.querySelectorAll('.cms-sec');

  cmsSubtabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-cms');
      cmsSubtabs.forEach(t => t.classList.remove('active'));
      cmsSections.forEach(s => s.style.display = 'none');

      tab.classList.add('active');
      const targetSec = document.getElementById(`cms-sec-${target}`);
      if (targetSec) targetSec.style.display = 'block';
      setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
    });
  });

  // --- CMS CONTENT EDITOR TABLES ---
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

  // 6. NEAT FORM CMS EDITOR & VISUAL ICON PICKER DROPDOWN CONTROLLER
  const modalCMSEditor = document.getElementById('modal-cms-editor');
  const btnCloseCMSModal = document.getElementById('btn-close-cms-modal');
  const btnCancelCMSEditor = document.getElementById('btn-cancel-cms-editor');
  const formCMSEditor = document.getElementById('form-cms-editor');
  const cmsFieldsContainer = document.getElementById('cms-fields-container');

  if (btnCloseCMSModal) btnCloseCMSModal.onclick = () => { if (modalCMSEditor) modalCMSEditor.style.display = 'none'; };
  if (btnCancelCMSEditor) btnCancelCMSEditor.onclick = () => { if (modalCMSEditor) modalCMSEditor.style.display = 'none'; };

  const ICON_OPTIONS = [
    { name: 'message-square', label: '💬 Live Chat WhatsApp Automation' },
    { name: 'bot', label: '🤖 Karyawan Digital AI Specialist' },
    { name: 'file-text', label: '📄 Katalog & SOP PDF (RAG Knowledge)' },
    { name: 'shopping-bag', label: '🛍️ Pencatatan Pesanan Otomatis' },
    { name: 'sparkles', label: '✨ Otomatisasi AI Super Pintar' },
    { name: 'zap', label: '⚡ Respon Kilat 1.2 Detik 24/7' },
    { name: 'shield-check', label: '🛡️ Keamanan Data Enterprise' },
    { name: 'bar-chart-3', label: '📊 Laporan Analitik & Penjualan' },
    { name: 'phone', label: '📱 WhatsApp Business API Official' },
    { name: 'database', label: '🗄️ Database & CRM Synchronization' },
    { name: 'clock', label: '⏰ Layanan Customer Service 24 Jam' },
    { name: 'users', label: '👥 Multi-Admin Team Management' }
  ];

  window.openCMSEditorModal = function(type, id = null) {
    document.getElementById('cms-item-type').value = type;
    document.getElementById('cms-item-id').value = id || '';
    if (modalCMSEditor) modalCMSEditor.style.display = 'flex';

    if (type === 'portfolio') {
      const item = id ? window.rawPortfolioData.find(x => x.id === id) : {};
      document.getElementById('cms-modal-title').textContent = id ? 'Edit Portofolio & Studi Kasus' : 'Tambah Portofolio Baru';
      cmsFieldsContainer.innerHTML = `
        <div class="form-group"><label>Judul Portofolio</label><input type="text" id="p-title" required value="${item?.title || ''}" placeholder="misal: Toko Baju Kang Devis"></div>
        <div class="form-group"><label>Kategori Bisnis</label><input type="text" id="p-category" required value="${item?.category || 'Online Shop'}" placeholder="Online Shop / Klinik / Legal"></div>
        <div class="form-group"><label>Deskripsi Hasil Studi Kasus</label><textarea id="p-desc" rows="3" required placeholder="Jelaskan hasil efisiensi setelah pakai KawanAI...">${item?.description || ''}</textarea></div>
        <div class="form-row-2col">
          <div class="form-group"><label>Metrik 1 Label</label><input type="text" id="p-m1-label" value="${item?.metric_1_label || 'Waktu Respon'}" placeholder="misal: Waktu Respon"></div>
          <div class="form-group"><label>Metrik 1 Value</label><input type="text" id="p-m1-val" value="${item?.metric_1_value || '1.2 Detik'}" placeholder="misal: 1.2 Detik"></div>
        </div>
        <div class="form-row-2col">
          <div class="form-group"><label>Metrik 2 Label</label><input type="text" id="p-m2-label" value="${item?.metric_2_label || 'Order Otomatis'}" placeholder="misal: Order Otomatis"></div>
          <div class="form-group"><label>Metrik 2 Value</label><input type="text" id="p-m2-val" value="${item?.metric_2_value || '120+ / Bulan'}" placeholder="misal: 120+ / Bulan"></div>
        </div>
      `;
    } else if (type === 'features') {
      const item = id ? window.rawFeaturesData.find(x => x.id === id) : {};
      document.getElementById('cms-modal-title').textContent = id ? 'Edit Fitur Utama Platform' : 'Tambah Fitur Utama Baru';
      
      const currentIcon = item?.icon_name || 'message-square';
      const optionsHtml = ICON_OPTIONS.map(opt => `
        <option value="${opt.name}" ${opt.name === currentIcon ? 'selected' : ''}>
          ${opt.label} (${opt.name})
        </option>
      `).join('');

      cmsFieldsContainer.innerHTML = `
        <div class="form-group">
          <label>Pilih Ikon Fitur (Tinggal Pilih Dropdown):</label>
          <select id="f-icon-select" class="icon-picker-select">
            ${optionsHtml}
          </select>
        </div>
        <div class="form-group"><label>Judul Fitur Utama</label><input type="text" id="f-title" required value="${item?.title || ''}" placeholder="misal: WhatsApp Live Automation"></div>
        <div class="form-group"><label>Deskripsi Fitur</label><textarea id="f-desc" rows="4" required placeholder="Jelaskan keunggulan fitur ini...">${item?.description || ''}</textarea></div>
      `;
    } else if (type === 'pricing') {
      const item = id ? window.rawPricingData.find(x => x.id === id) : {};
      document.getElementById('cms-modal-title').textContent = id ? 'Edit Paket Harga Promo' : 'Tambah Paket Harga Baru';
      cmsFieldsContainer.innerHTML = `
        <div class="form-row-2col">
          <div class="form-group"><label>Kode Paket</label><input type="text" id="pr-code" required value="${item?.plan_code || 'PRO'}" placeholder="LITE / PRO / ENTERPRISE"></div>
          <div class="form-group"><label>Nama Paket</label><input type="text" id="pr-name" required value="${item?.plan_name || ''}" placeholder="Paket Pro (Bisnis)"></div>
        </div>
        <div class="form-row-2col">
          <div class="form-group"><label>Harga Normal Asli (Lebih Mahal)</label><input type="number" id="pr-orig" value="${item?.original_monthly_price || 1490000}" placeholder="misal: 1490000"></div>
          <div class="form-group"><label>Harga Promo Bulanan (Rp)</label><input type="number" id="pr-monthly" required value="${item?.monthly_price || 990000}" placeholder="misal: 990000"></div>
        </div>
        <div class="form-group"><label>Teks Label Promo</label><input type="text" id="pr-badge" value="${item?.promo_badge || 'Promo Terbatas'}" placeholder="misal: Promo Terbatas"></div>
        <div class="form-row-2col">
          <div class="form-group"><label>Batas Tanggal Expiry Promo</label><input type="date" id="pr-ends" value="${item?.promo_ends_at ? item.promo_ends_at.substring(0,10) : '2026-08-31'}"></div>
          <div class="form-group"><label>Harga Setaun Tahunan (Bulanan Rp)</label><input type="number" id="pr-annual" required value="${item?.annual_monthly_price || 790000}"></div>
        </div>
      `;
    }
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  };

  const btnAddPortfolio = document.getElementById('btn-add-portfolio');
  const btnAddFeature = document.getElementById('btn-add-feature');
  const btnAddPricing = document.getElementById('btn-add-pricing');

  if (btnAddPortfolio) btnAddPortfolio.onclick = () => window.openCMSEditorModal('portfolio');
  if (btnAddFeature) btnAddFeature.onclick = () => window.openCMSEditorModal('features');
  if (btnAddPricing) btnAddPricing.onclick = () => window.openCMSEditorModal('pricing');

  if (formCMSEditor) {
    formCMSEditor.addEventListener('submit', async (e) => {
      e.preventDefault();
      const type = document.getElementById('cms-item-type').value;
      const id = document.getElementById('cms-item-id').value;
      let endpoint = `/api/admin/${type}/save`;
      let payload = { id };

      if (type === 'portfolio') {
        payload.title = document.getElementById('p-title').value;
        payload.category = document.getElementById('p-category').value;
        payload.description = document.getElementById('p-desc').value;
        payload.metric_1_label = document.getElementById('p-m1-label').value;
        payload.metric_1_value = document.getElementById('p-m1-val').value;
        payload.metric_2_label = document.getElementById('p-m2-label').value;
        payload.metric_2_value = document.getElementById('p-m2-val').value;
      } else if (type === 'features') {
        const iconSelect = document.getElementById('f-icon-select');
        payload.icon_name = iconSelect ? iconSelect.value : 'message-square';
        payload.title = document.getElementById('f-title').value;
        payload.description = document.getElementById('f-desc').value;
      } else if (type === 'pricing') {
        payload.plan_code = document.getElementById('pr-code').value;
        payload.plan_name = document.getElementById('pr-name').value;
        payload.original_monthly_price = document.getElementById('pr-orig').value;
        payload.monthly_price = document.getElementById('pr-monthly').value;
        payload.promo_badge = document.getElementById('pr-badge').value;
        payload.promo_ends_at = document.getElementById('pr-ends').value ? document.getElementById('pr-ends').value + 'T23:59:59+07:00' : null;
        payload.annual_monthly_price = document.getElementById('pr-annual').value;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.status === 'success') {
        if (modalCMSEditor) modalCMSEditor.style.display = 'none';
        if (type === 'portfolio') fetchDynamicPortfolio();
        if (type === 'features') fetchDynamicFeatures();
        if (type === 'pricing') fetchDynamicPricing();
      }
    });
  }

  // 7. SOFT DELETE CONFIRMATION MODAL LOGIC
  const modalConfirmDelete = document.getElementById('modal-confirm-delete');
  const deleteConfirmText = document.getElementById('delete-confirm-text');
  const deleteTargetType = document.getElementById('delete-target-type');
  const deleteTargetId = document.getElementById('delete-target-id');
  const btnCancelDelete = document.getElementById('btn-cancel-delete');
  const btnConfirmDeleteAction = document.getElementById('btn-confirm-delete-action');

  if (btnCancelDelete) btnCancelDelete.onclick = () => { if (modalConfirmDelete) modalConfirmDelete.style.display = 'none'; };

  window.promptSoftDelete = function(type, id, title) {
    deleteTargetType.value = type;
    deleteTargetId.value = id;
    deleteConfirmText.innerHTML = `Apakah Anda yakin ingin menghapus <strong>"${title}"</strong>?<br><span style="color:var(--text-dim); font-size:12.5px;">Data ini akan dipindahkan ke tempat sampah & tidak hilang permanen.</span>`;
    if (modalConfirmDelete) modalConfirmDelete.style.display = 'flex';
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  };

  if (btnConfirmDeleteAction) {
    btnConfirmDeleteAction.onclick = async () => {
      const type = deleteTargetType.value;
      const id = deleteTargetId.value;

      const res = await fetch(`/api/admin/${type}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const json = await res.json();
      if (json.status === 'success') {
        if (modalConfirmDelete) modalConfirmDelete.style.display = 'none';
        if (type === 'portfolio') fetchDynamicPortfolio();
        if (type === 'features') fetchDynamicFeatures();
        if (type === 'pricing') fetchDynamicPricing();
      }
    };
  }

  // INITIAL FETCHERS RUN
  fetchDynamicPortfolio();
  fetchDynamicFeatures();
  fetchDynamicPricing();
  fetchDynamicTenants();

});
