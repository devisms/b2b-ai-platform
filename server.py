import http.server
import socketserver
import os
import json
import psycopg2
import psycopg2.extras

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
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/auth/login':
            self.handle_login_api()
        else:
            self.send_error(404, "Endpoint Not Found")

    def get_portfolio_api(self):
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("SELECT * FROM cms_service.portfolio_items ORDER BY display_order ASC;")
            rows = cursor.fetchall()
            conn.close()

            self.send_json_response({"status": "success", "data": rows})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def get_pricing_api(self):
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("SELECT * FROM cms_service.pricing_plans ORDER BY display_order ASC;")
            rows = cursor.fetchall()
            conn.close()

            self.send_json_response({"status": "success", "data": rows})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def get_features_api(self):
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("SELECT * FROM cms_service.feature_items ORDER BY display_order ASC;")
            rows = cursor.fetchall()
            conn.close()

            self.send_json_response({"status": "success", "data": rows})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def get_admin_tenants_api(self):
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("SELECT * FROM tenant_service.tenants ORDER BY created_at DESC;")
            rows = cursor.fetchall()
            conn.close()

            self.send_json_response({"status": "success", "data": rows})
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

    def handle_login_api(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            payload = json.loads(post_data.decode('utf-8'))
            email = payload.get('email', '').strip()

            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("SELECT * FROM tenant_service.users WHERE email = %s;", (email,))
            user = cursor.fetchone()
            conn.close()

            if user:
                self.send_json_response({
                    "status": "success",
                    "role": user['role'],
                    "user": user
                })
            else:
                self.send_json_response({
                    "status": "success",
                    "role": "TENANT_OWNER",
                    "user": {"full_name": "Klien KawanAI", "role": "TENANT_OWNER"}
                })
        except Exception as e:
            self.send_json_response({"status": "error", "message": str(e)}, 500)

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
