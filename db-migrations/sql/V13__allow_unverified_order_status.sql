-- ============================================================================
-- V13__allow_unverified_order_status.sql
-- Flyway Migration V13: Allow UNVERIFIED order status & status updates
-- ============================================================================

ALTER TABLE tenant_service.tenant_orders
DROP CONSTRAINT IF EXISTS tenant_orders_order_status_check;

ALTER TABLE tenant_service.tenant_orders
ADD CONSTRAINT tenant_orders_order_status_check
CHECK (order_status IN ('UNVERIFIED', 'PENDING_PROOF', 'PAID', 'VERIFIED', 'CANCELLED'));

-- Add a sample UNVERIFIED order (Baru pesan, belum upload / belum verifikasi bukti transfer)
INSERT INTO tenant_service.tenant_orders (
    tenant_id, order_code, customer_name, customer_phone, item_summary, total_price, order_status, chat_type, chat_transcript_json
)
SELECT 
    id, '#ORD-20260724-004', 'Deni Rahadian', '0813-9988-7766', '1x Kemeja Batik Solo Size XL', 220000.00, 'UNVERIFIED', 'DIRECT',
    '[{"sender": "user", "name": "Deni Rahadian", "time": "10:45:00 WIB", "text": "Halo min, Batik Solo XL ada? Mau order 1 pcs."}, {"sender": "bot", "name": "Siti - CS Toko Baju", "time": "10:45:01 WIB", "text": "Ada kak Deni! Total Rp 220.000. Pesanan dicatat #ORD-20260724-004. Ditunggu transfernya ya kak!"}]'
FROM tenant_service.tenants
WHERE business_name = 'Toko Baju Kang Devis'
LIMIT 1;
