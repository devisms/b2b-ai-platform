import http.server
import socketserver
import os

PORT = 5002
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'web-portal')

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

if __name__ == "__main__":
    with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
        print(f"🚀 KawanAI Web Portal Server Running on http://127.0.0.1:{PORT}")
        httpd.serve_forever()
