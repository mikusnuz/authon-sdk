import os

from flask import Flask, make_response, redirect, render_template, request, jsonify
from authon import AuthonBackend

app = Flask(__name__)

authon = AuthonBackend(
    secret_key=os.environ["AUTHON_API_KEY"],
    api_url=os.environ.get("AUTHON_API_URL", "https://api.authon.dev"),
)

PROJECT_ID = os.environ.get("AUTHON_PROJECT_ID", "")
API_URL = os.environ.get("AUTHON_API_URL", "https://api.authon.dev")
WEBHOOK_SECRET = os.environ.get("AUTHON_WEBHOOK_SECRET", "")


@app.get("/")
def index():
    user = None
    token = request.cookies.get("authon_token")
    if token:
        try:
            user = authon.verify_token(token)
        except Exception:
            pass
    return render_template("index.html", user=user, project_id=PROJECT_ID, api_url=API_URL)


@app.post("/auth/token")
def set_token():
    data = request.get_json(silent=True) or {}
    token = data.get("token")
    if not token:
        return jsonify({"error": "missing token"}), 400
    resp = make_response(jsonify({"ok": True}))
    resp.set_cookie(
        "authon_token",
        token,
        httponly=True,
        samesite="Lax",
        max_age=3600,
    )
    return resp


@app.post("/auth/signout")
def signout():
    resp = make_response(redirect("/"))
    resp.delete_cookie("authon_token")
    return resp


@app.post("/webhook")
def webhook():
    body = request.get_data()
    sig = request.headers.get("X-Authon-Signature", "")
    try:
        event = authon.webhooks.verify(body, sig, WEBHOOK_SECRET)
        print("Webhook received:", event)
        return jsonify({"ok": True})
    except ValueError:
        return jsonify({"error": "invalid signature"}), 400


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    app.run(host="0.0.0.0", port=port, debug=False)
