-- ============================================================================
-- V14__tenant_products_catalog_schema.sql
-- Flyway Migration V14: Structured Tenant Product Catalog & Inventory Management System
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_service.tenant_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_service.tenants(id) ON DELETE CASCADE,
    sku VARCHAR(50) NOT NULL,
    product_name VARCHAR(250) NOT NULL,
    category VARCHAR(100) DEFAULT 'Umum',
    price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    discount_price NUMERIC(12,2),
    stock_quantity INT NOT NULL DEFAULT 0,
    material_detail VARCHAR(250),
    variants_json TEXT, -- e.g. ["Size S", "Size M", "Size L", "Size XL"]
    image_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Product Inventory for "Toko Baju Kang Devis"
DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant_service.tenants WHERE business_name = 'Toko Baju Kang Devis' LIMIT 1;

    IF v_tenant_id IS NOT NULL THEN
        INSERT INTO tenant_service.tenant_products 
            (tenant_id, sku, product_name, category, price, discount_price, stock_quantity, material_detail, variants_json, image_url, description)
        VALUES
            (v_tenant_id, 'SKU-GMS-001', 'Gamis Syari Premium Layer', 'Busana Muslim', 185000.00, 220000.00, 45, 'Ceruty Baby Doll Premium + Full Furing', '["Navy (S,M,L,XL)", "Maroon (M,L)", "Black (All Size)"]', 'https://dummyimage.com/600x600/0f172a/3b82f6.png&text=Gamis+Syari+Kang+Devis', 'Gamis Syari jahitan rapih kelas boutique, adem dan tidak menerawang.'),
            (v_tenant_id, 'SKU-KKO-002', 'Kemeja Koko Modern Executive', 'Busana Pria', 185000.00, 210000.00, 30, 'Katun Toyobo Impor Super Soft', '["White (M,L,XL)", "Sage Green (L,XL)", "Navy (M,L)"]', 'https://dummyimage.com/600x600/0f172a/10b981.png&text=Koko+Modern+Executive', 'Kemeja Koko katun Toyobo super adem dengan bordir minimalis mewah.'),
            (v_tenant_id, 'SKU-MKN-003', 'Mukena Silk Premium Travel 2in1', 'Perlengkapan Sholat', 250000.00, 300000.00, 18, 'Armani Silk Premium Halus', '["Rose Gold", "Lilac", "Emerald Green"]', 'https://dummyimage.com/600x600/0f172a/8b5cf6.png&text=Mukena+Silk+Travel', 'Mukena Silk adem dengan tas pouch mini cocok untuk traveling & souvenir reseller.'),
            (v_tenant_id, 'SKU-BTK-004', 'Kemeja Batik Solo Katun Halus', 'Batik Pria', 220000.00, 260000.00, 12, 'Katun Primisima Furing Erro', '["Motif Parang (M,L,XL)", "Motif Mega Mendung (L,XL)"]', 'https://dummyimage.com/600x600/0f172a/f59e0b.png&text=Batik+Solo+Premium', 'Batik Solo katun halus lapis furing adem, warna awet tidak luntur.');
    END IF;
END $$;
