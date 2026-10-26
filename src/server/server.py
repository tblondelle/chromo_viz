from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


def main() -> None:
    static_dir = Path(__file__).resolve().parent / "static"
    handler = partial(SimpleHTTPRequestHandler, directory=str(static_dir))

    server = ThreadingHTTPServer(("127.0.0.1", 8000), handler)
    print("Ouvre http://127.0.0.1:8000")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nArrêt du serveur.")
    finally:
        server.server_close()