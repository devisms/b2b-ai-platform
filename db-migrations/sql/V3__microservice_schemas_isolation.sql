-- ============================================================================
-- V3__microservice_schemas_isolation.sql
-- Flyway Migration V3: Microservices Domain Isolation Schemas
-- ============================================================================

-- 1. CREATE MICROSERVICE DOMAIN SCHEMAS
CREATE SCHEMA IF NOT EXISTS tenant_service;
CREATE SCHEMA IF NOT EXISTS agent_service;
CREATE SCHEMA IF NOT EXISTS analytics_service;
CREATE SCHEMA IF NOT EXISTS cms_service;

-- Move UUID extension to public
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;

-- ----------------------------------------------------------------------------
-- DOMAIN 1: TENANT_SERVICE SCHEMA (Tenant & WhatsApp Connection Domain)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tenant_service.tenants (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    business_name VARCHAR(150) NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    owner_email VARCHAR(150) UNIQUE NOT NULL,
    owner_phone VARCHAR(30) UNIQUE NOT NULL,
    plan_tier VARCHAR(20) DEFAULT 'Lite',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenant_service.wa_sessions (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    tenant_id UUID UNIQUE NOT NULL REFERENCES tenant_service.tenants(id) ON DELETE CASCADE,
    phone_number VARCHAR(30),
    session_status VARCHAR(30) DEFAULT 'DISCONNECTED',
    qr_code_str TEXT,
    last_connected_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- DOMAIN 2: AGENT_SERVICE SCHEMA (AI Agent & RAG Document Domain)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_service.ai_agents (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_service.tenants(id) ON DELETE CASCADE,
    agent_name VARCHAR(100) NOT NULL DEFAULT 'Siti - CS AI',
    business_category VARCHAR(50) DEFAULT 'fashion',
    persona_type VARCHAR(30) DEFAULT 'friendly',
    system_prompt TEXT NOT NULL,
    temperature NUMERIC(3,2) DEFAULT 0.7,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_service.rag_documents (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_service.tenants(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    workspace_slug VARCHAR(100) NOT NULL,
    rag_status VARCHAR(30) DEFAULT 'INDEXED',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- DOMAIN 3: ANALYTICS_SERVICE SCHEMA (Chat History & Telemetry Domain)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_service.chat_history_logs (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_service.tenants(id) ON DELETE CASCADE,
    sender_phone VARCHAR(30) NOT NULL,
    sender_name VARCHAR(100),
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- DOMAIN 4: CMS_SERVICE SCHEMA (Public Landing Page, Portfolio & Pricing Domain)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cms_service.portfolio_items (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
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

CREATE TABLE IF NOT EXISTS cms_service.pricing_plans (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    plan_code VARCHAR(30) UNIQUE NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    subtitle VARCHAR(255),
    monthly_price NUMERIC(12,2) NOT NULL,
    annual_monthly_price NUMERIC(12,2) NOT NULL,
    features_json JSONB NOT NULL,
    is_popular BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SEED DATA UNTUK MICROSERVICE SCHEMAS
INSERT INTO tenant_service.tenants (id, business_name, owner_name, owner_email, owner_phone, plan_tier)
VALUES (
    '90219021-9021-9021-9021-902190219021',
    'Toko Baju Kang Devis',
    'Kang Devis',
    'devis@kawanai.id',
    '081234567890',
    'Pro'
) ON CONFLICT (owner_email) DO NOTHING;

INSERT INTO agent_service.ai_agents (tenant_id, agent_name, business_category, persona_type, system_prompt)
VALUES (
    '90219021-9021-9021-9021-902190219021',
    'Siti - CS Toko Baju Kang Devis',
    'fashion',
    'friendly',
    'Anda adalah Siti, Karyawan Sales & CS AI ramah dari Toko Baju Kang Devis.'
) ON CONFLICT DO NOTHING;

INSERT INTO cms_service.portfolio_items (title, category, description, metric_1_label, metric_1_value, metric_2_label, metric_2_value, icon_name, display_order)
VALUES
('Toko Fashion Online (Bandung)', 'Online Shop', 'Melayani 300+ chat WhatsApp per malam saat admin manusia tidur. Omset penjualan meningkat +45% dalam 30 hari pertama.', 'Waktu Respon', '1.2 Detik', 'Order Otomatis', '120+ / Bulan', 'shopping-bag', 1),
('Klinik Kecantikan & Kesehatan', 'Klinik Medis', 'Otomatisasi reservasi jadwal konsultasi dokter via WhatsApp & pengingat jadwal H-1 tanpa perlu admin manual.', 'No-Show Rate', 'Turun 80%', 'Kepuasan Klien', '4.9 / 5.0', 'activity', 2),
('Kantor Hukum & Notaris', 'Enterprise Legal', 'Private Document AI (Anything LLM) menjawab pertanyaan syarat berkas legal klien presisi 100% dari PDF SOP internal.', 'Hemat Waktu', '15 Jam / Mgg', 'Keamanan Data', 'Isolated RAG', 'briefcase', 3)
ON CONFLICT DO NOTHING;

INSERT INTO cms_service.pricing_plans (plan_code, plan_name, subtitle, monthly_price, annual_monthly_price, features_json, is_popular, display_order)
VALUES
('LITE', 'Paket Lite (UMKM)', 'Cocok untuk Toko Online Pemula & UMKM', 990000.00, 790000.00, '["1 WhatsApp Business Number", "1 Karyawan AI Assistant", "Upload hingga 5 File PDF Katalog", "3.000 Chat/Bulan", "Standard Cloud Hosting 24/7"]'::jsonb, FALSE, 1),
('PRO', 'Paket Pro (Bisnis)', 'Untuk Toko Online Ramai & Klinik Medis', 1950000.00, 1550000.00, '["2 WhatsApp Business Numbers", "3 Karyawan AI Custom Persona", "Unlimited Upload PDF Katalog & SOP", "15.000 Chat/Bulan", "Dedicated Cloud Server 24/7", "Prioritas Support WhatsApp"]'::jsonb, TRUE, 2),
('ENTERPRISE', 'Paket Enterprise', 'Untuk Kantor Hukum, Perusahaan, & Franchise', 3500000.00, 2800000.00, '["Unlimited WhatsApp Numbers", "Multi-Tenant Isolated Workspace", "Anything LLM Private Server RAG", "Unlimited Chat Transaksi", "Dedicated VPS Infrastructure", "Dedicated Tech Manager 24/7"]'::jsonb, FALSE, 3)
ON CONFLICT (plan_code) DO NOTHING;
