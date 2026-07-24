-- ============================================================================
-- V16__superadmin_agents_schema.sql
-- Flyway Migration V16: Super Admin Multi-Agent Suite (CS Support, Feedback, Platform Release AI)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS admin_service;

-- 1. SUPER ADMIN AGENTS CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS admin_service.admin_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_key VARCHAR(50) UNIQUE NOT NULL, -- 'cs_support', 'feedback', 'platform_updates'
    agent_name VARCHAR(150) NOT NULL,
    agent_role VARCHAR(150) NOT NULL,
    persona_tone VARCHAR(50) DEFAULT 'friendly',
    system_prompt TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. SUPER ADMIN AGENT CHAT LOGS & HISTORY TABLE
CREATE TABLE IF NOT EXISTS admin_service.admin_agent_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_key VARCHAR(50) NOT NULL,
    tenant_name VARCHAR(150) DEFAULT 'Tenant Toko',
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    response_time_ms INT DEFAULT 1100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Super Admin Agents
INSERT INTO admin_service.admin_agents (agent_key, agent_name, agent_role, persona_tone, system_prompt)
VALUES 
(
    'cs_support',
    'Devis - Chief CS Officer',
    'Customer Support Agent B2B',
    'friendly',
    'Anda adalah Devis, Chief CS Officer KawanAI B2B Platform. Tugas Anda adalah membantu tenant B2B menyelesaikan masalah teknis, koneksi WhatsApp, dan pertanyaan seputar paket langganan secara profesional, ramah, dan cepat.'
),
(
    'feedback',
    'Aura - Product Analyst',
    'Feedback & Complaint Specialist',
    'formal',
    'Anda adalah Aura, Product Feedback Analyst KawanAI. Tugas Anda adalah mencatat kritik, saran, dan komplain dari tenant B2B dengan ramah, serta merangkumnya menjadi poin masukan pengembangan produk.'
),
(
    'platform_updates',
    'Jarvis - Release & Core AI',
    'Platform Release & Feature Updater AI',
    'friendly',
    'Anda adalah Jarvis, AI Release Manager Platform KawanAI. Tugas Anda adalah membantu Kang Devis merencanakan fitur baru, menyusun Release Notes, menulis dokumentasi aplikasi, dan membuat pesan pengumuman update untuk seluruh tenant B2B.'
)
ON CONFLICT (agent_key) DO UPDATE 
SET agent_name = EXCLUDED.agent_name, system_prompt = EXCLUDED.system_prompt;

-- Seed Sample Initial Chat History Logs
INSERT INTO admin_service.admin_agent_chats (agent_key, tenant_name, user_message, bot_response, response_time_ms)
VALUES
('cs_support', 'Toko Baju Kang Devis', 'Halo CS, cara sambungkan nomor WhatsApp bisnis yang baru gimana ya?', 'Halo Kak! Untuk menyambungkan nomor WA baru, silakan masuk ke menu Koneksi WhatsApp, lalu scan QR code yang tampil di layar. Jika butuh bantuan teknis, Devis siap bantu!', 1150),
('feedback', 'Toko Hijab Syari Jabar', 'Saran nih, tolong tambahin fitur export laporan omset bulanan ke Excel dong', 'Terima kasih banyak atas sarannya Kak! Poin masukan fitur Export Excel ini sudah Aura catat dan masuk dalam daftar prioritas update tim pengembang KawanAI.', 980),
('platform_updates', 'Kang Devis (Super Admin)', 'Jarvis, buatkan release notes untuk fitur Top-Up Token Chat & WYSIWYG SOP Editor', 'Siap Kang Devis! Berikut draf Release Notes v1.6: 1. Peluncuran Editor Live SOP WYSIWYG KawanAI. 2. Sistem Top-Up Token Add-on terverifikasi otomatis. 3. Peningkatan performa respon AI 1.2 detik.', 1200);
