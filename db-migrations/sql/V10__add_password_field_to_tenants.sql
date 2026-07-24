-- ============================================================================
-- V10__add_password_field_to_tenants.sql
-- Flyway Migration V10: Tenant Password Field & Reset Functionality
-- ============================================================================

ALTER TABLE tenant_service.tenants
ADD COLUMN IF NOT EXISTS tenant_password VARCHAR(100) DEFAULT '123456';

-- Update sample passwords for existing tenants
UPDATE tenant_service.tenants
SET tenant_password = '123456'
WHERE owner_email = 'devis@kawanai.id' OR business_name = 'Toko Baju Kang Devis';

UPDATE tenant_service.tenants
SET tenant_password = 'kopi1234'
WHERE owner_email = 'budi@kopikenangan.id' OR business_name LIKE '%Kopi%';

UPDATE tenant_service.tenants
SET tenant_password = 'geprek1234'
WHERE owner_email = 'ahmad@geprekkangdevis.id' OR business_name LIKE '%Geprek%';
