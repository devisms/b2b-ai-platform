-- ============================================================================
-- V6__pricing_promo_discount_schema.sql
-- Flyway Migration V6: Dynamic Promo Strikethrough & Automatic Expiry System
-- ============================================================================

ALTER TABLE cms_service.pricing_plans 
ADD COLUMN IF NOT EXISTS original_monthly_price NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS promo_badge TEXT,
ADD COLUMN IF NOT EXISTS promo_ends_at TIMESTAMP WITH TIME ZONE;

-- Update existing default sample data with promo discounts
UPDATE cms_service.pricing_plans
SET original_monthly_price = 750000, promo_badge = 'Diskon 33% Promo Terbatas', promo_ends_at = '2026-08-31 23:59:59+07'
WHERE plan_code = 'LITE';

UPDATE cms_service.pricing_plans
SET original_monthly_price = 1490000, promo_badge = 'Diskon 33% Paling Laris', promo_ends_at = '2026-08-31 23:59:59+07'
WHERE plan_code = 'PRO';

UPDATE cms_service.pricing_plans
SET original_monthly_price = 3500000, promo_badge = 'Diskon 29% Promo VIP', promo_ends_at = '2026-08-31 23:59:59+07'
WHERE plan_code = 'ENTERPRISE';
