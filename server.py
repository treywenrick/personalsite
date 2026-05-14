from __future__ import annotations

import json
import os
import ssl
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

PORT = int(os.environ.get("PORT", "4173"))
SSL_CONTEXT = ssl._create_unverified_context()
PREMIER_LEAGUE_TABLE_URL = (
    "https://www.thesportsdb.com/api/v1/json/123/lookuptable.php?l=4328&s=2025-2026"
)


class SiteHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(Path(__file__).parent), **kwargs)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self) -> None:
        if self.path == "/api/premier-league":
            self.handle_premier_league()
            return

        super().do_GET()

    def handle_premier_league(self) -> None:
        try:
            standings = self.fetch_json(PREMIER_LEAGUE_TABLE_URL)
        except HTTPError as error:
            self.send_response(error.code)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(
                json.dumps({"error": f"Upstream returned HTTP {error.code}"}).encode("utf-8")
            )
            return
        except URLError as error:
            self.send_response(502)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(
                json.dumps({"error": f"Could not reach standings provider: {error.reason}"}).encode(
                    "utf-8"
                )
            )
            return

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps(standings).encode("utf-8"))

    def fetch_json(self, url: str) -> dict:
        request = Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 Codex Premier League Proxy",
                "Accept": "application/json",
            },
        )

        with urlopen(request, timeout=20, context=SSL_CONTEXT) as response:
            return json.loads(response.read().decode("utf-8"))


def main() -> None:
    host = os.environ.get("HOST", "0.0.0.0")
    with ThreadingHTTPServer((host, PORT), SiteHandler) as httpd:
        print(f"Serving on http://{host}:{PORT}")
        httpd.serve_forever()


if __name__ == "__main__":
    main()
