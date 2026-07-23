-- ============================================================================
-- V8__tenant_verification_and_expiry_schema.sql
-- Flyway Migration V8: Tenant Verification Status & Expiry Automation Engine
-- ============================================================================

ALTER TABLE tenant_service.tenants
ADD COLUMN IF NOT EXISTS tenant_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Ensure default status for new tenants is UNVERIFIED
ALTER TABLE tenant_service.tenants
ALTER COLUMN payment_status SET DEFAULT 'UNVERIFIED';

-- Add sample unverified tenant for demonstration
INSERT INTO tenant_service.tenants (
  id, tenant_code, business_name, owner_name, owner_email, owner_phone, whatsapp_number,
  payment_date, subscription_starts_at, subscription_ends_at, payment_amount,
  payment_proof_url, payment_status, status
)
VALUES (
  gen_random_uuid(), 'K-9022', 'Kopi Kenangan Kang Devis', 'Budi Santoso',
  'budi@kopikangdevis.com', '081987654321', '081987654321', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP + INTERVAL '30 days', 990000.00,
  'https://dummyimage.com/600x800/0f172a/3b82f6.png&text=Bukti+Transfer+BCA+Kopi+Kenangan+Rp+990.000',
  'UNVERIFIED', 'PENDING'
)
ON CONFLICT DO NOTHING;
