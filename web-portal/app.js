// KawanAI - Complete Application Controller (Super Admin & RBAC Integration)
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

  // 1. Dynamic Database API Fetchers
  async function fetchDynamicPortfolio() {
    try {
      const res = await fetch('/api/portfolio');
      const json = await res.json();
      if (json.status === 'success' && json.data.length > 0) {
        renderPortfolioGrid(json.data);
      }
    } catch (e) {
      console.log('Using pre-rendered portfolio fallback');
    }
  }

  async function fetchDynamicFeatures() {
    try {
      const res = await fetch('/api/features');
      const json = await res.json();
      if (json.status === 'success' && json.data.length > 0) {
        renderFeaturesGrid(json.data);
      }
    } catch (e) {
      console.log('Using pre-rendered features fallback');
    }
  }

  async function fetchDynamicPricing() {
    try {
      const res = await fetch('/api/pricing');
      const json = await res.json();
      if (json.status === 'success' && json.data.length > 0) {
        renderPricingGrid(json.data);
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
        <div class="porto-header">
          <div class="porto-icon blue"><i data-lucide="${item.icon_name || 'shopping-bag'}"></i></div>
          <span class="badge badge-success">${item.category}</span>
        </div>
        <h3>${item.title}</h3>
        <p class="porto-desc">${item.description}</p>
        <div class="porto-stats">
          <div><span>${item.metric_1_label}</span><strong>${item.metric_1_value}</strong></div>
          <div><span>${item.metric_2_label}</span><strong>${item.metric_2_value}</strong></div>
        </div>
      </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
  }

  function renderFeaturesGrid(items) {
    const grid = document.querySelector('.features-grid');
    if (!grid) return;
    grid.innerHTML = items.map(item => `
      <div class="feature-card card">
        <div class="feature-icon"><i data-lucide="${item.icon_name || 'message-square-code'}"></i></div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
  }

  function renderPricingGrid(plans) {
    const grid = document.querySelector('.pricing-grid');
    if (!grid) return;
    grid.innerHTML = plans.map(p => {
      const monthlyFormatted = parseInt(p.monthly_price).toLocaleString('id-ID');
      const annualFormatted = parseInt(p.annual_monthly_price).toLocaleString('id-ID');
      const featuresList = (typeof p.features_json === 'string' ? JSON.parse(p.features_json) : p.features_json)
        .map(f => `<li><i data-lucide="check-circle-2"></i> ${f}</li>`).join('');

      return `
        <div class="pricing-card card ${p.is_popular ? 'popular' : ''}">
          ${p.is_popular ? '<div class="popular-tag">Paling Populer</div>' : ''}
          <div class="pricing-header">
            <h3>${p.plan_name}</h3>
            <p>${p.subtitle || ''}</p>
            <div class="price-box">
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

    if (window.lucide) lucide.createIcons();

    document.querySelectorAll('.btn-select-plan').forEach(btn => {
      btn.addEventListener('click', () => {
        const planName = btn.getAttribute('data-plan');
        const selectedPlanInput = document.getElementById('selected-plan-input');
        if (selectedPlanInput) selectedPlanInput.value = planName;
        openAuthModal('register');
      });
    });
  }

  fetchDynamicPortfolio();
  fetchDynamicFeatures();
  fetchDynamicPricing();

  // 2. Role-Based Auth Modal Tabs (Tenant vs Super Admin Login)
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
      if (window.lucide) lucide.createIcons();
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

  // Handle Role-Based Login Submission
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

  // 4. Super Admin Tab Navigation
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
    });
  });
});
