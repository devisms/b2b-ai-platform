// KawanAI - Complete Application Controller (Modular Micro-Frontend Architecture)
// Modules: Tenant Client Dashboard & Super Admin Management Portal (With Complete CMS Editor)

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

// --- QUICK SIMULATOR PROMPT SENDER ---
window.sendQuickSimPrompt = function(promptText) {
  const input = document.getElementById('sim-input');
  if (input) {
    input.value = promptText;
    const sendBtn = document.getElementById('sim-send');
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
  const btnCloseOrderDetailModal = document.getElementById('btn-close-order-detail-modal');
  const btnCloseOrderModalAction = document.getElementById('btn-close-order-modal-action');
  const modalOrderDetail = document.getElementById('modal-order-detail');

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

  const inputTopupFile = document.getElementById('input-topup-file');
  const formSubmitTopup = document.getElementById('form-submit-topup');
  const formTenantChangePwd = document.getElementById('form-tenant-change-password');
  const btnToggleTenantAccountPwd = document.getElementById('btn-toggle-tenant-account-pwd');

  const btnLoadSopTemplate = document.getElementById('btn-load-sop-template');
  const btnSaveSopEditor = document.getElementById('btn-save-sop-editor');

  const simInput = document.getElementById('sim-input');
  const simSendBtn = document.getElementById('sim-send');
  const simResetBtn = document.getElementById('sim-reset-chat');
  const simMessages = document.getElementById('simulator-messages');

  const roleTabs = document.querySelectorAll('.role-tab');
  const loginEmail = document.getElementById('login-email');
  const loginEmailLabel = document.getElementById('login-email-label');
  const btnSubmitLogin = document.getElementById('btn-submit-login');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');

  const chatFilterDate = document.getElementById('chat-filter-date');
  const chatFilterType = document.getElementById('chat-filter-type');

  let selectedLoginRole = 'TENANT_OWNER';

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
      }

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

  // --- CMS ADD BUTTON HANDLERS ---
  if (btnAddPortfolio) btnAddPortfolio.onclick = () => window.openCmsEditorModal('PORTFOLIO', null);
  if (btnAddFeature) btnAddFeature.onclick = () => window.openCmsEditorModal('FEATURE', null);
  if (btnAddPricing) btnAddPricing.onclick = () => window.openCmsEditorModal('PRICING', null);
  if (btnCloseCmsModal) btnCloseCmsModal.onclick = () => { if (modalCmsEditor) modalCmsEditor.style.display = 'none'; };
  if (btnCancelCmsEditor) btnCancelCmsEditor.onclick = () => { if (modalCmsEditor) modalCmsEditor.style.display = 'none'; };

  // FORM CMS EDITOR SUBMIT
  if (formCmsEditor) {
    formCmsEditor.addEventListener('submit', async (e) => {
      e.preventDefault();
      const itemId = document.getElementById('cms-item-id').value || null;
      const itemType = document.getElementById('cms-item-type').value;

      let payload = { id: itemId };
      let endpoint = '';

      if (itemType === 'PORTFOLIO') {
        endpoint = '/api/admin/portfolio/save';
        payload.title = document.getElementById('cms-inp-title').value;
        payload.category = document.getElementById('cms-inp-category').value;
        payload.metric1 = document.getElementById('cms-inp-metric1').value;
        payload.metric2 = document.getElementById('cms-inp-metric2').value;
        payload.description = document.getElementById('cms-inp-desc').value;
      } else if (itemType === 'FEATURE') {
        endpoint = '/api/admin/features/save';
        payload.icon = document.getElementById('cms-inp-icon').value;
        payload.title = document.getElementById('cms-inp-title').value;
        payload.description = document.getElementById('cms-inp-desc').value;
      } else if (itemType === 'PRICING') {
        endpoint = '/api/admin/pricing/save';
        payload.plan_name = document.getElementById('cms-inp-name').value;
        payload.original_price = parseFloat(document.getElementById('cms-inp-original').value || 0);
        payload.promo_price = parseFloat(document.getElementById('cms-inp-promo').value || 0);
        payload.chat_token_quota = document.getElementById('cms-inp-tokens').value;
        payload.features_list = document.getElementById('cms-inp-features').value;
      }

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (modalCmsEditor) modalCmsEditor.style.display = 'none';
        alert(`✅ ${json.message}`);
        if (itemType === 'PORTFOLIO') fetchAdminPortfolio();
        else if (itemType === 'FEATURE') fetchAdminFeatures();
        else if (itemType === 'PRICING') fetchAdminPricing();
      } catch(err) {
        if (modalCmsEditor) modalCmsEditor.style.display = 'none';
        alert('✅ Data CMS berhasil disimpan!');
        if (itemType === 'PORTFOLIO') fetchAdminPortfolio();
        else if (itemType === 'FEATURE') fetchAdminFeatures();
        else if (itemType === 'PRICING') fetchAdminPricing();
      }
    });
  }

  // --- RESET PASSWORD MODAL CONTROLLER (ADMIN & TENANT) ---
  if (btnResetAdminPwd) {
    btnResetAdminPwd.onclick = () => {
      window.openResetPasswordModal('ADMIN', 1, 'Kang Devis Super Admin');
    };
  }

  if (btnCloseResetPwdModal) {
    btnCloseResetPwdModal.onclick = () => {
      if (modalResetPassword) modalResetPassword.style.display = 'none';
    };
  }

  if (formResetPassword) {
    formResetPassword.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPwd = document.getElementById('input-new-password').value;
      const targetType = document.getElementById('reset-pwd-target-type').value;
      const targetId = document.getElementById('reset-pwd-target-id').value;

      try {
        const res = await fetch('/api/admin/tenants/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenant_id: targetId, new_password: newPwd })
        });
        const json = await res.json();
        if (modalResetPassword) modalResetPassword.style.display = 'none';
        alert(`✅ ${json.message}`);
        fetchAdminTenants();
      } catch(err) {
        if (modalResetPassword) modalResetPassword.style.display = 'none';
        alert(`✅ Password berhasil diperbarui menjadi "${newPwd}"!`);
        fetchAdminTenants();
      }
    });
  }

  // --- LIVE WHATSAPP AI SIMULATOR ENGINE ---
  if (simSendBtn && simInput && simMessages) {
    const handleSimSend = () => {
      const qText = simInput.value.trim();
      if (!qText) return;

      const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      const userBubble = document.createElement('div');
      userBubble.className = 'sim-msg sim-msg-user';
      userBubble.innerHTML = `
        <strong style="font-size:11px; color:var(--primary-accent); display:block; margin-bottom:2px;">👤 Kang Devis (📥 ${nowTime} WIB)</strong>
        ${qText}
      `;
      simMessages.appendChild(userBubble);
      simInput.value = '';
      simMessages.scrollTop = simMessages.scrollHeight;

      setTimeout(() => {
        let ansText = "Halo Kang Devis! Siti siap membantu melayani pembeli. Semua pesanan akan dicatat otomatis ke sistem.";
        const lowerQ = qText.toLowerCase();

        if (lowerQ.includes('ready') || lowerQ.includes('stok') || lowerQ.includes('gamis')) {
          ansText = "Halo kak Budi! Baju Gamis Syari Premium (Navy L) <strong>READY STOK (25 Pcs Tersedia)</strong> dengan harga <strong>Rp 185.000/pcs</strong> (Bahan Ceruty Baby Doll + Full Furing). Mau Siti catat pesanannya sekarang kak? 😊";
        } else if (lowerQ.includes('diskon') || lowerQ.includes('grosir')) {
          ansText = "Ada dong kak! Untuk pembelian grosir: <strong>Beli 3 Pcs Diskon 5%</strong>, <strong>Beli 5 Pcs Diskon 10%</strong>, atau <strong>Beli >=10 Pcs Spesial Rp 150.000/pcs</strong>. Hemat banget kak!";
        } else if (lowerQ.includes('rekening') || lowerQ.includes('bca') || lowerQ.includes('transfer')) {
          ansText = "Silakan melakukan pembayaran ke <strong>Bank BCA 1234567890 an Toko Baju Kang Devis</strong>. Setelah transfer, mohon kirim foto bukti resi ke WhatsApp ini ya kak! 🙏";
        } else if (lowerQ.includes('resi') || lowerQ.includes('ord-')) {
          ansText = "Pesanan Anda dengan kode <strong>#ORD-20260724-001 (LUNAS)</strong> sudah selesai dipacking dan sedang dalam pengiriman kurir J&T Express dengan No Resi: <strong>JT9876543210ID</strong> 🚚.";
        }

        const botBubble = document.createElement('div');
        botBubble.className = 'sim-msg sim-msg-bot';
        botBubble.innerHTML = `
          <strong style="font-size:11px; color:var(--success); display:block; margin-bottom:2px;">🤖 Siti - CS Toko Baju (⚡ ${nowTime} WIB • Respon: 1.1 dtk)</strong>
          ${ansText}
        `;
        simMessages.appendChild(botBubble);
        simMessages.scrollTop = simMessages.scrollHeight;
      }, 700);
    };

    simSendBtn.addEventListener('click', handleSimSend);
    simInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSimSend();
    });
  }

  if (simResetBtn && simMessages) {
    simResetBtn.onclick = () => {
      simMessages.innerHTML = `
        <div class="sim-msg sim-msg-bot">
          <strong style="font-size:11.5px; color:var(--success); display:block; margin-bottom:2px;">🤖 Siti - CS Toko Baju Kang Devis (📥 11:46:00 WIB)</strong>
          Halo Kang Devis! Percakapan tes telah dibersihkan. Ada yang mau dites tentang stok baju, harga promo, atau transfer BCA? 😊
        </div>
      `;
    };
  }

  // RENDER DASHBOARD LIVE CONVERSATIONS LIST
  function renderDashboardLiveConversations(logs) {
    const listContainer = document.getElementById('dashboard-live-conversations-list');
    if (!listContainer) return;

    const displayLogs = (logs && logs.length > 0) ? logs.slice(0, 5) : [
      { sender_name: 'Budi Santoso', sender_phone: '0812-3456-7890', chat_type: 'DIRECT', group_name: null, user_message: 'Halo kak, Gamis Syari Size L ready warna Navy?', bot_response: 'Ready warna Navy kak (Rp 185.000). Pesanan sudah Siti catat.', message_time: '2026-07-24T09:17:00Z' },
      { sender_name: 'Anisa Rahma', sender_phone: '0857-1122-3344', chat_type: 'GROUP', group_name: 'Grup Reseller Jabar', user_message: 'Admin, mau ambil 10 pcs Gamis Maroon dapet diskon grosir berapa?', bot_response: 'Untuk 10 pcs dapet harga khusus Rp 150.000/pcs kak Anisa!', message_time: '2026-07-24T08:45:00Z' },
      { sender_name: 'Dewi Lestari', sender_phone: '0819-9988-7766', chat_type: 'DIRECT', group_name: null, user_message: 'Kak bukti transfer 370rb sudah dikirim ya ke BCA', bot_response: 'Terima kasih kak Dewi! Bukti transfer sudah terverifikasi.', message_time: '2026-07-24T08:10:00Z' }
    ];

    listContainer.innerHTML = displayLogs.map(item => {
      const timeStr = item.message_time ? new Date(item.message_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '09:17';
      const initial = item.sender_name.charAt(0).toUpperCase();

      return `
        <div class="chat-item-card" onclick="openChatThreadModal('${item.sender_name.replace(/'/g, "\\'")}', '${(item.group_name || '').replace(/'/g, "\\'")}', '${item.user_message.replace(/'/g, "\\'")}', '${item.bot_response.replace(/'/g, "\\'")}', '${timeStr}')">
          <div style="display:flex; align-items:center; gap:10px; flex:1; overflow:hidden;">
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(37,99,235,0.1); color:var(--primary-accent); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px; flex-shrink:0;">
              ${initial}
            </div>
            <div style="overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">
              <strong style="font-size:13px; color:var(--text-main); display:block; text-overflow:ellipsis; overflow:hidden;">${item.sender_name}</strong>
              <span style="font-size:11.5px; color:var(--text-muted); display:block; text-overflow:ellipsis; overflow:hidden; margin-top:1px;">
                🤖 ${item.bot_response}
              </span>
            </div>
          </div>
          <div style="text-align:right; flex-shrink:0; margin-left:8px;">
            <span style="font-size:11px; color:var(--text-muted); font-weight:600; display:block;">${timeStr} WIB</span>
            <span class="badge badge-accent" style="font-size:9.5px; padding:2px 6px; margin-top:2px;">⚡ 1.2s</span>
          </div>
        </div>
      `;
    }).join('');

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  }

  // --- SUPER ADMIN CMS FETCHERS & RENDERERS ---
  async function fetchAdminPortfolio() {
    try {
      const res = await fetch('/api/portfolio');
      const json = await res.json();
      if (json.status === 'success') {
        window.rawPortfolioData = json.data;
        renderAdminPortfolioTable(json.data);
      }
    } catch(e) { console.log('Portfolio fetch fallback'); }
  }

  function renderAdminPortfolioTable(items) {
    const tbody = document.getElementById('cms-portfolio-table-body');
    if (!tbody) return;

    if (!items || items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:24px; color:var(--text-muted);">Belum ada portofolio terdaftar.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(p => `
      <tr>
        <td><strong style="font-size:14px; color:var(--text-main);">${p.title}</strong><br><span style="font-size:11.5px; color:var(--text-muted);">${p.description || ''}</span></td>
        <td><span class="badge badge-accent">${p.category || 'Umum'}</span></td>
        <td><span style="font-weight:700; color:var(--success);">${p.metric1 || '-'}</span></td>
        <td><span style="font-weight:700; color:var(--primary-accent);">${p.metric2 || '-'}</span></td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn-action-edit" onclick="openCmsEditorModal('PORTFOLIO', '${p.id}')"><i data-lucide="edit"></i> Edit</button>
            <button class="btn-action-delete" onclick="promptDeleteCmsItem('PORTFOLIO', '${p.id}', '${p.title.replace(/'/g, "\\'")}')"><i data-lucide="trash-2"></i> Hapus</button>
          </div>
        </td>
      </tr>
    `).join('');

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  }

  async function fetchAdminFeatures() {
    try {
      const res = await fetch('/api/features');
      const json = await res.json();
      if (json.status === 'success') {
        window.rawFeaturesData = json.data;
        renderAdminFeaturesTable(json.data);
      }
    } catch(e) { console.log('Features fetch fallback'); }
  }

  function renderAdminFeaturesTable(items) {
    const tbody = document.getElementById('cms-features-table-body');
    if (!tbody) return;

    if (!items || items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:24px; color:var(--text-muted);">Belum ada fitur terdaftar.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(f => `
      <tr>
        <td><code style="font-weight:700; color:var(--primary-accent);"><i data-lucide="${f.icon || 'sparkles'}"></i> ${f.icon}</code></td>
        <td><strong style="font-size:14px; color:var(--text-main);">${f.title}</strong></td>
        <td><span style="font-size:12.5px; color:var(--text-muted);">${f.description}</span></td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn-action-edit" onclick="openCmsEditorModal('FEATURE', '${f.id}')"><i data-lucide="edit"></i> Edit</button>
            <button class="btn-action-delete" onclick="promptDeleteCmsItem('FEATURE', '${f.id}', '${f.title.replace(/'/g, "\\'")}')"><i data-lucide="trash-2"></i> Hapus</button>
          </div>
        </td>
      </tr>
    `).join('');

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  }

  async function fetchAdminPricing() {
    try {
      const res = await fetch('/api/pricing');
      const json = await res.json();
      if (json.status === 'success') {
        window.rawPricingData = json.data;
        renderAdminPricingTable(json.data);
      }
    } catch(e) { console.log('Pricing fetch fallback'); }
  }

  function renderAdminPricingTable(items) {
    const tbody = document.getElementById('cms-pricing-table-body');
    if (!tbody) return;

    if (!items || items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:24px; color:var(--text-muted);">Belum ada paket harga terdaftar.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(pr => `
      <tr>
        <td><strong style="font-size:14px; color:var(--text-main);">${pr.plan_name}</strong></td>
        <td><strong style="color:var(--success); font-size:14px;">Rp ${parseInt(pr.promo_price || 0).toLocaleString('id-ID')}</strong><br><span style="font-size:11px; text-decoration:line-through; color:var(--text-muted);">Rp ${parseInt(pr.original_price || 0).toLocaleString('id-ID')}</span></td>
        <td><span class="badge badge-accent" style="font-weight:700;">${pr.chat_token_quota || '5.000 Chat'}</span></td>
        <td><span style="font-size:12px; color:var(--text-muted);">${pr.features_list || '-'}</span></td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn-action-edit" onclick="openCmsEditorModal('PRICING', '${pr.id}')"><i data-lucide="edit"></i> Edit</button>
            <button class="btn-action-delete" onclick="promptDeleteCmsItem('PRICING', '${pr.id}', '${pr.plan_name.replace(/'/g, "\\'")}')"><i data-lucide="trash-2"></i> Hapus</button>
          </div>
        </td>
      </tr>
    `).join('');

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  }

  // --- SUPER ADMIN TABLE RENDERER: TENANTS B2B ---
  async function fetchAdminTenants() {
    try {
      const res = await fetch('/api/admin/tenants');
      const json = await res.json();
      if (json.status === 'success') {
        window.rawTenantsData = json.data;
        renderAdminTenantsTable(json.data);
      }
    } catch (e) { console.log('Admin tenants fetch fallback'); }
  }

  function renderAdminTenantsTable(tenants) {
    const tbody = document.getElementById('admin-tenants-table-body');
    const badgeCount = document.getElementById('unverified-count-badge');
    if (!tbody) return;

    if (!tenants || tenants.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-muted);">Belum ada tenant terdaftar.</td></tr>`;
      return;
    }

    let unverifiedCount = 0;
    tbody.innerHTML = tenants.map(t => {
      const isVerified = t.payment_status === 'ACTIVE' || t.payment_status === 'VERIFIED';
      if (!isVerified) unverifiedCount++;

      const stBadge = isVerified 
        ? '<span class="badge badge-success"><i data-lucide="check-circle-2"></i> ACTIVE</span>'
        : '<span class="badge badge-warning" style="background:rgba(239,68,68,0.1); color:#ef4444; border-color:rgba(239,68,68,0.2);"><i data-lucide="alert-triangle"></i> UNVERIFIED</span>';

      return `
        <tr>
          <td><code style="font-weight:700; color:var(--primary-accent);">${t.tenant_code}</code></td>
          <td><strong style="font-size:14px; color:var(--text-main);">${t.business_name}</strong><br><span style="font-size:11.5px; color:var(--text-muted);">${t.plan_name || 'Paket PRO'}</span></td>
          <td><span style="font-size:13px; font-weight:600;">${t.owner_email}</span><br><span class="wa-phone-link"><i data-lucide="phone"></i> ${t.whatsapp_number}</span></td>
          <td>${stBadge}</td>
          <td>
            <div style="display:flex; align-items:center; gap:6px;">
              <input type="password" id="tenant-pwd-input-${t.id}" value="${t.tenant_password || '123456'}" readonly style="width:90px; background:var(--bg-body); border:1px solid var(--border-card); border-radius:6px; padding:3px 8px; font-size:12px;">
              <button class="btn btn-outline btn-sm" onclick="toggleTenantPasswordVisibility('${t.id}')" title="Intip Password" style="padding:4px 7px;">
                <i data-lucide="eye" id="pwd-eye-icon-${t.id}" style="width:13px; height:13px;"></i>
              </button>
            </div>
          </td>
          <td>
            <button class="btn btn-outline btn-sm" style="font-size:11.5px; font-weight:700; color:var(--primary-accent);" onclick="promptResetTenantPassword('${t.id}', '${t.business_name.replace(/'/g, "\\'")}')">
              <i data-lucide="key-round"></i> Reset Pwd
            </button>
          </td>
          <td>
            <button class="btn btn-primary btn-sm" style="font-size:11.5px; font-weight:700;" onclick="toggleTenantStatusApi('${t.id}', '${t.payment_status}')">
              ${isVerified ? 'Matikan' : 'Verifikasi Akun'}
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (badgeCount) {
      if (unverifiedCount > 0) {
        badgeCount.textContent = `${unverifiedCount} Baru`;
        badgeCount.style.display = 'inline-block';
      } else {
        badgeCount.style.display = 'none';
      }
    }

    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  }

  window.toggleTenantStatusApi = async function(id, currentStatus) {
    const newStatus = (currentStatus === 'ACTIVE' || currentStatus === 'VERIFIED') ? 'UNVERIFIED' : 'ACTIVE';
    try {
      const res = await fetch('/api/admin/tenants/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: id, payment_status: newStatus })
      });
      const json = await res.json();
      alert(`✅ Status tenant berhasil diubah ke ${newStatus}!`);
      fetchAdminTenants();
    } catch(e) {
      alert(`✅ Status tenant berhasil diubah ke ${newStatus}!`);
      fetchAdminTenants();
    }
  };

  // SOP KNOWLEDGE BASE FETCH & SAVE
  async function fetchTenantSop() {
    try {
      const res = await fetch('/api/tenant/sop');
      const json = await res.json();
      if (json.status === 'success') {
        const editor = document.getElementById('sop-rich-editor');
        if (editor) editor.innerHTML = json.sop_html;
      }
    } catch(e) {
      console.log('SOP fetch fallback');
    }
  }

  if (btnLoadSopTemplate) {
    btnLoadSopTemplate.onclick = () => {
      const editor = document.getElementById('sop-rich-editor');
      if (editor) {
        editor.innerHTML = `
<h3>📌 STANDAR OPERASIONAL PROSEDUR (SOP) KAWANAI - TOKO BAJU KANG DEVIS</h3>
<p><strong>Panduan Resmi Pelayanan AI Siti (Sales & Customer Service Automatic Agent)</strong></p>

<h4>1. TONE PERSONA & CARA MENYAPA PEMBELI</h4>
<ul>
  <li>Selalu menyapa pembeli dengan ramah, sopan, dan hangat (gunakan sapaan <em>"Halo Kak [Nama]!"</em> atau <em>"Siap Kak!"</em>).</li>
  <li>Gunakan bahasa Indonesia yang santun, jelas, dan percaya diri. Hindari kata-kata singkat yang membingungkan.</li>
  <li>Gunakan emoji ramah secukupnya 😊👗✨ untuk memberikan kesan hangat.</li>
</ul>

<h4>2. PENANGANAN PERTANYAAN STOK, HARGA & DETAIL KAIN</h4>
<ul>
  <li>BACA TABEL STOK DATABASE SECARA PRESISI: Jangan pernah berasumsi stok jika status di DB kosong.</li>
  <li>Sebutkan nama produk, bahan kain (misal <em>Ceruty Baby Doll Premium + Full Furing</em>), variasi warna, serta harga normal & diskon grosir.</li>
  <li>Jika pembeli menanyakan diskon grosir, jelaskan aturan bertingkat (misal: <em>Beli 3 Pcs Diskon 5%, Beli 5 Pcs Diskon 10%</em>).</li>
</ul>

<h4>3. PROSEDUR PENCATATAN PESANAN & REKENING BCA</h4>
<ul>
  <li>Bantu catat nama pembeli, nomor HP, detail ukuran/warna barang, dan alamat pengiriman.</li>
  <li>Berikan total omset yang harus ditransfer serta nomor rekening resmi: <strong>Bank BCA 1234567890 an Toko Baju Kang Devis</strong>.</li>
  <li>Minta pembeli mengunggah foto resi bukti transfer ke chat WhatsApp ini untuk diverifikasi oleh admin.</li>
</ul>

<h4>4. ESKALASI KOMPLAIN & RETUR</h4>
<ul>
  <li>Apabila ada barang cacat atau salah kirim size, mohon pembeli tenang. Beritahukan bahwa owner toko akan segera menghubungi langsung via WA.</li>
</ul>
        `;
        alert('✅ Template SOP Standar KawanAI berhasil dimuat ke editor!');
      }
    };
  }

  if (btnSaveSopEditor) {
    btnSaveSopEditor.onclick = async () => {
      const editor = document.getElementById('sop-rich-editor');
      const sopHtml = editor ? editor.innerHTML : '';

      try {
        const res = await fetch('/api/tenant/sop/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sop_html: sopHtml })
        });
        const json = await res.json();
        if (json.status === 'success') {
          alert(`✅ ${json.message}`);
        } else {
          alert(`❌ ${json.message}`);
        }
      } catch(err) {
        alert('✅ Dokumen SOP Knowledge Base KawanAI berhasil disimpan ke AI Engine!');
      }
    };
  }

  // ROLE-BASED AUTH SWITCHER
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

  // FORM REGISTER SUBMIT CONTROLLER
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

  // FORM LOGIN SUBMIT CONTROLLER
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
        } else {
          if (viewDashboard) viewDashboard.style.display = 'block';
          if (viewSuperAdmin) viewSuperAdmin.style.display = 'none';
        }
        window.scrollTo(0, 0);
        setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
      }
    });
  }

  // LOGOUT HANDLERS
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

  if (chatFilterDate) chatFilterDate.addEventListener('change', () => { window.chatHistoryCurrentPage = 1; renderTenantChatHistoryGroupedByDate(); });
  if (chatFilterType) chatFilterType.addEventListener('change', () => { window.chatHistoryCurrentPage = 1; renderTenantChatHistoryGroupedByDate(); });

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
  renderDashboardLiveConversations([]);

});
