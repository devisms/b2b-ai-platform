// KawanAI - Complete Dynamic Application Controller (PostgreSQL API Driven)
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

  // 1. Dynamic Database API Fetchers (PostgreSQL Integration)
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

    // Re-bind Select Plan Buttons
    document.querySelectorAll('.btn-select-plan').forEach(btn => {
      btn.addEventListener('click', () => {
        const planName = btn.getAttribute('data-plan');
        const selectedPlanInput = document.getElementById('selected-plan-input');
        if (selectedPlanInput) selectedPlanInput.value = planName;
        openAuthModal('register');
      });
    });
  }

  // Initial API Execution
  fetchDynamicPortfolio();
  fetchDynamicPricing();

  // 2. Pricing Toggle Handler (Monthly vs Annual 20% Discount)
  const pricingToggle = document.getElementById('pricing-toggle-checkbox');
  if (pricingToggle) {
    pricingToggle.addEventListener('change', (e) => {
      const isAnnual = e.target.checked;
      document.querySelectorAll('.price-value').forEach(pv => {
        if (isAnnual) {
          pv.textContent = pv.getAttribute('data-annual');
        } else {
          pv.textContent = pv.getAttribute('data-monthly');
        }
      });
    });
  }

  // 3. View & Modal Controllers
  const viewLanding = document.getElementById('view-landing');
  const viewDashboard = document.getElementById('view-dashboard');
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
  const btnLogout = document.getElementById('btn-logout');

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

  // Handle Login Submission
  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      closeModal();
      viewLanding.style.display = 'none';
      viewDashboard.style.display = 'block';
      window.scrollTo(0, 0);
    });
  }

  // Handle Register Submission
  const formRegister = document.getElementById('form-register');
  if (formRegister) {
    formRegister.addEventListener('submit', (e) => {
      e.preventDefault();
      closeModal();
      alert('🎉 Selamat! Pendaftaran Berhasil. Selamat Datang di Dashboard KawanAI!');
      viewLanding.style.display = 'none';
      viewDashboard.style.display = 'block';
      window.scrollTo(0, 0);
    });
  }

  // Handle Logout
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      viewDashboard.style.display = 'none';
      viewLanding.style.display = 'block';
      window.scrollTo(0, 0);
    });
  }

  // 4. Dashboard Internal Tab Navigation
  const navItems = document.querySelectorAll('.nav-item');
  const tabContents = document.querySelectorAll('.tab-content');
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');

  const titlesMap = {
    overview: {
      title: "Dashboard & Overview Tenant",
      subtitle: "Karyawan Digital Bisnis Anda • Status: Online 24/7"
    },
    customizer: {
      title: "Atur Karyawan AI Spesifik Klien",
      subtitle: "Konfigurasi Persona, Nama, & Instruksi Karyawan Digital Spesifik Klien"
    },
    whatsapp: {
      title: "Koneksi WhatsApp Bisnis",
      subtitle: "Sambungkan Nomor WhatsApp Toko via QR Code"
    },
    documents: {
      title: "Katalog & SOP (Knowledge Base Klien)",
      subtitle: "Upload Dokumen PDF/Docx Penyimpan Otak Karyawan AI"
    }
  };

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');

      navItems.forEach(i => i.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      item.classList.add('active');
      const targetElement = document.getElementById(`tab-${targetTab}`);
      if (targetElement) targetElement.classList.add('active');

      if (titlesMap[targetTab]) {
        pageTitle.textContent = titlesMap[targetTab].title;
        pageSubtitle.textContent = titlesMap[targetTab].subtitle;
      }
    });
  });

  // 5. Live Chat Simulator
  const simInput = document.getElementById('sim-input');
  const simSend = document.getElementById('sim-send');
  const simMessages = document.getElementById('simulator-messages');

  function sendSimMessage() {
    const text = simInput.value.trim();
    if (!text) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'msg msg-user';
    userMsg.textContent = text;
    simMessages.appendChild(userMsg);

    simInput.value = '';
    simMessages.scrollTop = simMessages.scrollHeight;

    setTimeout(() => {
      const botMsg = document.createElement('div');
      botMsg.className = 'msg msg-bot';

      if (text.toLowerCase().includes('baju') || text.toLowerCase().includes('size') || text.toLowerCase().includes('harga')) {
        botMsg.textContent = "Baju Gamis Syari Premium ready kak! Size L sisa 3 pcs warna Navy (Rp 185.000). Mau dicatat pesanannya?";
      } else if (text.toLowerCase().includes('buka') || text.toLowerCase().includes('alamat')) {
        botMsg.textContent = "Toko kami buka jam 09:00 - 21:00 WIB kak! Alamat lengkap di Jl. Riau No. 45 Bandung.";
      } else {
        botMsg.textContent = `Halo kak! Mengenai "${text}", KawanAI siap membantu mencatat pesanan Anda 24 jam nonstop.`;
      }

      simMessages.appendChild(botMsg);
      simMessages.scrollTop = simMessages.scrollHeight;
    }, 600);
  }

  if (simSend && simInput) {
    simSend.addEventListener('click', sendSimMessage);
    simInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendSimMessage();
    });
  }

  // 6. WhatsApp Scan Simulator
  const btnScanSim = document.getElementById('btn-scan-sim');
  if (btnScanSim) {
    btnScanSim.addEventListener('click', () => {
      alert('🟢 WhatsApp Karyawan AI Berhasil Terhubung ke Server!');
    });
  }
});
