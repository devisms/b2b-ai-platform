-- ============================================================================
-- V15__tenant_products_and_token_topup_schema.sql
-- Flyway Migration V15: Tiered Product Discounts & Token Top-Up Add-On System
-- ============================================================================

-- 1. ADD TIERED DISCOUNT RULES TO TENANT_PRODUCTS
ALTER TABLE tenant_service.tenant_products
ADD COLUMN IF NOT EXISTS tier_discount_json TEXT; -- e.g. '[{"min_qty": 3, "discount_pct": 5}, {"min_qty": 5, "discount_pct": 10}, {"min_qty": 10, "wholesale_price": 150000}]'

-- 2. CREATE TOKEN TOP-UPS TABLE FOR TENANTS
CREATE TABLE IF NOT EXISTS tenant_service.tenant_token_topups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_service.tenants(id) ON DELETE CASCADE,
    topup_code VARCHAR(50) NOT NULL,
    package_name VARCHAR(150) NOT NULL,
    token_amount INT NOT NULL DEFAULT 500,
    price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    payment_proof_url TEXT,
    status VARCHAR(30) DEFAULT 'UNVERIFIED' CHECK (status IN ('UNVERIFIED', 'PENDING_PROOF', 'VERIFIED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Token Top-Up History for "Toko Baju Kang Devis"
DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant_service.tenants WHERE business_name = 'Toko Baju Kang Devis' LIMIT 1;

    IF v_tenant_id IS NOT NULL THEN
        INSERT INTO tenant_service.tenant_token_topups 
            (tenant_id, topup_code, package_name, token_amount, price, payment_proof_url, status, created_at)
        VALUES
            (v_tenant_id, '#TPU-20260720-001', 'Booster 1.000 Chat AI', 1000, 75000.00, 'https://dummyimage.com/600x800/0f172a/10b981.png&text=Bukti+Transfer+Topup+Rp+75.000', 'VERIFIED', CURRENT_TIMESTAMP - INTERVAL '4 days'),
            (v_tenant_id, '#TPU-20260724-002', 'Extra 2.500 Chat AI', 2500, 150000.00, 'https://dummyimage.com/600x800/0f172a/3b82f6.png&text=Bukti+Transfer+Topup+Rp+150.000', 'PENDING_PROOF', CURRENT_TIMESTAMP);
    END IF;
END $$;
