import http.server
import socketserver
import os
import json
import psycopg2
import psycopg2.extras
from datetime import datetime

PORT = 5002
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'web-portal')

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "b2b_platform_db",
    "user": "b2b_user",
    "password": "b2b_password_secret"
}

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        if self.path == '/api/portfolio':
            self.get_portfolio_api()
        elif self.path == '/api/pricing':
            self.get_pricing_api()
        elif self.path == '/api/features':
            self.get_features_api()
        elif self.path == '/api/admin/tenants':
            self.get_admin_tenants_api()
        elif self.path.startswith('/api/tenant/orders'):
            self.get_tenant_orders_api()
        elif self.path.startswith('/api/tenant/chat-history'):
            self.get_tenant_chat_history_api()
        elif self.path.startswith('/api/tenant/products'):
            self.get_tenant_products_api()
        elif self.path.startswith('/api/tenant/topups'):
            self.get_tenant_topups_api()
        elif self.path.startswith('/api/tenant/sop'):
            self.get_tenant_sop_api()
        else:




            # Disable Cache for development static files & enforce UTF-8
            clean_path = self.path.split('?')[0]
            self.send_response(200)
            if clean_path.endswith('.css'):
                self.send_header('Content-Type', 'text/css; charset=utf-8')
            elif clean_path.endswith('.js'):
                self.send_header('Content-Type', 'application/javascript; charset=utf-8')
            elif clean_path.endswith('.html') or clean_path == '/':
                self.send_header('Content-Type', 'text/html; charset=utf-8')
            
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            self.end_headers()

            rel_path = 'index.html' if (clean_path == '/' or not clean_path) else clean_path.lstrip('/')
            filepath = os.path.join(DIRECTORY, rel_path)
            if os.path.exists(filepath) and os.path.isfile(filepath):
                with open(filepath, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                super().do_GET()



    def do_POST(self):
        if self.path == '/api/auth/login':
            self.handle_login_api()
        elif self.path == '/api/auth/register':
            self.handle_register_api()
        elif self.path == '/api/admin/tenants/update-status':
            self.update_tenant_status_api()
        elif self.path == '/api/admin/portfolio/save':
            self.save_portfolio_api()
        elif self.path == '/api/admin/portfolio/delete':
            self.delete_portfolio_api()
        elif self.path == '/api/admin/features/save':
            self.save_feature_api()
        elif self.path == '/api/admin/features/delete':
            self.delete_feature_api()
        elif self.path == '/api/admin/pricing/save':
            self.save_pricing_api()
        elif self.path == '/api/admin/pricing/delete':
            self.delete_pricing_api()
        elif self.path == '/api/admin/tenants/reset-password':
            self.reset_tenant_password_api()
        elif self.path == '/api/tenant/orders/update-status':
            self.update_tenant_order_status_api()
        elif self.path == '/api/tenant/products/save':
            self.save_tenant_product_api()
        elif self.path == '/api/tenant/products/delete':
            self.delete_tenant_product_api()
        elif self.path == '/api/tenant/topups/buy':
            self.buy_tenant_topup_api()
        elif self.path == '/api/tenant/account/update-password':
            self.update_tenant_account_password_api()
        elif self.path == '/api/tenant/sop/save':
            self.save_tenant_sop_api()
        else:




            self.send_json_response({"status": "error", "message": "Not Found"}, 404)


    # --- GET ENDPOINTS ---
    def get_portfolio_api(self):
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("SELECT * FROM cms_service.portfolio_items WHERE is_deleted IS NOT TRUE ORDER BY display_order ASC;")
            rows = cursor.fetchall()
            conn.close()

            self.send_json_response({"status": "success", "data": rows})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def get_pricing_api(self):
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("SELECT * FROM cms_service.pricing_plans WHERE is_deleted IS NOT TRUE ORDER BY display_order ASC;")
            rows = cursor.fetchall()
            conn.close()

            now = datetime.now()
            processed_rows = []
            for r in rows:
                r_dict = dict(r)
                promo_ends = r_dict.get('promo_ends_at')
                is_expired = False

                if promo_ends:
                    if isinstance(promo_ends, str):
                        promo_dt = datetime.fromisoformat(promo_ends.replace('Z', '+00:00'))
                    else:
                        promo_dt = promo_ends
                    
                    if now > promo_dt.replace(tzinfo=None):
                        is_expired = True

                r_dict['is_promo_expired'] = is_expired
                processed_rows.append(r_dict)

            self.send_json_response({"status": "success", "data": processed_rows})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def get_features_api(self):
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("SELECT * FROM cms_service.feature_items WHERE is_deleted IS NOT TRUE ORDER BY display_order ASC;")
            rows = cursor.fetchall()
            conn.close()

            self.send_json_response({"status": "success", "data": rows})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def get_admin_tenants_api(self):
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            
            # Auto-update expired tenants based on current timestamp
            cursor.execute("""
                UPDATE tenant_service.tenants
                SET status = 'EXPIRED', payment_status = 'EXPIRED'
                WHERE subscription_ends_at < CURRENT_TIMESTAMP AND payment_status != 'UNVERIFIED';
            """)
            conn.commit()

            cursor.execute("SELECT * FROM tenant_service.tenants WHERE is_deleted IS NOT TRUE ORDER BY created_at DESC;")
            rows = cursor.fetchall()
            conn.close()

            self.send_json_response({"status": "success", "data": rows})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def get_tenant_orders_api(self):
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("""
                SELECT o.*, t.business_name 
                FROM tenant_service.tenant_orders o
                JOIN tenant_service.tenants t ON o.tenant_id = t.id
                ORDER BY o.order_date DESC;
            """)
            rows = cursor.fetchall()
            conn.close()

            # Format datetime objects
            processed = []
            for r in rows:
                r_dict = dict(r)
                if r_dict.get('order_date'):
                    r_dict['order_date'] = r_dict['order_date'].isoformat()
                if r_dict.get('total_price'):
                    r_dict['total_price'] = float(r_dict['total_price'])
                processed.append(r_dict)

            self.send_json_response({"status": "success", "data": processed})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def get_tenant_chat_history_api(self):
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("""
                SELECT c.*, t.business_name 
                FROM tenant_service.tenant_chat_history c
                JOIN tenant_service.tenants t ON c.tenant_id = t.id
                ORDER BY c.log_date DESC, c.message_time DESC;
            """)
            rows = cursor.fetchall()
            conn.close()

            processed = []
            for r in rows:
                r_dict = dict(r)
                if r_dict.get('log_date'):
                    r_dict['log_date'] = r_dict['log_date'].isoformat()
                if r_dict.get('message_time'):
                    r_dict['message_time'] = r_dict['message_time'].isoformat()
                processed.append(r_dict)

            self.send_json_response({"status": "success", "data": processed})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def update_tenant_order_status_api(self):
        try:
            payload = self.read_json_payload()
            order_code = payload.get('order_code')
            new_status = payload.get('order_status')

            if not order_code or not new_status:
                self.send_json_response({"status": "error", "message": "Parameter order_code dan order_status wajib diisi!"}, 400)
                return

            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE tenant_service.tenant_orders
                SET order_status = %s
                WHERE order_code = %s;
            """, (new_status, order_code))
            conn.commit()
            conn.close()

            self.send_json_response({"status": "success", "message": f"Status pesanan {order_code} berhasil diubah menjadi {new_status}"})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def get_tenant_products_api(self):
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("""
                SELECT p.*, t.business_name 
                FROM tenant_service.tenant_products p
                JOIN tenant_service.tenants t ON p.tenant_id = t.id
                WHERE p.is_active IS TRUE
                ORDER BY p.created_at DESC;
            """)
            rows = cursor.fetchall()
            conn.close()

            processed = []
            for r in rows:
                r_dict = dict(r)
                if r_dict.get('price'): r_dict['price'] = float(r_dict['price'])
                if r_dict.get('discount_price'): r_dict['discount_price'] = float(r_dict['discount_price'])
                processed.append(r_dict)

            self.send_json_response({"status": "success", "data": processed})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def save_tenant_product_api(self):
        try:
            payload = self.read_json_payload()
            prod_id = payload.get('id')
            sku = payload.get('sku', 'SKU-NEW-001')
            product_name = payload.get('product_name', 'Produk Baru')
            category = payload.get('category', 'Umum')
            price = float(payload.get('price', 0))
            discount_price = float(payload.get('discount_price', 0)) if payload.get('discount_price') else None
            stock_quantity = int(payload.get('stock_quantity', 0))
            material_detail = payload.get('material_detail', '')
            variants_json = payload.get('variants_json', '[]')
            image_url = payload.get('image_url', '')
            description = payload.get('description', '')

            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor()

            if prod_id:
                cursor.execute("""
                    UPDATE tenant_service.tenant_products
                    SET sku=%s, product_name=%s, category=%s, price=%s, discount_price=%s,
                        stock_quantity=%s, material_detail=%s, variants_json=%s, image_url=%s, description=%s, updated_at=CURRENT_TIMESTAMP
                    WHERE id=%s;
                """, (sku, product_name, category, price, discount_price, stock_quantity, material_detail, variants_json, image_url, description, prod_id))
            else:
                cursor.execute("SELECT id FROM tenant_service.tenants LIMIT 1;")
                t_id = cursor.fetchone()[0]
                cursor.execute("""
                    INSERT INTO tenant_service.tenant_products
                    (tenant_id, sku, product_name, category, price, discount_price, stock_quantity, material_detail, variants_json, image_url, description)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                """, (t_id, sku, product_name, category, price, discount_price, stock_quantity, material_detail, variants_json, image_url, description))

            conn.commit()
            conn.close()
            self.send_json_response({"status": "success", "message": f"Produk '{product_name}' berhasil disimpan ke katalog stok DB!"})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def delete_tenant_product_api(self):
        try:
            payload = self.read_json_payload()
            prod_id = payload.get('id')
            if not prod_id:
                self.send_json_response({"status": "error", "message": "ID produk wajib ada"}, 400)
                return

            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor()
            cursor.execute("UPDATE tenant_service.tenant_products SET is_active=FALSE WHERE id=%s;", (prod_id,))
            conn.commit()
            conn.close()
            self.send_json_response({"status": "success", "message": "Produk berhasil dihapus dari katalog stok!"})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def get_tenant_topups_api(self):
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("""
                SELECT tp.*, t.business_name 
                FROM tenant_service.tenant_token_topups tp
                JOIN tenant_service.tenants t ON tp.tenant_id = t.id
                ORDER BY tp.created_at DESC;
            """)
            rows = cursor.fetchall()
            conn.close()

            processed = []
            for r in rows:
                r_dict = dict(r)
                if r_dict.get('price'): r_dict['price'] = float(r_dict['price'])
                if r_dict.get('created_at'): r_dict['created_at'] = r_dict['created_at'].isoformat()
                processed.append(r_dict)

            self.send_json_response({"status": "success", "data": processed})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def buy_tenant_topup_api(self):
        try:
            payload = self.read_json_payload()
            package_name = payload.get('package_name', 'Booster 1.000 Chat AI')
            token_amount = int(payload.get('token_amount', 1000))
            price = float(payload.get('price', 75000))
            payment_proof_url = payload.get('payment_proof_url', '')

            topup_code = '#TPU-' + datetime.now().strftime('%Y%m%d') + '-' + str(random.randint(100, 999))

            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor()

            cursor.execute("SELECT id FROM tenant_service.tenants LIMIT 1;")
            t_id = cursor.fetchone()[0]

            cursor.execute("""
                INSERT INTO tenant_service.tenant_token_topups 
                (tenant_id, topup_code, package_name, token_amount, price, payment_proof_url, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s);
            """, (t_id, topup_code, package_name, token_amount, price, payment_proof_url, 'PENDING_PROOF'))

            conn.commit()
            conn.close()

            self.send_json_response({"status": "success", "message": f"Transaksi Pembelian Token {topup_code} ({package_name}) berhasil dibuat! Menunggu verifikasi bukti transfer."})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def update_tenant_account_password_api(self):
        try:
            payload = self.read_json_payload()
            new_password = payload.get('new_password')
            if not new_password:
                self.send_json_response({"status": "error", "message": "Password baru wajib diisi"}, 400)
                return

            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor()
            cursor.execute("UPDATE tenant_service.tenants SET tenant_password=%s WHERE business_name='Toko Baju Kang Devis';", (new_password,))
            conn.commit()
            conn.close()

            self.send_json_response({"status": "success", "message": f"Password akun tenant berhasil diperbarui!"})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def get_tenant_sop_api(self):
        try:
            sop_file = os.path.join(DIRECTORY, 'tenant_sop_default.html')
            sop_text = ""
            if os.path.exists(sop_file):
                with open(sop_file, 'r', encoding='utf-8') as f:
                    sop_text = f.read()
            else:
                sop_text = """
<h3>📌 STANDAR OPERASIONAL PROSEDUR (SOP) KAWANAI - TOKO BAJU KANG DEVIS</h3>
<p><strong>Panduan Resmi Pelayanan AI Siti (Sales & Customer Service Automatic Agent)</strong></p>

<h4>1. TONE PERSONA & CARA MENYAPA PEMBELI</h4>
<ul>
  <li>Selalu menyapa pembeli dengan ramah, sopan, dan hangat (gunakan sapaan <em>"Halo Kak [Nama]!"</em> atau <em>"Siap Kak!"</em>).</li>
  <li>Gunakan bahasa Indonesia yang santun, jelas, dan percaya diri. Hindari kata-kata singkat yang membingungkan.</li>
  <li>Gunakan emoji ramah secukupnya 😊👗✨ untuk memberikan kesan hangat.</li>
</ul>

<h4>2. PENANGANAN PERTANYAAN STOK, HARGA & DETAIL KAIN</h4>
<ul>
  <li>BACA TABEL STOK DATABASE SECARA PRESISI: Jangan pernah berasumsi stok jika status di DB kosong.</li>
  <li>Sebutkan nama produk, bahan kain (misal <em>Ceruty Baby Doll Premium + Full Furing</em>), variasi warna, serta harga normal & diskon grosir.</li>
  <li>Jika pembeli menanyakan diskon grosir, jelaskan aturan bertingkat (misal: <em>Beli 3 Pcs Diskon 5%, Beli 5 Pcs Diskon 10%</em>).</li>
</ul>

<h4>3. PROSEDUR PENCATATAN PESANAN & REKENING BCA</h4>
<ul>
  <li>Bantu catat nama pembeli, nomor HP, detail ukuran/warna barang, dan alamat pengiriman.</li>
  <li>Berikan total omset yang harus ditransfer serta nomor rekening resmi: <strong>Bank BCA 1234567890 an Toko Baju Kang Devis</strong>.</li>
  <li>Minta pembeli mengunggah foto resi bukti transfer ke chat WhatsApp ini untuk diverifikasi oleh admin.</li>
</ul>

<h4>4. ESKALASI KOMPLAIN & RETUR</h4>
<ul>
  <li>Apabila ada barang cacat atau salah kirim size, mohon pembeli tenang. Beritahukan bahwa owner toko akan segera menghubungi langsung via WA.</li>
</ul>
"""
            self.send_json_response({"status": "success", "sop_html": sop_text})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def save_tenant_sop_api(self):
        try:
            payload = self.read_json_payload()
            sop_html = payload.get('sop_html', '')
            sop_file = os.path.join(DIRECTORY, 'tenant_sop_default.html')
            with open(sop_file, 'w', encoding='utf-8') as f:
                f.write(sop_html)
            self.send_json_response({"status": "success", "message": "Dokumen SOP Knowledge Base KawanAI berhasil diperbarui & disimpan!"})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)






    # --- TENANT VERIFICATION & AUTHENTICATION ENDPOINTS ---
    def handle_register_api(self):
        try:
            payload = self.read_json_payload()
            business_name = payload.get('business_name', 'Bisnis Baru KawanAI')
            owner_email = payload.get('email', '').strip().lower()
            whatsapp_number = payload.get('whatsapp', '081234567890')
            plan_name = payload.get('plan_name', 'Paket PRO (Bisnis)')
            
            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

            cursor.execute("SELECT COUNT(*) FROM tenant_service.tenants;")
            count = cursor.fetchone()['count'] + 1
            date_prefix = datetime.now().strftime('%Y%m%d')
            tenant_code = f"#KWN-{date_prefix}-{count:04d}"

            cursor.execute("""
                INSERT INTO tenant_service.tenants (
                    tenant_code, business_name, owner_name, owner_email, owner_phone, whatsapp_number,
                    contact_person_name, shop_whatsapp, business_category, ai_assistant_name, ai_persona_tone,
                    payment_date, subscription_starts_at, subscription_ends_at, payment_amount,
                    payment_proof_url, payment_status, status
                ) VALUES (
                    %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s,
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 990000.00,
                    'https://dummyimage.com/600x800/0f172a/3b82f6.png&text=Bukti+Transfer+BCA+Pending+Verification',
                    'UNVERIFIED', 'PENDING'
                ) RETURNING id, tenant_code, business_name, payment_status;
            """, (
                tenant_code, business_name, business_name, owner_email, whatsapp_number, whatsapp_number,
                'Admin CS Toko', whatsapp_number, 'Online Shop', f"Siti - CS {business_name}", 'Ramah & Casual'
            ))
            
            new_tenant = cursor.fetchone()
            conn.commit()
            conn.close()

            self.send_json_response({
                "status": "success",
                "message": "Registrasi berhasil! Akun Anda kini berstatus UNVERIFIED menunggu verifikasi transfer Super Admin.",
                "data": new_tenant
            })
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def update_tenant_status_api(self):
        try:
            payload = self.read_json_payload()
            tenant_id = payload.get('id')
            new_payment_status = payload.get('payment_status', 'VERIFIED')

            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor()

            if new_payment_status == 'VERIFIED':
                cursor.execute("""
                    UPDATE tenant_service.tenants
                    SET payment_status = 'VERIFIED', status = 'ACTIVE',
                        subscription_starts_at = CURRENT_TIMESTAMP,
                        subscription_ends_at = CURRENT_TIMESTAMP + INTERVAL '1 year'
                    WHERE id = %s;
                """, (tenant_id,))
            else:
                cursor.execute("""
                    UPDATE tenant_service.tenants
                    SET payment_status = %s, status = %s
                    WHERE id = %s;
                """, (new_payment_status, 'PENDING' if new_payment_status == 'UNVERIFIED' else 'EXPIRED', tenant_id))

            conn.commit()
            conn.close()

            self.send_json_response({"status": "success", "message": f"Status tenant berhasil diperbarui menjadi {new_payment_status}!"})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def reset_tenant_password_api(self):
        try:
            payload = self.read_json_payload()
            tenant_id = payload.get('id')
            new_password = payload.get('new_password', '123456')

            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("""
                UPDATE tenant_service.tenants
                SET tenant_password = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s;
            """, (new_password, tenant_id))
            conn.commit()
            conn.close()

            self.send_json_response({"status": "success", "message": f"Kata sandi tenant berhasil diperbarui menjadi '{new_password}'!"})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)


    def handle_login_api(self):
        try:
            payload = self.read_json_payload()
            email = payload.get('email', '').strip().lower()

            if email.startswith('admin') or 'admin@kawanai.id' in email:
                self.send_json_response({
                    "status": "success",
                    "role": "SUPER_ADMIN",
                    "user": {"full_name": "Kang Devis Super Admin", "role": "SUPER_ADMIN"}
                })
                return

            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("SELECT * FROM tenant_service.tenants WHERE LOWER(owner_email) = %s AND is_deleted IS NOT TRUE;", (email,))
            tenant = cursor.fetchone()
            conn.close()

            if not tenant:
                self.send_json_response({
                    "status": "success",
                    "role": "TENANT_OWNER",
                    "user": {"full_name": "Klien KawanAI", "role": "TENANT_OWNER"}
                })
                return

            payment_status = tenant.get('payment_status', 'VERIFIED')
            ends_at = tenant.get('subscription_ends_at')
            now = datetime.now()

            if payment_status == 'UNVERIFIED':
                self.send_json_response({
                    "status": "error",
                    "code": "UNVERIFIED",
                    "message": "⚠️ Akun Anda belum diverifikasi oleh Super Admin! Silakan konfirmasi pembayaran & kirim resi transfer bank ke Admin."
                }, 403)
                return

            if ends_at:
                if isinstance(ends_at, str):
                    ends_dt = datetime.fromisoformat(ends_at.replace('Z', '+00:00'))
                else:
                    ends_dt = ends_at
                
                if now > ends_dt.replace(tzinfo=None):
                    self.send_json_response({
                        "status": "error",
                        "code": "EXPIRED",
                        "message": f"⛔ Masa langganan KawanAI Anda telah kadaluwarsa pada {ends_dt.strftime('%d/%m/%Y')}! Silakan hubungi Super Admin untuk perpanjangan."
                    }, 403)
                    return

            self.send_json_response({
                "status": "success",
                "role": "TENANT_OWNER",
                "user": tenant
            })
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    # --- CMS SAVE ENDPOINTS ---
    def save_portfolio_api(self):
        try:
            payload = self.read_json_payload()
            item_id = payload.get('id')
            title = payload.get('title')
            category = payload.get('category')
            description = payload.get('description')
            metric_1_label = payload.get('metric_1_label')
            metric_1_value = payload.get('metric_1_value')
            metric_2_label = payload.get('metric_2_label')
            metric_2_value = payload.get('metric_2_value')
            icon_name = payload.get('icon_name', 'shopping-bag')

            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor()
            if item_id:
                cursor.execute("""
                    UPDATE cms_service.portfolio_items
                    SET title=%s, category=%s, description=%s, metric_1_label=%s, metric_1_value=%s, metric_2_label=%s, metric_2_value=%s, icon_name=%s
                    WHERE id=%s;
                """, (title, category, description, metric_1_label, metric_1_value, metric_2_label, metric_2_value, icon_name, item_id))
            else:
                cursor.execute("""
                    INSERT INTO cms_service.portfolio_items (title, category, description, metric_1_label, metric_1_value, metric_2_label, metric_2_value, icon_name)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
                """, (title, category, description, metric_1_label, metric_1_value, metric_2_label, metric_2_value, icon_name))
            conn.commit()
            conn.close()

            self.send_json_response({"status": "success", "message": "Portofolio berhasil disimpan!"})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def save_feature_api(self):
        try:
            payload = self.read_json_payload()
            item_id = payload.get('id')
            title = payload.get('title')
            description = payload.get('description')
            icon_name = payload.get('icon_name', 'message-square-code')

            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor()
            if item_id:
                cursor.execute("""
                    UPDATE cms_service.feature_items
                    SET title=%s, description=%s, icon_name=%s
                    WHERE id=%s;
                """, (title, description, icon_name, item_id))
            else:
                cursor.execute("""
                    INSERT INTO cms_service.feature_items (title, description, icon_name)
                    VALUES (%s, %s, %s);
                """, (title, description, icon_name))
            conn.commit()
            conn.close()

            self.send_json_response({"status": "success", "message": "Fitur berhasil disimpan!"})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def save_pricing_api(self):
        try:
            payload = self.read_json_payload()
            item_id = payload.get('id')
            plan_code = payload.get('plan_code')
            plan_name = payload.get('plan_name')
            subtitle = payload.get('subtitle')
            monthly_price = payload.get('monthly_price')
            annual_monthly_price = payload.get('annual_monthly_price')
            original_monthly_price = payload.get('original_monthly_price') or None
            promo_badge = payload.get('promo_badge') or 'Diskon Promo Terbatas'
            promo_ends_at = payload.get('promo_ends_at') or None

            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor()
            if item_id:
                cursor.execute("""
                    UPDATE cms_service.pricing_plans
                    SET plan_code=%s, plan_name=%s, subtitle=%s, monthly_price=%s, annual_monthly_price=%s,
                        original_monthly_price=%s, promo_badge=%s, promo_ends_at=%s
                    WHERE id=%s;
                """, (plan_code, plan_name, subtitle, monthly_price, annual_monthly_price, original_monthly_price, promo_badge, promo_ends_at, item_id))
            else:
                cursor.execute("""
                    INSERT INTO cms_service.pricing_plans (plan_code, plan_name, subtitle, monthly_price, annual_monthly_price, original_monthly_price, promo_badge, promo_ends_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
                """, (plan_code, plan_name, subtitle, monthly_price, annual_monthly_price, original_monthly_price, promo_badge, promo_ends_at))
            conn.commit()
            conn.close()

            self.send_json_response({"status": "success", "message": "Paket Harga berhasil disimpan!"})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    # --- SOFT DELETE POST ENDPOINTS ---
    def delete_portfolio_api(self):
        try:
            payload = self.read_json_payload()
            item_id = payload.get('id')
            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor()
            cursor.execute("UPDATE cms_service.portfolio_items SET is_deleted=TRUE, deleted_at=CURRENT_TIMESTAMP WHERE id=%s;", (item_id,))
            conn.commit()
            conn.close()

            self.send_json_response({"status": "success", "message": "Portofolio berhasil dipindahkan ke tempat sampah!"})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def delete_feature_api(self):
        try:
            payload = self.read_json_payload()
            item_id = payload.get('id')
            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor()
            cursor.execute("UPDATE cms_service.feature_items SET is_deleted=TRUE, deleted_at=CURRENT_TIMESTAMP WHERE id=%s;", (item_id,))
            conn.commit()
            conn.close()

            self.send_json_response({"status": "success", "message": "Fitur berhasil dipindahkan ke tempat sampah!"})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def delete_pricing_api(self):
        try:
            payload = self.read_json_payload()
            item_id = payload.get('id')
            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor()
            cursor.execute("UPDATE cms_service.pricing_plans SET is_deleted=TRUE, deleted_at=CURRENT_TIMESTAMP WHERE id=%s;", (item_id,))
            conn.commit()
            conn.close()

            self.send_json_response({"status": "success", "message": "Paket Harga berhasil dipindahkan ke tempat sampah!"})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def read_json_payload(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        return json.loads(post_data.decode('utf-8'))

    def send_json_response(self, data, status_code=200):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, default=str).encode('utf-8'))

if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), CustomHandler) as httpd:
        print(f"🚀 KawanAI Server Running on http://127.0.0.1:{PORT}")
        httpd.serve_forever()
