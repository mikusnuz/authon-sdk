import os

import httpx
from authon import AuthonBackend
from authon.webhook import verify_webhook
from dotenv import load_dotenv
from flask import Flask, g, jsonify, make_response, redirect, render_template, request, url_for

load_dotenv()

app = Flask(__name__)

SECRET_KEY = os.environ.get("AUTHON_SECRET_KEY", "")
PUBLISHABLE_KEY = os.environ.get("AUTHON_PUBLISHABLE_KEY", "")
API_URL = os.environ.get("AUTHON_API_URL", "https://api.authon.dev")
WEBHOOK_SECRET = os.environ.get("AUTHON_WEBHOOK_SECRET", "")
IS_PRODUCTION = os.environ.get("FLASK_ENV", "development") == "production"

backend = AuthonBackend(secret_key=SECRET_KEY, api_url=API_URL)


# ---------------------------------------------------------------------------
# Template context
# ---------------------------------------------------------------------------

@app.context_processor
def inject_current_user():
    token = request.cookies.get("authon_token")
    if not token:
        return {"current_user": None}
    try:
        user = backend.verify_token(token)
        return {"current_user": user}
    except Exception:
        return {"current_user": None}


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------

def get_current_user():
    token = request.cookies.get("authon_token")
    if not token:
        return None
    try:
        return backend.verify_token(token)
    except Exception:
        return None


def require_auth(f):
    from functools import wraps

    @wraps(f)
    def wrapper(*args, **kwargs):
        token = request.cookies.get("authon_token")
        if not token:
            return redirect(url_for("sign_in"))
        try:
            g.authon_user = backend.verify_token(token)
        except Exception:
            resp = make_response(redirect(url_for("sign_in")))
            resp.delete_cookie("authon_token")
            resp.delete_cookie("authon_refresh_token")
            return resp
        return f(*args, **kwargs)

    return wrapper


def api_headers(token: str, publishable_key: str) -> dict:
    return {
        "Content-Type": "application/json",
        "x-api-key": publishable_key,
        "Authorization": f"Bearer {token}",
    }


def set_auth_cookies(resp, access_token: str, refresh_token: str = ""):
    resp.set_cookie(
        "authon_token",
        access_token,
        httponly=True,
        secure=IS_PRODUCTION,
        samesite="Lax",
        max_age=15 * 60,
    )
    if refresh_token:
        resp.set_cookie(
            "authon_refresh_token",
            refresh_token,
            httponly=True,
            secure=IS_PRODUCTION,
            samesite="Lax",
            max_age=7 * 24 * 60 * 60,
        )
    return resp


# ---------------------------------------------------------------------------
# Home
# ---------------------------------------------------------------------------

@app.route("/")
def home():
    token = request.cookies.get("authon_token")
    return render_template("home.html", token=token)


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------

@app.route("/sign-in")
def sign_in():
    token = request.cookies.get("authon_token")
    if token:
        return redirect(url_for("profile"))
    deleted = request.args.get("deleted")
    return render_template(
        "sign_in.html",
        error=None,
        deleted=deleted,
        publishable_key=PUBLISHABLE_KEY,
        api_url=API_URL,
    )


@app.route("/sign-up")
def sign_up():
    token = request.cookies.get("authon_token")
    if token:
        return redirect(url_for("profile"))
    return render_template(
        "sign_up.html",
        error=None,
        publishable_key=PUBLISHABLE_KEY,
        api_url=API_URL,
    )


@app.route("/reset-password")
def reset_password():
    return render_template(
        "reset_password.html",
        publishable_key=PUBLISHABLE_KEY,
        api_url=API_URL,
    )


@app.route("/sign-out", methods=["POST"])
def sign_out():
    resp = make_response(redirect(url_for("sign_in")))
    resp.delete_cookie("authon_token")
    resp.delete_cookie("authon_refresh_token")
    return resp


@app.route("/auth/set-token", methods=["POST"])
def set_token():
    data = request.get_json(silent=True) or {}
    access_token = data.get("accessToken")
    refresh_token = data.get("refreshToken", "")

    if not access_token:
        return jsonify({"error": "Missing accessToken"}), 400

    resp = make_response(jsonify({"ok": True}))
    set_auth_cookies(resp, access_token, refresh_token)
    return resp


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------

@app.route("/profile", methods=["GET"])
@require_auth
def profile():
    return render_template(
        "profile.html",
        user=g.authon_user,
        success=None,
        error=None,
        publishable_key=PUBLISHABLE_KEY,
        api_url=API_URL,
    )


@app.route("/profile", methods=["POST"])
@require_auth
def profile_update():
    display_name = request.form.get("displayName", "").strip()
    avatar_url = request.form.get("avatarUrl", "").strip()
    phone = request.form.get("phone", "").strip()
    token = request.cookies.get("authon_token", "")

    payload = {}
    if display_name:
        payload["displayName"] = display_name
    if avatar_url:
        payload["avatarUrl"] = avatar_url
    if phone:
        payload["phone"] = phone

    try:
        with httpx.Client() as client:
            r = client.patch(
                f"{API_URL}/v1/auth/me",
                json=payload,
                headers=api_headers(token, PUBLISHABLE_KEY),
                timeout=10,
            )
        if not r.is_success:
            raise Exception(f"API {r.status_code}")
        updated_user = r.json()

        from authon.types import AuthonUser
        user = AuthonUser.from_dict(updated_user)
        return render_template(
            "profile.html",
            user=user,
            success="Profile updated successfully.",
            error=None,
            publishable_key=PUBLISHABLE_KEY,
            api_url=API_URL,
        )
    except Exception as exc:
        return render_template(
            "profile.html",
            user=g.authon_user,
            success=None,
            error=str(exc) or "Failed to update profile.",
            publishable_key=PUBLISHABLE_KEY,
            api_url=API_URL,
        )


# ---------------------------------------------------------------------------
# MFA
# ---------------------------------------------------------------------------

@app.route("/mfa")
@require_auth
def mfa():
    token = request.cookies.get("authon_token", "")
    try:
        with httpx.Client() as client:
            r = client.get(
                f"{API_URL}/v1/auth/mfa/status",
                headers=api_headers(token, PUBLISHABLE_KEY),
                timeout=10,
            )
        mfa_status = r.json() if r.is_success else {"enabled": False, "backupCodesRemaining": 0}
    except Exception:
        mfa_status = {"enabled": False, "backupCodesRemaining": 0}

    return render_template(
        "mfa.html",
        user=g.authon_user,
        mfa_status=mfa_status,
        setup_data=None,
        error=None,
        success=None,
        publishable_key=PUBLISHABLE_KEY,
        api_url=API_URL,
    )


@app.route("/mfa/setup", methods=["POST"])
@require_auth
def mfa_setup():
    token = request.cookies.get("authon_token", "")
    try:
        with httpx.Client() as client:
            r = client.post(
                f"{API_URL}/v1/auth/mfa/totp/setup",
                headers=api_headers(token, PUBLISHABLE_KEY),
                timeout=10,
            )
        if not r.is_success:
            raise Exception(f"API {r.status_code}")
        setup_data = r.json()
    except Exception as exc:
        return render_template(
            "mfa.html",
            user=g.authon_user,
            mfa_status={"enabled": False, "backupCodesRemaining": 0},
            setup_data=None,
            error=str(exc) or "Failed to start MFA setup.",
            success=None,
            publishable_key=PUBLISHABLE_KEY,
            api_url=API_URL,
        )

    return render_template(
        "mfa.html",
        user=g.authon_user,
        mfa_status={"enabled": False, "backupCodesRemaining": 0},
        setup_data=setup_data,
        error=None,
        success=None,
        publishable_key=PUBLISHABLE_KEY,
        api_url=API_URL,
    )


@app.route("/mfa/verify", methods=["POST"])
@require_auth
def mfa_verify():
    code = request.form.get("code", "")
    token = request.cookies.get("authon_token", "")
    try:
        with httpx.Client() as client:
            r = client.post(
                f"{API_URL}/v1/auth/mfa/totp/verify-setup",
                json={"code": code},
                headers=api_headers(token, PUBLISHABLE_KEY),
                timeout=10,
            )
        if not r.is_success:
            raise Exception("Invalid verification code.")
    except Exception as exc:
        return render_template(
            "mfa.html",
            user=g.authon_user,
            mfa_status={"enabled": False, "backupCodesRemaining": 0},
            setup_data=None,
            error=str(exc),
            success=None,
            publishable_key=PUBLISHABLE_KEY,
            api_url=API_URL,
        )

    return render_template(
        "mfa.html",
        user=g.authon_user,
        mfa_status={"enabled": True, "backupCodesRemaining": 8},
        setup_data=None,
        error=None,
        success="Two-factor authentication enabled successfully.",
        publishable_key=PUBLISHABLE_KEY,
        api_url=API_URL,
    )


@app.route("/mfa/disable", methods=["POST"])
@require_auth
def mfa_disable():
    code = request.form.get("code", "")
    token = request.cookies.get("authon_token", "")
    try:
        with httpx.Client() as client:
            r = client.post(
                f"{API_URL}/v1/auth/mfa/disable",
                json={"code": code},
                headers=api_headers(token, PUBLISHABLE_KEY),
                timeout=10,
            )
        if not r.is_success:
            raise Exception("Invalid code or MFA not enabled.")
    except Exception as exc:
        return render_template(
            "mfa.html",
            user=g.authon_user,
            mfa_status={"enabled": True, "backupCodesRemaining": 0},
            setup_data=None,
            error=str(exc),
            success=None,
            publishable_key=PUBLISHABLE_KEY,
            api_url=API_URL,
        )

    return render_template(
        "mfa.html",
        user=g.authon_user,
        mfa_status={"enabled": False, "backupCodesRemaining": 0},
        setup_data=None,
        error=None,
        success="Two-factor authentication disabled.",
        publishable_key=PUBLISHABLE_KEY,
        api_url=API_URL,
    )


# ---------------------------------------------------------------------------
# Sessions
# ---------------------------------------------------------------------------

@app.route("/sessions")
@require_auth
def sessions():
    token = request.cookies.get("authon_token", "")
    error = None
    session_list = []

    try:
        with httpx.Client() as client:
            r = client.get(
                f"{API_URL}/v1/auth/me/sessions",
                headers=api_headers(token, PUBLISHABLE_KEY),
                timeout=10,
            )
        if not r.is_success:
            raise Exception(f"API {r.status_code}")
        session_list = r.json()
    except Exception as exc:
        error = str(exc) or "Failed to load sessions."

    revoked = request.args.get("revoked")
    err_param = request.args.get("error")

    return render_template(
        "sessions.html",
        user=g.authon_user,
        sessions=session_list,
        error=error or ("Failed to revoke session." if err_param else None),
        success="Session revoked." if revoked else None,
        publishable_key=PUBLISHABLE_KEY,
        api_url=API_URL,
    )


@app.route("/sessions/revoke", methods=["POST"])
@require_auth
def sessions_revoke():
    session_id = request.form.get("sessionId", "")
    token = request.cookies.get("authon_token", "")

    if not session_id:
        return redirect(url_for("sessions"))

    try:
        with httpx.Client() as client:
            r = client.delete(
                f"{API_URL}/v1/auth/me/sessions/{session_id}",
                headers=api_headers(token, PUBLISHABLE_KEY),
                timeout=10,
            )
        if not r.is_success and r.status_code != 204:
            raise Exception(f"API {r.status_code}")
        return redirect(url_for("sessions") + "?revoked=1")
    except Exception:
        return redirect(url_for("sessions") + "?error=1")


# ---------------------------------------------------------------------------
# Delete account
# ---------------------------------------------------------------------------

@app.route("/delete-account", methods=["GET"])
@require_auth
def delete_account():
    return render_template(
        "delete_account.html",
        user=g.authon_user,
        error=None,
        publishable_key=PUBLISHABLE_KEY,
        api_url=API_URL,
    )


@app.route("/delete-account", methods=["POST"])
@require_auth
def delete_account_post():
    confirm = request.form.get("confirm", "")
    if confirm != "DELETE":
        return render_template(
            "delete_account.html",
            user=g.authon_user,
            error="Please type DELETE to confirm account deletion.",
            publishable_key=PUBLISHABLE_KEY,
            api_url=API_URL,
        )

    user_id = g.authon_user.id
    try:
        backend.users.delete(user_id)
    except Exception as exc:
        return render_template(
            "delete_account.html",
            user=g.authon_user,
            error=str(exc) or "Failed to delete account.",
            publishable_key=PUBLISHABLE_KEY,
            api_url=API_URL,
        )

    resp = make_response(redirect(url_for("sign_in") + "?deleted=1"))
    resp.delete_cookie("authon_token")
    resp.delete_cookie("authon_refresh_token")
    return resp


# ---------------------------------------------------------------------------
# Webhook
# ---------------------------------------------------------------------------

@app.route("/webhook", methods=["POST"])
def webhook():
    signature = request.headers.get("x-authon-signature", "")
    raw_body = request.get_data()

    if not signature or not WEBHOOK_SECRET:
        return jsonify({"error": "Missing webhook headers or secret"}), 400

    try:
        event = verify_webhook(raw_body, signature, WEBHOOK_SECRET)
        app.logger.info("Authon webhook event: %s %s", event.type, event)
        return jsonify({"received": True})
    except ValueError:
        return jsonify({"error": "Invalid webhook signature"}), 400


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=not IS_PRODUCTION)
