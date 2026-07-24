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
        else:
            self.send_error(404, "Endpoint Not Found")

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
