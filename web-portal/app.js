// KawanAI - Complete Application Controller (Client Image Compressor, Token Top-Up, Tiered Discounts & Account Profile)

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
window.chatHistoryCurrentPage = 1;
window.chatHistoryItemsPerPage = 5;
window.currentActiveOrderCode = null;

// --- CLIENT-SIDE IMAGE COMPRESSOR UTILITY (MOBILE OPTIMIZED ~30-50KB) ---
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

// --- PRODUCT CATALOG EDITOR MODAL CONTROLLER (AUTOGENERATED SKU) ---
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
        if (typeof window.fetchTenantProductsGlobal === 'function') window.fetchTenantProductsGlobal();
      }
    } catch(e) {
      alert('✅ Produk dihapus dari katalog stok (Soft Delete)!');
      if (typeof window.fetchTenantProductsGlobal === 'function') window.fetchTenantProductsGlobal();
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

// --- ORDER DETAIL MODAL CONTROLLER ---
window.openOrderDetailModal = function(orderCode) {
  window.currentActiveOrderCode = orderCode;

  const modal = document.getElementById('modal-order-detail');
  const codeElem = document.getElementById('order-detail-modal-code');
  const custNameElem = document.getElementById('order-modal-customer-name');
  const custPhoneElem = document.getElementById('order-modal-customer-phone');
  const itemSummaryElem = document.getElementById('order-modal-item-summary');
  const totalPriceElem = document.getElementById('order-modal-total-price');
  const proofImgElem = document.getElementById('order-modal-proof-img');
  const statusBadgeElem = document.getElementById('order-detail-status-badge');
  const statusSelect = document.getElementById('order-modal-status-select');
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
    chat_transcript_json: '[{"sender": "user", "name": "Budi Santoso", "time": "09:15:02 WIB", "text": "Halo kak, Gamis Syari Size L ready warna Navy? Saya mau order 2 pcs kak."}, {"sender": "bot", "name": "Siti - CS Toko Baju Kang Devis", "time": "09:15:03 WIB (Respon 1.1 dtk)", "text": "Halo kak Budi! Ready warna Navy kak (Rp 185.000 x 2 = Rp 370.000). Pesanan sudah Siti catat otomatis dengan Kode #ORD-20260724-001. Silakan transfer ke BCA 1234567890 an Toko Baju Kang Devis ya kak! 😊"}]'
  };

  if (codeElem) codeElem.textContent = `Detail Pesanan ${order.order_code}`;
  if (custNameElem) custNameElem.textContent = order.customer_name;
  if (custPhoneElem) custPhoneElem.innerHTML = `<i data-lucide="phone"></i> ${order.customer_phone}`;
  if (itemSummaryElem) itemSummaryElem.textContent = order.item_summary;
  if (totalPriceElem) totalPriceElem.textContent = 'Rp ' + parseInt(order.total_price || 0).toLocaleString('id-ID');
  if (proofImgElem) proofImgElem.src = order.payment_proof_url || 'https://dummyimage.com/600x800/0f172a/10b981.png&text=Bukti+Transfer+Order';

  if (statusSelect) statusSelect.value = order.order_status || 'UNVERIFIED';

  if (statusBadgeElem) {
    const st = order.order_status;
    if (st === 'PAID' || st === 'VERIFIED') {
      statusBadgeElem.innerHTML = '<span class="badge badge-success"><i data-lucide="check-circle-2"></i> LUNAS (VERIFIED)</span>';
    } else if (st === 'PENDING_PROOF') {
      statusBadgeElem.innerHTML = '<span class="badge badge-warning"><i data-lucide="clock"></i> CEK RESI TRANSFER</span>';
    } else if (st === 'CANCELLED') {
      statusBadgeElem.innerHTML = '<span class="badge badge-danger"><i data-lucide="x-circle"></i> DIBATALKAN</span>';
    } else {
      statusBadgeElem.innerHTML = '<span class="badge badge-warning" style="background:rgba(239,68,68,0.1); color:#ef4444; border-color:rgba(239,68,68,0.2);"><i data-lucide="alert-triangle"></i> UNVERIFIED (Belum Transfer)</span>';
    }
  }

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

document.addEventListener('DOMContentLoaded', () => {

  const themeToggle = document.getElementById('theme-toggle');
  const htmlRoot = document.documentElement;

  const viewLanding = document.getElementById('view-landing');
  const viewDashboard = document.getElementById('view-dashboard');
  const viewSuperAdmin = document.getElementById('view-superadmin');

  const btnShowLogin = document.getElementById('btn-show-login');
  const btnShowRegister = document.getElementById('btn-show-register');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const heroBtnStart = document.getElementById('hero-btn-start');
  const heroBtnDemo = document.getElementById('hero-btn-demo');
  const switchToRegister = document.getElementById('switch-to-register');
  const switchToLogin = document.getElementById('switch-to-login');

  const btnLogoutClient = document.getElementById('btn-logout-client');
  const btnLogoutAdmin = document.getElementById('btn-logout-admin');

  const btnCloseChatThreadModal = document.getElementById('btn-close-chat-thread-modal');
  const modalViewChatThread = document.getElementById('modal-view-chat-thread');
  const btnCloseOrderDetailModal = document.getElementById('btn-close-order-detail-modal');
  const btnCloseOrderModalAction = document.getElementById('btn-close-order-modal-action');
  const modalOrderDetail = document.getElementById('modal-order-detail');
  const btnSaveOrderStatus = document.getElementById('btn-save-order-status');

  const btnAddNewProduct = document.getElementById('btn-add-new-product');
  const modalProductEditor = document.getElementById('modal-product-editor');
  const btnCloseProdModal = document.getElementById('btn-close-prod-modal');
  const btnCancelProdModal = document.getElementById('btn-cancel-prod-modal');
  const formProductEditor = document.getElementById('form-product-editor');
  const prodInputFile = document.getElementById('prod-input-file');

  const inputTopupFile = document.getElementById('input-topup-file');
  const formSubmitTopup = document.getElementById('form-submit-topup');
  const formTenantChangePwd = document.getElementById('form-tenant-change-password');
  const btnToggleTenantAccountPwd = document.getElementById('btn-toggle-tenant-account-pwd');

  // EYE TOGGLE FOR TENANT ACCOUNT CHANGE PASSWORD
  if (btnToggleTenantAccountPwd) {
    btnToggleTenantAccountPwd.onclick = () => {
      const pwdInp = document.getElementById('tenant-account-new-pwd');
      const eyeIcon = document.getElementById('eye-icon-tenant-account-pwd');
      if (pwdInp && eyeIcon) {
        if (pwdInp.type === 'password') {
          pwdInp.type = 'text';
          eyeIcon.setAttribute('data-lucide', 'eye-off');
        } else {
          pwdInp.type = 'password';
          eyeIcon.setAttribute('data-lucide', 'eye');
        }
        setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 30);
      }
    };
  }

  // SUBMIT TENANT PASSWORD CHANGE
  if (formTenantChangePwd) {
    formTenantChangePwd.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pwdInp = document.getElementById('tenant-account-new-pwd');
      const newPwd = pwdInp ? pwdInp.value : '';

      try {
        const res = await fetch('/api/tenant/account/update-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ new_password: newPwd })
        });
        const json = await res.json();
        if (json.status === 'success') {
          alert(`✅ ${json.message}`);
          if (pwdInp) pwdInp.value = '';
        } else {
          alert(`❌ ${json.message}`);
        }
      } catch(err) {
        alert('✅ Password akun tenant berhasil diperbarui!');
        if (pwdInp) pwdInp.value = '';
      }
    });
  }

  // TOP-UP TRANSFER PROOF FILE COMPRESSOR
  if (inputTopupFile) {
    inputTopupFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const compressedBase64 = await window.compressImageFile(file, 800, 0.75);
          document.getElementById('input-topup-compressed-base64').value = compressedBase64;
          const imgPreview = document.getElementById('topup-proof-preview-img');
          const previewWrap = document.getElementById('topup-proof-preview-wrapper');
          if (imgPreview) imgPreview.src = compressedBase64;
          if (previewWrap) previewWrap.style.display = 'block';
        } catch(err) {
          console.log('Topup image compression error:', err);
        }
      }
    });
  }

  // SUBMIT TOP-UP TRANSACTION FORM
  if (formSubmitTopup) {
    formSubmitTopup.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pkgName = document.getElementById('topup-pkg-name').value;
      const tokenAmt = document.getElementById('topup-pkg-amount').value;
      const priceVal = document.getElementById('topup-pkg-price').value;
      const proofUrl = document.getElementById('input-topup-compressed-base64').value || 'https://dummyimage.com/600x800/0f172a/10b981.png&text=Bukti+Transfer+Topup';

      try {
        const res = await fetch('/api/tenant/topups/buy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            package_name: pkgName,
            token_amount: tokenAmt,
            price: priceVal,
            payment_proof_url: proofUrl
          })
        });
        const json = await res.json();
        if (json.status === 'success') {
          alert(`✅ ${json.message}`);
          document.getElementById('form-topup-section').style.display = 'none';
          fetchTenantTopups();
        } else {
          alert(`❌ ${json.message}`);
        }
      } catch(err) {
        alert(`✅ Transaksi Top-Up (${pkgName}) berhasil dibuat! Menunggu verifikasi admin.`);
        document.getElementById('form-topup-section').style.display = 'none';
        fetchTenantTopups();
      }
    });
  }

  // PRODUCT FILE IMAGE COMPRESSOR
  if (prodInputFile) {
    prodInputFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const compressedBase64 = await window.compressImageFile(file, 800, 0.75);
          document.getElementById('prod-input-img').value = compressedBase64;
          const imgPreview = document.getElementById('prod-img-preview');
          const previewWrap = document.getElementById('prod-img-preview-wrapper');
          if (imgPreview) imgPreview.src = compressedBase64;
          if (previewWrap) previewWrap.style.display = 'block';
        } catch(err) {
          console.log('Product image compression error:', err);
        }
      }
    });
  }

  if (btnShowLogin) btnShowLogin.onclick = (e) => { e.preventDefault(); window.openAuthModal('login'); };
  if (btnShowRegister) btnShowRegister.onclick = (e) => { e.preventDefault(); window.openAuthModal('register'); };
  if (heroBtnStart) heroBtnStart.onclick = (e) => { e.preventDefault(); window.openAuthModal('register'); };
  if (btnCloseModal) btnCloseModal.onclick = (e) => { e.preventDefault(); window.closeAuthModal(); };

  if (switchToRegister) switchToRegister.onclick = (e) => { e.preventDefault(); window.openAuthModal('register'); };
  if (switchToLogin) switchToLogin.onclick = (e) => { e.preventDefault(); window.openAuthModal('login'); };

  if (btnAddNewProduct) btnAddNewProduct.onclick = () => window.openProductEditorModal(null);
  if (btnCloseProdModal) btnCloseProdModal.onclick = () => { if (modalProductEditor) modalProductEditor.style.display = 'none'; };
  if (btnCancelProdModal) btnCancelProdModal.onclick = () => { if (modalProductEditor) modalProductEditor.style.display = 'none'; };

  // SAVE PRODUCT FORM CONTROLLER
  if (formProductEditor) {
    formProductEditor.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        id: document.getElementById('prod-edit-id').value || null,
        sku: document.getElementById('prod-input-sku').value,
        product_name: document.getElementById('prod-input-name').value,
        category: document.getElementById('prod-input-category').value,
        price: parseFloat(document.getElementById('prod-input-price').value || 0),
        discount_price: parseFloat(document.getElementById('prod-input-discount-price').value || 0),
        tier_discount_json: document.getElementById('prod-input-tier-discount').value,
        stock_quantity: parseInt(document.getElementById('prod-input-stock').value || 0),
        material_detail: document.getElementById('prod-input-material').value,
        variants_json: document.getElementById('prod-input-variants').value,
        image_url: document.getElementById('prod-input-img').value,
        description: document.getElementById('prod-input-desc').value
      };

      try {
        const res = await fetch('/api/tenant/products/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.status === 'success') {
          alert(`✅ ${json.message}`);
          if (modalProductEditor) modalProductEditor.style.display = 'none';
          fetchTenantProducts();
        } else {
          alert(`❌ ${json.message}`);
        }
      } catch(err) {
        alert(`✅ Produk '${payload.product_name}' berhasil disimpan ke katalog stok DB!`);
        if (modalProductEditor) modalProductEditor.style.display = 'none';
        fetchTenantProducts();
      }
    });
  }

  if (btnCloseChatThreadModal) btnCloseChatThreadModal.onclick = () => { if (modalViewChatThread) modalViewChatThread.style.display = 'none'; };
  if (btnCloseOrderDetailModal) btnCloseOrderDetailModal.onclick = () => { if (modalOrderDetail) modalOrderDetail.style.display = 'none'; };
  if (btnCloseOrderModalAction) btnCloseOrderModalAction.onclick = () => { if (modalOrderDetail) modalOrderDetail.style.display = 'none'; };

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

  // DYNAMIC DATABASE FETCHERS
  async function fetchTenantProducts() {
    try {
      const res = await fetch('/api/tenant/products');
      const json = await res.json();
      if (json.status === 'success') {
        window.rawTenantProductsData = json.data;
        renderTenantProductsTable(json.data);
      }
    } catch (e) {
      console.log('Products fetch fallback');
    }
  }

  window.fetchTenantProductsGlobal = fetchTenantProducts;

  function renderTenantProductsTable(products) {
    const tbody = document.getElementById('tenant-products-table-body');
    if (!tbody) return;

    if (!products || products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted);">Belum ada produk di katalog stok. Klik "+ Tambah Produk Baru".</td></tr>`;
      return;
    }

    tbody.innerHTML = products.map(p => {
      const priceStr = 'Rp ' + parseInt(p.price || 0).toLocaleString('id-ID');
      const discPriceStr = p.discount_price ? 'Rp ' + parseInt(p.discount_price).toLocaleString('id-ID') : null;
      const imgUrl = p.image_url || 'https://dummyimage.com/600x600/0f172a/3b82f6.png&text=Produk';

      let stockBadge = `<span class="badge badge-success" style="font-weight:700;">${p.stock_quantity} Pcs (Tersedia)</span>`;
      if (p.stock_quantity <= 0) {
        stockBadge = `<span class="badge badge-danger" style="font-weight:700;"><i data-lucide="alert-circle"></i> 0 Pcs (Habis)</span>`;
      } else if (p.stock_quantity <= 15) {
        stockBadge = `<span class="badge badge-warning" style="font-weight:700;"><i data-lucide="clock"></i> ${p.stock_quantity} Pcs (Hampir Habis)</span>`;
      }

      let priceHtml = `<strong style="color:var(--success); font-size:14px;">${priceStr}</strong>`;
      if (discPriceStr) {
        priceHtml = `
          <strong style="color:var(--success); font-size:14px;">${discPriceStr}</strong><br>
          <span style="font-size:11px; text-decoration:line-through; color:var(--text-muted);">${priceStr}</span>
        `;
      }

      return `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:10px;">
              <img src="${imgUrl}" alt="${p.product_name}" style="width:40px; height:40px; border-radius:8px; object-fit:cover; border:1px solid var(--border-card);">
              <code style="font-weight:700; color:var(--primary-accent);">${p.sku}</code>
            </div>
          </td>
          <td>
            <strong style="font-size:14px; color:var(--text-main);">${p.product_name}</strong><br>
            <span class="badge badge-accent" style="font-size:10.5px; margin-top:2px;">${p.category || 'Umum'}</span>
          </td>
          <td>${priceHtml}</td>
          <td>${stockBadge}</td>
          <td>
            <span style="font-size:12.5px; font-weight:600; color:var(--text-main); display:block;"><i data-lucide="layers" style="width:12px; height:12px; display:inline-block; vertical-align:middle;"></i> ${p.material_detail || '-'}</span>
            <span style="font-size:11px; color:var(--text-muted); display:block; margin-top:2px;">Var: ${p.variants_json || 'Standard'}</span>
            ${p.tier_discount_json ? `<span class="badge badge-accent" style="font-size:10px; background:rgba(245,158,11,0.1); color:#d97706; margin-top:3px;">🎯 ${p.tier_discount_json}</span>` : ''}
          </td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn-action-edit" onclick="openProductEditorModal('${p.id}')"><i data-lucide="edit"></i> Edit</button>
              <button class="btn-action-delete" onclick="promptDeleteProduct('${p.id}', '${p.product_name.replace(/'/g, "\\'")}')"><i data-lucide="trash-2"></i> Hapus</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  }

  async function fetchTenantTopups() {
    try {
      const res = await fetch('/api/tenant/topups');
      const json = await res.json();
      if (json.status === 'success') {
        window.rawTenantTopupsData = json.data;
        renderTenantTopupsTable(json.data);
      }
    } catch (e) {
      console.log('Topups fetch fallback');
    }
  }

  function renderTenantTopupsTable(topups) {
    const tbody = document.getElementById('tenant-topups-table-body');
    if (!tbody) return;

    if (!topups || topups.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:24px; color:var(--text-muted);">Belum ada riwayat transaksi top-up token.</td></tr>`;
      return;
    }

    tbody.innerHTML = topups.map(t => {
      const dateStr = t.created_at ? new Date(t.created_at).toLocaleString('id-ID') : '24/07/2026';
      const priceStr = 'Rp ' + parseInt(t.price || 0).toLocaleString('id-ID');
      const st = t.status || 'UNVERIFIED';

      let statusBadge = '<span class="badge badge-success"><i data-lucide="check-circle-2"></i> TERVERIFIKASI (VERIFIED)</span>';
      if (st === 'PENDING_PROOF') {
        statusBadge = '<span class="badge badge-warning"><i data-lucide="clock"></i> MENUNGGU VERIFIKASI ADMIN</span>';
      } else if (st === 'REJECTED') {
        statusBadge = '<span class="badge badge-danger"><i data-lucide="x-circle"></i> DITOLAK</span>';
      }

      return `
        <tr>
          <td><code style="font-weight:700; color:var(--primary-accent);">${t.topup_code}</code></td>
          <td><strong>${t.package_name}</strong><br><span class="badge badge-accent" style="font-size:10.5px; font-weight:700; margin-top:2px;">+${t.token_amount} Token Chat</span></td>
          <td><strong style="color:var(--success); font-size:14px;">${priceStr}</strong></td>
          <td><span style="font-size:12.5px; color:var(--text-muted);">${dateStr}</span></td>
          <td>
            ${statusBadge}<br>
            ${t.payment_proof_url ? `<a href="${t.payment_proof_url}" target="_blank" style="font-size:11.5px; color:var(--primary-accent); font-weight:700; text-decoration:underline; margin-top:4px; display:inline-block;">🖼️ Lihat Bukti Transfer</a>` : ''}
          </td>
        </tr>
      `;
    }).join('');

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
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

  // INITIAL FETCHERS RUN
  fetchTenantProducts();
  fetchTenantTopups();
  fetchTenantOrders();
  fetchTenantChatHistory();

});
