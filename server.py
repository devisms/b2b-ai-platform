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
        else:
            super().do_GET()

    def get_portfolio_api(self):
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("SELECT * FROM cms_service.portfolio_items ORDER BY display_order ASC;")
            rows = cursor.fetchall()
            conn.close()

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "data": rows}, default=str).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))

    def get_pricing_api(self):
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute("SELECT * FROM cms_service.pricing_plans ORDER BY display_order ASC;")
            rows = cursor.fetchall()
            conn.close()

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "data": rows}, default=str).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))

if __name__ == "__main__":
    with socketserver.TCPServer(("127.0.0.1", PORT), CustomHandler) as httpd:
        print(f"🚀 KawanAI Microservice-Ready Server Running on http://127.0.0.1:{PORT}")
        httpd.serve_forever()
