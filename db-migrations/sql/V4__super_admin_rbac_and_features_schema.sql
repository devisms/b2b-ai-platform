-- ============================================================================
-- V4__super_admin_rbac_and_features_schema.sql
-- Flyway Migration V4: Super Admin Portal, RBAC Users & Dynamic Feature Items
-- ============================================================================

-- 1. ADD FEATURE_ITEMS TABLE TO CMS_SERVICE
CREATE TABLE IF NOT EXISTS cms_service.feature_items (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    icon_name VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    display_order INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ADD USERS TABLE FOR ROLE-BASED AUTH (SUPER ADMIN vs TENANT OWNER)
CREATE TABLE IF NOT EXISTS tenant_service.users (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    tenant_id UUID REFERENCES tenant_service.tenants(id) ON DELETE CASCADE, -- NULL jika Super Admin!
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(30),
    role VARCHAR(30) NOT NULL DEFAULT 'TENANT_OWNER' CHECK (role IN ('SUPER_ADMIN', 'TENANT_OWNER', 'TENANT_STAFF')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SEED SUPER ADMIN USER UNTUK KANG DEVIS
INSERT INTO tenant_service.users (id, tenant_id, email, password_hash, full_name, phone_number, role)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    NULL, -- Super Admin tidak terikat 1 tenant!
    'admin@kawanai.id',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', -- default password
    'Kang Devis (Super Admin)',
    '081234567890',
    'SUPER_ADMIN'
) ON CONFLICT (email) DO NOTHING;

-- SEED TENANT OWNER USER UNTUK CLIENT TOKO BAJU KANG DEVIS
INSERT INTO tenant_service.users (id, tenant_id, email, password_hash, full_name, phone_number, role)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '90219021-9021-9021-9021-902190219021', -- Linked to Toko Baju Tenant
    'devis@kawanai.id',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW',
    'Kang Devis (Owner Toko Baju)',
    '081234567890',
    'TENANT_OWNER'
) ON CONFLICT (email) DO NOTHING;

-- SEED INITIAL DATA: DYNAMIC FEATURE ITEMS
INSERT INTO cms_service.feature_items (icon_name, title, description, display_order)
VALUES
('message-square-code', 'WhatsApp AI Automation 24/7', 'Agen AI membalas pesan pelanggan secara otomatis 24 jam nonstop dengan bahasa alami yang ramah, persuasif, dan manusiawi.', 1),
('file-spreadsheet', 'Multi-Tenant Document RAG (Anything LLM)', 'Cukup upload file PDF Katalog, Daftar Harga, atau SOP Toko. Karyawan AI langsung pintar menjawab detail produk dari dokumen Anda.', 2),
('user-cog', 'Kustomisasi Persona & Gaya Bicara', 'Atur nama agen, nada bicara (Casual Kak/Sis atau Formal Bapak/Ibu), hingga instruksi khusus sesuai brand identity toko Anda.', 3),
('shield-check', 'Sistem Keamanan Anti-Ban WhatsApp', 'Dilengkapi dengan rate-limiter dan simulasi jeda mengetik manusia agar nomor WhatsApp bisnis Anda aman dari blokir Meta.', 4),
('bar-chart-3', 'Analitik Percakapan & Rekap Order', 'Pantau berapa banyak chat yang dijawab, waktu respon rata-rata, dan rekapitulasi pesanan harian secara real-time di dashboard.', 5),
('qr-code', '1-Klik QR Code WhatsApp Connector', 'Tanpa ribet koding! Cukup buka dashboard, pindai QR Code dengan WhatsApp HP toko Anda, dan bot langsung aktif beroperasi.', 6)
ON CONFLICT DO NOTHING;
