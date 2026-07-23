-- ============================================================================
-- V1__initial_b2b_schema.sql
-- Flyway Database Migration V1: Initial KawanAI Multi-Tenant B2B Schema
-- ============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TENANTS TABLE (Setiap Klien / Pemilik Bisnis)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(150) NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    owner_email VARCHAR(150) UNIQUE NOT NULL,
    owner_phone VARCHAR(30) UNIQUE NOT NULL,
    plan_tier VARCHAR(20) DEFAULT 'Lite' CHECK (plan_tier IN ('Lite', 'Pro', 'Enterprise')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. AI_AGENTS TABLE (Agen AI Spesifik Per Tenant)
CREATE TABLE IF NOT EXISTS ai_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    agent_name VARCHAR(100) NOT NULL DEFAULT 'Siti - CS AI',
    business_category VARCHAR(50) DEFAULT 'fashion',
    persona_type VARCHAR(30) DEFAULT 'friendly' CHECK (persona_type IN ('friendly', 'formal', 'persuasive')),
    system_prompt TEXT NOT NULL,
    temperature NUMERIC(3,2) DEFAULT 0.7,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. WA_SESSIONS TABLE (Status & QR Code WhatsApp Per Tenant)
CREATE TABLE IF NOT EXISTS wa_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    phone_number VARCHAR(30),
    session_status VARCHAR(30) DEFAULT 'DISCONNECTED' CHECK (session_status IN ('DISCONNECTED', 'CONNECTING', 'CONNECTED')),
    qr_code_str TEXT,
    last_connected_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. RAG_DOCUMENTS TABLE (Katalog PDF & SOP Document Index Anything LLM)
CREATE TABLE IF NOT EXISTS rag_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    workspace_slug VARCHAR(100) NOT NULL,
    rag_status VARCHAR(30) DEFAULT 'INDEXED' CHECK (rag_status IN ('UPLOADING', 'INDEXING', 'INDEXED', 'FAILED')),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. CHAT_HISTORY_LOGS TABLE (Rekapitulasi Chat Dijawab AI Per Tenant)
CREATE TABLE IF NOT EXISTS chat_history_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sender_phone VARCHAR(30) NOT NULL,
    sender_name VARCHAR(100),
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXING UNTUK PERFORMA QUERY CEPAT
CREATE INDEX IF NOT EXISTS idx_agents_tenant ON ai_agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wa_sessions_tenant ON wa_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rag_docs_tenant ON rag_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_tenant ON chat_history_logs(tenant_id);

-- SEED INITIAL DATA UNTUK KANG DEVIS (TENANT #K-9021)
INSERT INTO tenants (id, business_name, owner_name, owner_email, owner_phone, plan_tier)
VALUES (
    '90219021-9021-9021-9021-902190219021',
    'Toko Baju Kang Devis',
    'Kang Devis',
    'devis@kawanai.id',
    '081234567890',
    'Pro'
) ON CONFLICT (owner_email) DO NOTHING;

INSERT INTO ai_agents (tenant_id, agent_name, business_category, persona_type, system_prompt)
VALUES (
    '90219021-9021-9021-9021-902190219021',
    'Siti - CS Toko Baju Kang Devis',
    'fashion',
    'friendly',
    'Anda adalah Siti, Karyawan Sales & CS AI ramah dari Toko Baju Kang Devis. Tugas Anda adalah melayani chat pembeli dengan ramah dan akurat berdasarkan PDF katalog.'
) ON CONFLICT DO NOTHING;
