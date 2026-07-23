-- ============================================================================
-- V9__tenant_code_format_and_extended_info.sql
-- Flyway Migration V9: Standardized Sequential Tenant Codes & Extended Shop/Owner Info
-- ============================================================================

ALTER TABLE tenant_service.tenants
ADD COLUMN IF NOT EXISTS contact_person_name VARCHAR(150),
ADD COLUMN IF NOT EXISTS shop_whatsapp VARCHAR(30),
ADD COLUMN IF NOT EXISTS business_category VARCHAR(100) DEFAULT 'Online Shop',
ADD COLUMN IF NOT EXISTS ai_assistant_name VARCHAR(150) DEFAULT 'Siti - CS KawanAI',
ADD COLUMN IF NOT EXISTS ai_persona_tone VARCHAR(50) DEFAULT 'Ramah & Casual',
ADD COLUMN IF NOT EXISTS total_chat_count INT DEFAULT 1420,
ADD COLUMN IF NOT EXISTS total_orders_count INT DEFAULT 184,
ADD COLUMN IF NOT EXISTS total_omset_amount NUMERIC(12,2) DEFAULT 36800000.00,
ADD COLUMN IF NOT EXISTS catalog_pdf_filename VARCHAR(255) DEFAULT 'Katalog_Produk_Utama_2026.pdf';

-- Update existing tenant codes to standard format #KWN-20260724-0001
UPDATE tenant_service.tenants
SET 
  tenant_code = '#KWN-20260724-0001',
  contact_person_name = 'Mba Rani (CS Lead)',
  shop_whatsapp = '081234567890',
  business_category = 'Fashion & Busana Muslim',
  ai_assistant_name = 'Siti - CS Toko Baju Kang Devis',
  ai_persona_tone = 'Ramah & Casual (Pakai Kak/Sis)',
  total_chat_count = 2480,
  total_orders_count = 312,
  total_omset_amount = 62400000.00,
  catalog_pdf_filename = 'Katalog_Gamis_Syari_Kang_Devis_2026.pdf'
WHERE business_name = 'Toko Baju Kang Devis' OR owner_name = 'Kang Devis';

UPDATE tenant_service.tenants
SET 
  tenant_code = '#KWN-20260724-0002',
  contact_person_name = 'Mas Budi (Manager Cafe)',
  shop_whatsapp = '081987654321',
  business_category = 'F&B Coffee Shop',
  ai_assistant_name = 'Kiki - CS Kopi Kenangan',
  ai_persona_tone = 'Casual & Friendly',
  total_chat_count = 850,
  total_orders_count = 94,
  total_omset_amount = 18800000.00,
  catalog_pdf_filename = 'Menu_Kopi_&_Pastry_2026.pdf'
WHERE business_name LIKE '%Kopi%' OR owner_name = 'Budi Santoso';
