-- ============================================================================
-- V2__portfolio_and_landing_schema.sql
-- Flyway Migration V2: Dynamic Generic Portfolio, Features & Pricing Schema
-- ============================================================================

-- 1. PORTFOLIO_ITEMS TABLE (Studi Kasus & Hasil Klien Dinamis)
CREATE TABLE IF NOT EXISTS portfolio_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Online Shop, Klinik, Legal, Restoran, Properti
    description TEXT NOT NULL,
    metric_1_label VARCHAR(50),
    metric_1_value VARCHAR(50),
    metric_2_label VARCHAR(50),
    metric_2_value VARCHAR(50),
    icon_name VARCHAR(50) DEFAULT 'shopping-bag',
    is_featured BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. FEATURE_ITEMS TABLE (Fitur Utama Platform Dinamis)
CREATE TABLE IF NOT EXISTS feature_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    icon_name VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    display_order INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PRICING_PLANS TABLE (Harga Paket & Fitur Langganan Dinamis)
CREATE TABLE IF NOT EXISTS pricing_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_code VARCHAR(30) UNIQUE NOT NULL, -- LITE, PRO, ENTERPRISE
    plan_name VARCHAR(100) NOT NULL,
    subtitle VARCHAR(255),
    monthly_price NUMERIC(12,2) NOT NULL,
    annual_monthly_price NUMERIC(12,2) NOT NULL,
    features_json JSONB NOT NULL, -- Array of feature strings
    is_popular BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CLIENT_TESTIMONIALS TABLE (Testimoni Klien B2B)
CREATE TABLE IF NOT EXISTS client_testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name VARCHAR(100) NOT NULL,
    client_company VARCHAR(100) NOT NULL,
    rating_stars NUMERIC(2,1) DEFAULT 5.0,
    testimonial_text TEXT NOT NULL,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SEED INITIAL DATA: DYNAMIC PORTFOLIO ITEMS
INSERT INTO portfolio_items (title, category, description, metric_1_label, metric_1_value, metric_2_label, metric_2_value, icon_name, display_order)
VALUES
('Toko Fashion Online (Bandung)', 'Online Shop', 'Melayani 300+ chat WhatsApp per malam saat admin manusia tidur. Omset penjualan meningkat +45% dalam 30 hari pertama.', 'Waktu Respon', '1.2 Detik', 'Order Otomatis', '120+ / Bulan', 'shopping-bag', 1),
('Klinik Kecantikan & Kesehatan', 'Klinik Medis', 'Otomatisasi reservasi jadwal konsultasi dokter via WhatsApp & pengingat jadwal H-1 tanpa perlu admin manual.', 'No-Show Rate', 'Turun 80%', 'Kepuasan Klien', '4.9 / 5.0', 'activity', 2),
('Kantor Hukum & Notaris', 'Enterprise Legal', 'Private Document AI (Anything LLM) menjawab pertanyaan syarat berkas legal klien presisi 100% dari PDF SOP internal.', 'Hemat Waktu', '15 Jam / Mgg', 'Keamanan Data', 'Isolated RAG', 'briefcase', 3)
ON CONFLICT DO NOTHING;

-- SEED INITIAL DATA: DYNAMIC PRICING PLANS
INSERT INTO pricing_plans (plan_code, plan_name, subtitle, monthly_price, annual_monthly_price, features_json, is_popular, display_order)
VALUES
('LITE', 'Paket Lite (UMKM)', 'Cocok untuk Toko Online Pemula & UMKM', 990000.00, 790000.00, '["1 WhatsApp Business Number", "1 Karyawan AI Assistant", "Upload hingga 5 File PDF Katalog", "3.000 Chat/Bulan", "Standard Cloud Hosting 24/7"]'::jsonb, FALSE, 1),
('PRO', 'Paket Pro (Bisnis)', 'Untuk Toko Online Ramai & Klinik Medis', 1950000.00, 1550000.00, '["2 WhatsApp Business Numbers", "3 Karyawan AI Custom Persona", "Unlimited Upload PDF Katalog & SOP", "15.000 Chat/Bulan", "Dedicated Cloud Server 24/7", "Prioritas Support WhatsApp"]'::jsonb, TRUE, 2),
('ENTERPRISE', 'Paket Enterprise', 'Untuk Kantor Hukum, Perusahaan, & Franchise', 3500000.00, 2800000.00, '["Unlimited WhatsApp Numbers", "Multi-Tenant Isolated Workspace", "Anything LLM Private Server RAG", "Unlimited Chat Transaksi", "Dedicated VPS Infrastructure", "Dedicated Tech Manager 24/7"]'::jsonb, FALSE, 3)
ON CONFLICT (plan_code) DO NOTHING;
