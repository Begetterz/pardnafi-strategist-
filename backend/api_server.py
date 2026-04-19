"""Minimal HTTP API for PardnaFi backend wiring demo.

Run: python -m backend.api_server
"""

from __future__ import annotations

from decimal import Decimal
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

from backend.service import inspect_strategy, list_strategies


HOST = "0.0.0.0"
PORT = 8000


def _normalize(value):
    if isinstance(value, Decimal):
        return str(value)
    if isinstance(value, dict):
        return {k: _normalize(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_normalize(v) for v in value]
    return value


class Handler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send_json(200, {"ok": True})

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/strategies":
            query = parse_qs(parsed.query)
            risk = query.get("risk", [None])[0]
            chain = query.get("chain", [None])[0]
            data = list_strategies(risk=risk, chain=chain)
            self._send_json(200, {"strategies": _normalize(data)})
            return

        self._send_json(404, {"error": "not_found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/inspect":
            try:
                length = int(self.headers.get("Content-Length", "0"))
                payload = json.loads(self.rfile.read(length).decode("utf-8"))
                strategy_id = payload["strategy_id"]
                deposit_usd = Decimal(str(payload.get("deposit_usd", "1000")))
                live_metrics = payload.get("live_metrics")
                data = inspect_strategy(strategy_id, deposit_usd, live_metrics=live_metrics)
                self._send_json(200, _normalize(data))
            except Exception as exc:
                self._send_json(400, {"error": str(exc)})
            return

        self._send_json(404, {"error": "not_found"})


def main():
    server = HTTPServer((HOST, PORT), Handler)
    print(f"PardnaFi backend API listening on http://{HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
