-- ============================================================================
-- V12__add_chat_transcript_proof_to_orders.sql
-- Flyway Migration V12: Chat Transcript Proof for WhatsApp Automated Orders
-- ============================================================================

ALTER TABLE tenant_service.tenant_orders
ADD COLUMN IF NOT EXISTS chat_transcript_json TEXT;

-- Update sample orders with realistic WhatsApp Chat Log Proofs
UPDATE tenant_service.tenant_orders
SET chat_transcript_json = '[
  {"sender": "user", "name": "Budi Santoso", "time": "14:15", "text": "Halo kak, Gamis Syari Size L ready warna Navy? Saya mau order 2 pcs kak."},
  {"sender": "bot", "name": "Siti - CS Toko Baju Kang Devis", "time": "14:15", "text": "Halo kak Budi! Ready warna Navy kak (Rp 185.000 x 2 = Rp 370.000). Pesanan sudah Siti catat otomatis dengan Kode #ORD-20260724-001. Silakan transfer ke BCA 1234567890 an Toko Baju Kang Devis ya kak! 😊"},
  {"sender": "user", "name": "Budi Santoso", "time": "14:22", "text": "Sudah sy transfer kak Rp 370.000 via BCA. Ini foto bukti transfernya ya min."}
]'
WHERE order_code = '#ORD-20260724-001';

UPDATE tenant_service.tenant_orders
SET chat_transcript_json = '[
  {"sender": "user", "name": "Siti Aminah", "time": "12:30", "text": "Kemeja Koko Modern warna White M masih ada? Bisa COD Bandung?"},
  {"sender": "bot", "name": "Siti - CS Toko Baju Kang Devis", "time": "12:30", "text": "Masih ready kak Siti! (Rp 185.000). Bisa COD via J&T ke Bandung. Pesanan Siti catat dengan Kode #ORD-20260724-002 ya kak!"},
  {"sender": "user", "name": "Siti Aminah", "time": "12:35", "text": "Oke mantap min, sy udah transfer via QRIS aja ya biar cepet. Makasih min!"}
]'
WHERE order_code = '#ORD-20260724-002';

UPDATE tenant_service.tenant_orders
SET chat_transcript_json = '[
  {"sender": "user", "name": "Hj. Ningsih (Reseller)", "time": "10:10", "text": "Min di grup reseller, Mukena Silk Premium kalau beli 5 dapet harga berapa per pcs?"},
  {"sender": "bot", "name": "Siti - CS Toko Baju Kang Devis", "time": "10:10", "text": "Halo Hj. Ningsih! Khusus reseller grup beli 5 pcs dapat harga grosir Rp 250.000/pcs = Total Rp 1.250.000! Pesanan grosir dicatat dengan Kode #ORD-20260724-003."},
  {"sender": "user", "name": "Hj. Ningsih (Reseller)", "time": "10:20", "text": "Siap min nanti sore diproses transfernya ya."}
]'
WHERE order_code = '#ORD-20260724-003';
