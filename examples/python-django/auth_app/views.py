import json
import urllib.request
import urllib.error

from django.conf import settings
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET

from authon import AuthonBackend, verify_webhook
from .middleware import get_backend


def _api_headers(token: str, publishable_key: str) -> dict:
    return {
        "Content-Type": "application/json",
        "x-api-key": publishable_key,
        "Authorization": f"Bearer {token}",
    }


def _api_request(method: str, url: str, headers: dict, body: dict | None = None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read()
            if not raw:
                return None
            return json.loads(raw)
    except urllib.error.HTTPError as e:
        raise Exception(f"API {e.code}")


def _require_auth(request: HttpRequest):
    token = request.COOKIES.get("authon_token")
    if not token:
        return None, redirect("/sign-in")
    backend = get_backend()
    try:
        user = backend.verify_token(token)
        return user, None
    except Exception:
        response = redirect("/sign-in")
        response.delete_cookie("authon_token")
        response.delete_cookie("authon_refresh_token")
        return None, response


def _ctx(request: HttpRequest, extra: dict | None = None) -> dict:
    ctx = {
        "publishable_key": settings.AUTHON_PUBLISHABLE_KEY,
        "api_url": settings.AUTHON_API_URL,
        "current_path": request.path,
        "authon_user": getattr(request, "authon_user", None),
    }
    if extra:
        ctx.update(extra)
    return ctx


def home(request: HttpRequest) -> HttpResponse:
    token = request.COOKIES.get("authon_token")
    features = [
        "Email/password authentication",
        "Social OAuth (10 providers)",
        "Cookie-based sessions",
        "Protected routes middleware",
        "Profile view & edit",
        "Two-factor authentication (TOTP)",
        "Session list & revocation",
        "Account deletion",
        "Password reset flow",
        "Webhook signature verification",
    ]
    stack = ["Django 5", "Python", "authon", "@authon/js", "gunicorn", "python-dotenv"]
    return render(request, "auth_app/home.html", _ctx(request, {"token": token, "features": features, "stack": stack}))


def sign_in(request: HttpRequest) -> HttpResponse:
    if request.COOKIES.get("authon_token"):
        return redirect("/profile")
    deleted = request.GET.get("deleted") == "1"
    return render(request, "auth_app/sign_in.html", _ctx(request, {"deleted": deleted}))


def sign_up(request: HttpRequest) -> HttpResponse:
    if request.COOKIES.get("authon_token"):
        return redirect("/profile")
    return render(request, "auth_app/sign_up.html", _ctx(request))


def sign_out(request: HttpRequest) -> HttpResponse:
    response = redirect("/sign-in")
    response.delete_cookie("authon_token")
    response.delete_cookie("authon_refresh_token")
    return response


def reset_password(request: HttpRequest) -> HttpResponse:
    return render(request, "auth_app/reset_password.html", _ctx(request))


def profile(request: HttpRequest) -> HttpResponse:
    user, err_response = _require_auth(request)
    if err_response:
        return err_response

    token = request.COOKIES.get("authon_token")
    api_url = settings.AUTHON_API_URL
    pk = settings.AUTHON_PUBLISHABLE_KEY

    if request.method == "POST":
        display_name = request.POST.get("displayName", "").strip()
        avatar_url = request.POST.get("avatarUrl", "").strip()
        phone = request.POST.get("phone", "").strip()

        payload: dict = {}
        if display_name:
            payload["displayName"] = display_name
        if avatar_url:
            payload["avatarUrl"] = avatar_url
        if phone:
            payload["phone"] = phone

        try:
            updated_data = _api_request(
                "PATCH",
                f"{api_url}/v1/auth/me",
                _api_headers(token, pk),
                payload,
            )
            from authon.types import AuthonUser as _AuthonUser
            updated_user = _AuthonUser.from_dict(updated_data) if updated_data else user
            return render(
                request,
                "auth_app/profile.html",
                _ctx(request, {"user": updated_user, "success": "Profile updated successfully.", "error": None}),
            )
        except Exception as exc:
            return render(
                request,
                "auth_app/profile.html",
                _ctx(request, {"user": user, "success": None, "error": str(exc)}),
            )

    return render(request, "auth_app/profile.html", _ctx(request, {"user": user, "success": None, "error": None}))


def mfa(request: HttpRequest) -> HttpResponse:
    user, err_response = _require_auth(request)
    if err_response:
        return err_response

    token = request.COOKIES.get("authon_token")
    api_url = settings.AUTHON_API_URL
    pk = settings.AUTHON_PUBLISHABLE_KEY

    try:
        mfa_status = _api_request(
            "GET",
            f"{api_url}/v1/auth/mfa/status",
            _api_headers(token, pk),
        ) or {"enabled": False, "backupCodesRemaining": 0}
    except Exception:
        mfa_status = {"enabled": False, "backupCodesRemaining": 0}

    return render(
        request,
        "auth_app/mfa.html",
        _ctx(request, {
            "user": user,
            "mfa_status": mfa_status,
            "setup_data": None,
            "success": None,
            "error": None,
        }),
    )


def mfa_setup(request: HttpRequest) -> HttpResponse:
    user, err_response = _require_auth(request)
    if err_response:
        return err_response

    if request.method != "POST":
        return redirect("/mfa")

    token = request.COOKIES.get("authon_token")
    api_url = settings.AUTHON_API_URL
    pk = settings.AUTHON_PUBLISHABLE_KEY

    try:
        setup_data = _api_request(
            "POST",
            f"{api_url}/v1/auth/mfa/totp/setup",
            _api_headers(token, pk),
        )
        return render(
            request,
            "auth_app/mfa.html",
            _ctx(request, {
                "user": user,
                "mfa_status": {"enabled": False, "backupCodesRemaining": 0},
                "setup_data": setup_data,
                "success": None,
                "error": None,
            }),
        )
    except Exception as exc:
        return render(
            request,
            "auth_app/mfa.html",
            _ctx(request, {
                "user": user,
                "mfa_status": {"enabled": False, "backupCodesRemaining": 0},
                "setup_data": None,
                "success": None,
                "error": str(exc),
            }),
        )


def mfa_verify(request: HttpRequest) -> HttpResponse:
    user, err_response = _require_auth(request)
    if err_response:
        return err_response

    if request.method != "POST":
        return redirect("/mfa")

    token = request.COOKIES.get("authon_token")
    api_url = settings.AUTHON_API_URL
    pk = settings.AUTHON_PUBLISHABLE_KEY
    code = request.POST.get("code", "")

    try:
        _api_request(
            "POST",
            f"{api_url}/v1/auth/mfa/totp/verify-setup",
            _api_headers(token, pk),
            {"code": code},
        )
        return render(
            request,
            "auth_app/mfa.html",
            _ctx(request, {
                "user": user,
                "mfa_status": {"enabled": True, "backupCodesRemaining": 8},
                "setup_data": None,
                "success": "Two-factor authentication enabled successfully.",
                "error": None,
            }),
        )
    except Exception:
        return render(
            request,
            "auth_app/mfa.html",
            _ctx(request, {
                "user": user,
                "mfa_status": {"enabled": False, "backupCodesRemaining": 0},
                "setup_data": None,
                "success": None,
                "error": "Invalid verification code.",
            }),
        )


def mfa_disable(request: HttpRequest) -> HttpResponse:
    user, err_response = _require_auth(request)
    if err_response:
        return err_response

    if request.method != "POST":
        return redirect("/mfa")

    token = request.COOKIES.get("authon_token")
    api_url = settings.AUTHON_API_URL
    pk = settings.AUTHON_PUBLISHABLE_KEY
    code = request.POST.get("code", "")

    try:
        _api_request(
            "POST",
            f"{api_url}/v1/auth/mfa/disable",
            _api_headers(token, pk),
            {"code": code},
        )
        return render(
            request,
            "auth_app/mfa.html",
            _ctx(request, {
                "user": user,
                "mfa_status": {"enabled": False, "backupCodesRemaining": 0},
                "setup_data": None,
                "success": "Two-factor authentication disabled.",
                "error": None,
            }),
        )
    except Exception:
        return render(
            request,
            "auth_app/mfa.html",
            _ctx(request, {
                "user": user,
                "mfa_status": {"enabled": True, "backupCodesRemaining": 0},
                "setup_data": None,
                "success": None,
                "error": "Invalid code or MFA not enabled.",
            }),
        )


def sessions(request: HttpRequest) -> HttpResponse:
    user, err_response = _require_auth(request)
    if err_response:
        return err_response

    token = request.COOKIES.get("authon_token")
    api_url = settings.AUTHON_API_URL
    pk = settings.AUTHON_PUBLISHABLE_KEY

    try:
        sessions_list = _api_request(
            "GET",
            f"{api_url}/v1/auth/me/sessions",
            {"x-api-key": pk, "Authorization": f"Bearer {token}"},
        ) or []
    except Exception as exc:
        sessions_list = []
        return render(
            request,
            "auth_app/sessions.html",
            _ctx(request, {"user": user, "sessions": sessions_list, "error": str(exc), "success": None}),
        )

    revoked = request.GET.get("revoked") == "1"
    error_flag = request.GET.get("error") == "1"

    return render(
        request,
        "auth_app/sessions.html",
        _ctx(request, {
            "user": user,
            "sessions": sessions_list,
            "success": "Session revoked." if revoked else None,
            "error": "Failed to revoke session." if error_flag else None,
        }),
    )


def sessions_revoke(request: HttpRequest) -> HttpResponse:
    user, err_response = _require_auth(request)
    if err_response:
        return err_response

    if request.method != "POST":
        return redirect("/sessions")

    session_id = request.POST.get("sessionId", "")
    if not session_id:
        return redirect("/sessions")

    token = request.COOKIES.get("authon_token")
    api_url = settings.AUTHON_API_URL
    pk = settings.AUTHON_PUBLISHABLE_KEY

    try:
        req = urllib.request.Request(
            f"{api_url}/v1/auth/me/sessions/{session_id}",
            headers={"x-api-key": pk, "Authorization": f"Bearer {token}"},
            method="DELETE",
        )
        urllib.request.urlopen(req)
        return redirect("/sessions?revoked=1")
    except Exception:
        return redirect("/sessions?error=1")


def delete_account(request: HttpRequest) -> HttpResponse:
    user, err_response = _require_auth(request)
    if err_response:
        return err_response

    if request.method == "POST":
        confirm = request.POST.get("confirm", "")
        if confirm != "DELETE":
            return render(
                request,
                "auth_app/delete_account.html",
                _ctx(request, {"user": user, "error": "Please type DELETE to confirm account deletion."}),
            )

        backend = get_backend()
        try:
            backend.users.delete(user.id)
            response = redirect("/sign-in?deleted=1")
            response.delete_cookie("authon_token")
            response.delete_cookie("authon_refresh_token")
            return response
        except Exception as exc:
            return render(
                request,
                "auth_app/delete_account.html",
                _ctx(request, {"user": user, "error": str(exc)}),
            )

    return render(request, "auth_app/delete_account.html", _ctx(request, {"user": user, "error": None}))


@csrf_exempt
def set_token(request: HttpRequest) -> HttpResponse:
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        body = json.loads(request.body)
    except Exception:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    access_token = body.get("accessToken")
    refresh_token = body.get("refreshToken", "")

    if not access_token:
        return JsonResponse({"error": "Missing accessToken"}, status=400)

    is_production = not settings.DEBUG
    response = JsonResponse({"ok": True})
    response.set_cookie(
        "authon_token",
        access_token,
        max_age=15 * 60,
        httponly=True,
        secure=is_production,
        samesite="Lax",
    )
    if refresh_token:
        response.set_cookie(
            "authon_refresh_token",
            refresh_token,
            max_age=7 * 24 * 60 * 60,
            httponly=True,
            secure=is_production,
            samesite="Lax",
        )
    return response


@csrf_exempt
def webhook(request: HttpRequest) -> HttpResponse:
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    signature = request.META.get("HTTP_X_AUTHON_SIGNATURE", "")
    secret = settings.AUTHON_WEBHOOK_SECRET

    if not signature or not secret:
        return JsonResponse({"error": "Missing webhook headers or secret"}, status=400)

    try:
        event = verify_webhook(request.body, signature, secret)
        print(f"Authon webhook event: {event.type} {event}")
        return JsonResponse({"received": True})
    except Exception:
        return JsonResponse({"error": "Invalid webhook signature"}, status=400)
