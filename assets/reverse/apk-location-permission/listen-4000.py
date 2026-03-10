#!/usr/bin/env python3
"""
在 4000 端口启动 HTTP 服务，打印每次请求的 URL、查询参数和时间，方便看 APP 上报的数据。
用法: python3 listen-4000.py  或  ./listen-4000.py
"""
import http.server
import socketserver
from urllib.parse import urlparse, parse_qs
from datetime import datetime

PORT = 4000


class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_GET(self):
        parsed = urlparse(self.path)
        qs = parse_qs(parsed.query)
        ts = datetime.now().strftime("%H:%M:%S")
        print(f"\n[{ts}] GET {self.path}")
        if qs:
            for k, v in qs.items():
                print(f"     {k} = {v[0] if v else ''}")
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"ok")

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode("utf-8", errors="replace") if length else ""
        ts = datetime.now().strftime("%H:%M:%S")
        print(f"\n[{ts}] POST {self.path}")
        if body:
            print(f"     body: {body[:500]}")
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"ok")


with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Listening on 0.0.0.0:{PORT} (APP 请求会打印在下面)")
    print(f"请求地址: http://<本机IP>:{PORT}/ip  (例如 http://192.168.1.204:4000/ip)")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nBye.")
