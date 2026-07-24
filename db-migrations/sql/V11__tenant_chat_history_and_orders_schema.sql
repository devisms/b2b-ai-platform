-- ============================================================================
-- V11__tenant_chat_history_and_orders_schema.sql
-- Flyway Migration V11: Per-Tenant Daily Chat History & WhatsApp Orders Tables
-- ============================================================================

-- 1. TENANT_ORDERS TABLE (Daftar Pesanan Otomatis dari WhatsApp)
CREATE TABLE IF NOT EXISTS tenant_service.tenant_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_service.tenants(id) ON DELETE CASCADE,
    order_code VARCHAR(50) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    item_summary TEXT NOT NULL,
    total_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payment_proof_url TEXT,
    order_status VARCHAR(30) DEFAULT 'PAID' CHECK (order_status IN ('PAID', 'PENDING_PROOF', 'CANCELLED')),
    chat_type VARCHAR(20) DEFAULT 'DIRECT' CHECK (chat_type IN ('DIRECT', 'GROUP')),
    group_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TENANT_CHAT_HISTORY TABLE (Rekapitulasi Chat Harian Per Tenant & Grup WA)
CREATE TABLE IF NOT EXISTS tenant_service.tenant_chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_service.tenants(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    chat_type VARCHAR(20) DEFAULT 'DIRECT' CHECK (chat_type IN ('DIRECT', 'GROUP')),
    sender_name VARCHAR(150) NOT NULL,
    sender_phone VARCHAR(30),
    group_name VARCHAR(100),
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    message_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Sample Data for Tenant "Toko Baju Kang Devis" (#KWN-20260724-0001)
DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant_service.tenants WHERE owner_email = 'devis@kawanai.id' LIMIT 1;
    
    IF v_tenant_id IS NOT NULL THEN
        -- Seed Orders
        INSERT INTO tenant_service.tenant_orders (
            tenant_id, order_code, customer_name, customer_phone, item_summary, total_price, order_date, payment_proof_url, order_status, chat_type
        ) VALUES 
        (v_tenant_id, '#ORD-20260724-001', 'Budi Santoso', '0812-3456-7890', '2x Gamis Syari Premium (Navy L)', 370000.00, CURRENT_TIMESTAMP - INTERVAL '1 hour', 'https://dummyimage.com/600x800/0f172a/10b981.png&text=Bukti+Transfer+Budi+Rp+370.000', 'PAID', 'DIRECT'),
        (v_tenant_id, '#ORD-20260724-002', 'Siti Aminah', '0857-1122-3344', '1x Kemeja Koko Modern (White M)', 185000.00, CURRENT_TIMESTAMP - INTERVAL '3 hours', 'https://dummyimage.com/600x800/0f172a/10b981.png&text=Bukti+Transfer+Siti+Rp+185.000', 'PAID', 'DIRECT'),
        (v_tenant_id, '#ORD-20260724-003', 'Hj. Ningsih', '0819-8765-4321', '5x Mukena Silk Premium (Maroon)', 1250000.00, CURRENT_TIMESTAMP - INTERVAL '5 hours', 'https://dummyimage.com/600x800/0f172a/f59e0b.png&text=Menunggu+Verifikasi+Hj+Ningsih', 'PENDING_PROOF', 'GROUP');

        -- Seed Daily Chat History (24 Juli 2026)
        INSERT INTO tenant_service.tenant_chat_history (
            tenant_id, log_date, chat_type, sender_name, sender_phone, group_name, user_message, bot_response, message_time
        ) VALUES 
        (v_tenant_id, CURRENT_DATE, 'DIRECT', 'Budi Santoso', '0812-3456-7890', NULL, 'Halo kak, Gamis Syari Size L ready warna apa aja?', 'Halo kak Budi! Ready warna Navy & Maroon kak (Rp 185.000). Mau dicatat pesanannya sekarang?', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
        (v_tenant_id, CURRENT_DATE, 'DIRECT', 'Siti Aminah', '0857-1122-3344', NULL, 'Bisa COD ke Bandung gak kak?', 'Bisa banget kak Siti! Kami melayani COD via J&T Express area Bandung. Silakan kirim alamat lengkapnya ya 😊', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
        (v_tenant_id, CURRENT_DATE, 'GROUP', 'Hj. Ningsih (Reseller)', '0819-8765-4321', 'Grup Reseller Utama Kang Devis', 'Min, mukena silk promo reseller beli 5 dapet diskon berapa?', 'Halo Hj. Ningsih! Khusus reseller grup beli 5 pcs dapat harga grosir Rp 250.000/pcs + cashback Rp 50rb! Totalkan pesanannya sekarang?', CURRENT_TIMESTAMP - INTERVAL '5 hours'),

        -- Seed Previous Day Chat History (23 Juli 2026)
        (v_tenant_id, CURRENT_DATE - INTERVAL '1 day', 'DIRECT', 'Rian Hidayat', '0813-9988-7766', NULL, 'Stock Gamis Maroon size XL masih ada?', 'Masih ready 3 pcs kak Rian! Mau diamankan stoknya sekarang?', CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '2 hours'),
        (v_tenant_id, CURRENT_DATE - INTERVAL '1 day', 'GROUP', 'Pak Hendra (Member)', '0811-2233-4455', 'Grup Komunitas Pelanggan Toko', 'Ada garansi penukaran size gak kalau kekecilan?', 'Ada kak Hendra! Garansi retur size 7 hari setelah barang diterima dengan syarat tag masih utuh. 😊', CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '4 hours');
    END IF;
END $$;
