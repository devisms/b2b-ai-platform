-- ============================================================================
-- V7__tenant_subscription_and_payment_proof_schema.sql
-- Flyway Migration V7: Tenant Subscription Dates & Payment Transfer Proof System
-- ============================================================================

ALTER TABLE tenant_service.tenants
ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(30),
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_starts_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'PAID',
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Seed comprehensive sample B2B tenant subscription data
UPDATE tenant_service.tenants
SET 
  whatsapp_number = '081234567890',
  payment_date = '2026-07-01 10:30:00+07',
  subscription_starts_at = '2026-07-01 00:00:00+07',
  subscription_ends_at = '2027-07-01 23:59:59+07',
  payment_amount = 9480000.00,
  payment_proof_url = 'https://dummyimage.com/600x800/0f172a/3b82f6.png&text=Bukti+Transfer+BCA+B2B+Kang+Devis+Rp+9.480.000',
  payment_status = 'VERIFIED'
WHERE TRUE;
