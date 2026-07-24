-- ============================================================================
-- V17__tenant_broadcast_announcements_schema.sql
-- Flyway Migration V17: Central Broadcast & Announcement System (KawanAI Pusat to Tenants)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS admin_service;

-- 1. TENANT BROADCAST ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS admin_service.tenant_broadcasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    broadcast_title VARCHAR(255) DEFAULT 'Pengumuman Resmi KawanAI Pusat',
    broadcast_type VARCHAR(50) DEFAULT 'INFO', -- 'INFO', 'UPDATE', 'MAINTENANCE', 'WARNING'
    message_body TEXT NOT NULL,
    sender_name VARCHAR(100) DEFAULT 'KawanAI Pusat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Super Admin Broadcaster Agent in admin_service.admin_agents
INSERT INTO admin_service.admin_agents (agent_key, agent_name, agent_role, persona_tone, system_prompt)
VALUES (
    'broadcast_announcement',
    'KawanAI Pusat - Official Broadcaster',
    'Broadcast & Announcement Manager',
    'friendly',
    'Anda adalah Broadcaster Resmi KawanAI Pusat. Tugas Anda adalah memformat dan menyiarkan pengumuman resmi, rilis fitur baru, atau pemberitahuan perbaikan/gangguan sistem kepada seluruh tenant B2B KawanAI.'
)
ON CONFLICT (agent_key) DO UPDATE 
SET agent_name = EXCLUDED.agent_name, 
    agent_role = EXCLUDED.agent_role,
    system_prompt = EXCLUDED.system_prompt;

-- Seed Sample Initial Broadcast Announcement
INSERT INTO admin_service.tenant_broadcasts (broadcast_title, broadcast_type, message_body, sender_name)
VALUES (
    '🚀 Pembaruan Sistem KawanAI v1.7: Multi-Agent & Top-Up Token',
    'UPDATE',
    'Halo Mitra KawanAI! Platform telah diperbarui dengan fitur baru Live WYSIWYG SOP Editor, Top-Up Token Add-on terverifikasi otomatis, serta kecepatan balasan AI ditingkatkan hingga 1.2 detik. Terima kasih telah mempercayai KawanAI!',
    'KawanAI Pusat'
);
