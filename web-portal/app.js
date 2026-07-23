// KawanAI - Complete Application Controller (Dynamic Pricing Switcher & Percentage Discount Engine)
document.addEventListener('DOMContentLoaded', () => {

  // 0. Dual Theme Switcher Controller
  const themeToggle = document.getElementById('theme-toggle');
  const htmlRoot = document.documentElement;

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

  // Global State Stores
  let rawPortfolioData = [];
  let rawFeaturesData = [];
  let rawPricingData = [];

  // 1. Dynamic Database API Fetchers
  async function fetchDynamicPortfolio() {
    try {
      const res = await fetch('/api/portfolio');
      const json = await res.json();
      if (json.status === 'success') {
        rawPortfolioData = json.data;
        renderPortfolioGrid(json.data);
        renderCMSPortfolioTable(json.data);
      }
    } catch (e) {
      console.log('Using pre-rendered portfolio fallback');
    }
  }

  async function fetchDynamicFeatures() {
    try {
      const res = await fetch('/api/features');
      const json = await res.json();
      if (json.status === 'success') {
        rawFeaturesData = json.data;
        renderFeaturesGrid(json.data);
        renderCMSFeaturesTable(json.data);
      }
    } catch (e) {
      console.log('Using pre-rendered features fallback');
    }
  }

  async function fetchDynamicPricing() {
    try {
      const res = await fetch('/api/pricing');
      const json = await res.json();
      if (json.status === 'success') {
        rawPricingData = json.data;
        renderPricingGrid(json.data);
        renderCMSPricingTable(json.data);
      }
    } catch (e) {
      console.log('Using pre-rendered pricing fallback');
    }
  }

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
      const annualVal = parseInt(p.annual_monthly_price);
      const origVal = p.original_monthly_price ? parseInt(p.original_monthly_price) : null;

      const monthlyFormatted = monthlyVal.toLocaleString('id-ID');
      const annualFormatted = annualVal.toLocaleString('id-ID');
      const origFormatted = origVal ? origVal.toLocaleString('id-ID') : null;

      // Calculate percentage discount automatically (misal: (1490000 - 990000) / 1490000 = 33.5% -> 34%)
      let discountPct = 0;
      if (origVal && origVal > monthlyVal) {
        discountPct = Math.round(((origVal - monthlyVal) / origVal) * 100);
      }

      let strikeHtml = '';
      let promoBadgeHtml = '';

      if (!isExpired && origVal && origVal > monthlyVal) {
        strikeHtml = `<span class="price-original-strikethrough" data-orig-monthly="Rp ${origFormatted}" data-orig-annual="Rp ${origFormatted}"><s>Rp ${origFormatted}</s></span>`;
        promoBadgeHtml = `<div class="promo-timer-badge"><i data-lucide="flame"></i> Diskon ${discountPct}% • ${p.promo_badge || 'Promo Terbatas'}</div>`;
      }

      const featuresList = (typeof p.features_json === 'string' ? JSON.parse(p.features_json) : p.features_json)
        .map(f => `<li><i data-lucide="check-circle-2"></i> ${f}</li>`).join('');

      return `
        <div class="pricing-card card ${p.is_popular ? 'popular' : ''}">
          ${p.is_popular ? '<div class="popular-tag">Paling Populer</div>' : ''}
          <div class="pricing-header">
            <h3>${p.plan_name}</h3>
            <p>${p.subtitle || ''}</p>
            ${promoBadgeHtml}
            <div class="price-box">
              ${strikeHtml}
              <span class="currency">Rp</span>
              <span class="price-value" data-monthly="${monthlyFormatted}" data-annual="${annualFormatted}">${monthlyFormatted}</span>
              <span class="period">/ bulan</span>
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

    // DYNAMIC MONTHLY / ANNUAL TOGGLE SWITCHER ENGINE
    const toggleCheckbox = document.getElementById('pricing-toggle-checkbox');
    if (toggleCheckbox) {
      toggleCheckbox.addEventListener('change', () => {
        const isAnnual = toggleCheckbox.checked;
        document.querySelectorAll('.price-value').forEach(priceSpan => {
          const monthly = priceSpan.getAttribute('data-monthly');
          const annual = priceSpan.getAttribute('data-annual');
          priceSpan.textContent = isAnnual ? annual : monthly;
        });
        document.querySelectorAll('.pricing-header .period').forEach(periodSpan => {
          periodSpan.textContent = isAnnual ? '/ bulan (ditagih tahunan)' : '/ bulan';
        });
      });
    }

    document.querySelectorAll('.btn-select-plan').forEach(btn => {
      btn.addEventListener('click', () => {
        const planName = btn.getAttribute('data-plan');
        const selectedPlanInput = document.getElementById('selected-plan-input');
        if (selectedPlanInput) selectedPlanInput.value = planName;
        openAuthModal('register');
      });
    });
  }

  // --- CMS CONTENT EDITOR TABLES (SUPER ADMIN) ---
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
        <td><code>${item.icon_name}</code></td>
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

  fetchDynamicPortfolio();
  fetchDynamicFeatures();
  fetchDynamicPricing();

  // 2. Role-Based Auth Modal Tabs
  const roleTabs = document.querySelectorAll('.role-tab');
  const loginEmail = document.getElementById('login-email');
  const loginEmailLabel = document.getElementById('login-email-label');
  const btnSubmitLogin = document.getElementById('btn-submit-login');
  let selectedLoginRole = 'TENANT_OWNER';

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

  // 3. View & Modal Controllers
  const viewLanding = document.getElementById('view-landing');
  const viewDashboard = document.getElementById('view-dashboard');
  const viewSuperAdmin = document.getElementById('view-superadmin');
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

  function openAuthModal(mode = 'login') {
    modalAuth.style.display = 'flex';
    if (mode === 'login') {
      formLoginWrapper.style.display = 'block';
      formRegisterWrapper.style.display = 'none';
    } else {
      formLoginWrapper.style.display = 'none';
      formRegisterWrapper.style.display = 'block';
    }
  }

  function closeModal() {
    modalAuth.style.display = 'none';
  }

  if (btnShowLogin) btnShowLogin.addEventListener('click', () => openAuthModal('login'));
  if (btnShowRegister) btnShowRegister.addEventListener('click', () => openAuthModal('register'));
  if (heroBtnStart) heroBtnStart.addEventListener('click', () => openAuthModal('register'));
  if (heroBtnDemo) {
    heroBtnDemo.addEventListener('click', () => {
      const portoSec = document.getElementById('portfolio');
      if (portoSec) portoSec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);

  if (switchToRegister) {
    switchToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      openAuthModal('register');
    });
  }

  if (switchToLogin) {
    switchToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      openAuthModal('login');
    });
  }

  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      closeModal();
      viewLanding.style.display = 'none';

      if (selectedLoginRole === 'SUPER_ADMIN' || loginEmail.value.includes('admin')) {
        viewSuperAdmin.style.display = 'block';
        viewDashboard.style.display = 'none';
      } else {
        viewDashboard.style.display = 'block';
        viewSuperAdmin.style.display = 'none';
      }
      window.scrollTo(0, 0);
    });
  }

  if (btnLogoutClient) {
    btnLogoutClient.addEventListener('click', () => {
      viewDashboard.style.display = 'none';
      viewLanding.style.display = 'block';
      window.scrollTo(0, 0);
    });
  }

  if (btnLogoutAdmin) {
    btnLogoutAdmin.addEventListener('click', () => {
      viewSuperAdmin.style.display = 'none';
      viewLanding.style.display = 'block';
      window.scrollTo(0, 0);
    });
  }

  // 4. Super Admin Tab & CMS Sub-Tabs Controller
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

  // 5. NEAT FORM CMS EDITOR & SOFT DELETE MODAL CONTROLLER
  const modalCMSEditor = document.getElementById('modal-cms-editor');
  const btnCloseCMSModal = document.getElementById('btn-close-cms-modal');
  const btnCancelCMSEditor = document.getElementById('btn-cancel-cms-editor');
  const formCMSEditor = document.getElementById('form-cms-editor');
  const cmsFieldsContainer = document.getElementById('cms-fields-container');

  if (btnCloseCMSModal) btnCloseCMSModal.addEventListener('click', () => modalCMSEditor.style.display = 'none');
  if (btnCancelCMSEditor) btnCancelCMSEditor.addEventListener('click', () => modalCMSEditor.style.display = 'none');

  window.openCMSEditorModal = function(type, id = null) {
    document.getElementById('cms-item-type').value = type;
    document.getElementById('cms-item-id').value = id || '';
    modalCMSEditor.style.display = 'flex';

    if (type === 'portfolio') {
      const item = id ? rawPortfolioData.find(x => x.id === id) : {};
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
      const item = id ? rawFeaturesData.find(x => x.id === id) : {};
      document.getElementById('cms-modal-title').textContent = id ? 'Edit Fitur Utama' : 'Tambah Fitur Utama Baru';
      cmsFieldsContainer.innerHTML = `
        <div class="form-group"><label>Nama Ikon Lucide</label><input type="text" id="f-icon" required value="${item?.icon_name || 'message-square-code'}" placeholder="message-square / bot / file-text"></div>
        <div class="form-group"><label>Judul Fitur</label><input type="text" id="f-title" required value="${item?.title || ''}" placeholder="misal: WhatsApp Live Automation"></div>
        <div class="form-group"><label>Deskripsi Fitur</label><textarea id="f-desc" rows="4" required placeholder="Jelaskan keunggulan fitur ini...">${item?.description || ''}</textarea></div>
      `;
    } else if (type === 'pricing') {
      const item = id ? rawPricingData.find(x => x.id === id) : {};
      document.getElementById('cms-modal-title').textContent = id ? 'Edit Paket Harga Promo' : 'Tambah Paket Harga Baru';
      cmsFieldsContainer.innerHTML = `
        <div class="form-row-2col">
          <div class="form-group"><label>Kode Paket</label><input type="text" id="pr-code" required value="${item?.plan_code || 'PRO'}" placeholder="LITE / PRO / ENTERPRISE"></div>
          <div class="form-group"><label>Nama Paket</label><input type="text" id="pr-name" required value="${item?.plan_name || ''}" placeholder="Paket Pro (Bisnis)"></div>
        </div>
        <div class="form-row-2col">
          <div class="form-group"><label>Harga Normal (Lebih Mahal)</label><input type="number" id="pr-orig" value="${item?.original_monthly_price || 1490000}" placeholder="misal: 1490000"></div>
          <div class="form-group"><label>Harga Diskon Promo (Lebih Murah)</label><input type="number" id="pr-monthly" required value="${item?.monthly_price || 990000}" placeholder="misal: 990000"></div>
        </div>
        <div class="form-group"><label>Teks Label Promo</label><input type="text" id="pr-badge" value="${item?.promo_badge || 'Promo Terbatas'}" placeholder="misal: Promo Terbatas"></div>
        <div class="form-row-2col">
          <div class="form-group"><label>Batas Tanggal Expiry Promo</label><input type="date" id="pr-ends" value="${item?.promo_ends_at ? item.promo_ends_at.substring(0,10) : '2026-08-31'}"></div>
          <div class="form-group"><label>Harga Tahunan Bulanan (Rp)</label><input type="number" id="pr-annual" required value="${item?.annual_monthly_price || 790000}"></div>
        </div>
      `;
    }
  };

  const btnAddPortfolio = document.getElementById('btn-add-portfolio');
  const btnAddFeature = document.getElementById('btn-add-feature');
  const btnAddPricing = document.getElementById('btn-add-pricing');

  if (btnAddPortfolio) btnAddPortfolio.addEventListener('click', () => openCMSEditorModal('portfolio'));
  if (btnAddFeature) btnAddFeature.addEventListener('click', () => openCMSEditorModal('features'));
  if (btnAddPricing) btnAddPricing.addEventListener('click', () => openCMSEditorModal('pricing'));

  // Submit Form CMS (Save or Update)
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
        payload.icon_name = document.getElementById('f-icon').value;
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
        modalCMSEditor.style.display = 'none';
        if (type === 'portfolio') fetchDynamicPortfolio();
        if (type === 'features') fetchDynamicFeatures();
        if (type === 'pricing') fetchDynamicPricing();
      }
    });
  }

  // 6. SOFT DELETE CONFIRMATION MODAL LOGIC
  const modalConfirmDelete = document.getElementById('modal-confirm-delete');
  const deleteConfirmText = document.getElementById('delete-confirm-text');
  const deleteTargetType = document.getElementById('delete-target-type');
  const deleteTargetId = document.getElementById('delete-target-id');
  const btnCancelDelete = document.getElementById('btn-cancel-delete');
  const btnConfirmDeleteAction = document.getElementById('btn-confirm-delete-action');

  if (btnCancelDelete) btnCancelDelete.addEventListener('click', () => modalConfirmDelete.style.display = 'none');

  window.promptSoftDelete = function(type, id, title) {
    deleteTargetType.value = type;
    deleteTargetId.value = id;
    deleteConfirmText.innerHTML = `Apakah Anda yakin ingin menghapus <strong>"${title}"</strong>?<br><span style="color:var(--text-dim); font-size:12.5px;">Data ini akan dipindahkan ke tempat sampah & tidak hilang permanen.</span>`;
    modalConfirmDelete.style.display = 'flex';
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  };

  if (btnConfirmDeleteAction) {
    btnConfirmDeleteAction.addEventListener('click', async () => {
      const type = deleteTargetType.value;
      const id = deleteTargetId.value;

      const res = await fetch(`/api/admin/${type}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const json = await res.json();
      if (json.status === 'success') {
        modalConfirmDelete.style.display = 'none';
        if (type === 'portfolio') fetchDynamicPortfolio();
        if (type === 'features') fetchDynamicFeatures();
        if (type === 'pricing') fetchDynamicPricing();
      }
    });
  }

});
