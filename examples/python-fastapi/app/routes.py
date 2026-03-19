import os
from typing import Optional

import httpx
from fastapi import APIRouter, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse, Response

from .middleware import get_current_user, require_auth

router = APIRouter()

IS_PRODUCTION = os.environ.get("ENV", "development") == "production"


def _templates(request: Request):
    return request.app.state.templates


def _publishable_key(request: Request) -> str:
    return request.app.state.publishable_key


def _api_url(request: Request) -> str:
    return request.app.state.api_url


def _api_headers(token: str, publishable_key: str) -> dict:
    return {
        "Content-Type": "application/json",
        "x-api-key": publishable_key,
        "Authorization": f"Bearer {token}",
    }


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------


@router.get("/sign-in", response_class=HTMLResponse)
async def sign_in_page(request: Request):
    token = request.cookies.get("authon_token")
    if token:
        return RedirectResponse("/profile", status_code=302)
    return _templates(request).TemplateResponse(
        "sign_in.html",
        {
            "request": request,
            "error": None,
            "deleted": request.query_params.get("deleted"),
            "publishable_key": _publishable_key(request),
            "api_url": _api_url(request),
        },
    )


@router.get("/sign-up", response_class=HTMLResponse)
async def sign_up_page(request: Request):
    token = request.cookies.get("authon_token")
    if token:
        return RedirectResponse("/profile", status_code=302)
    return _templates(request).TemplateResponse(
        "sign_up.html",
        {
            "request": request,
            "error": None,
            "publishable_key": _publishable_key(request),
            "api_url": _api_url(request),
        },
    )


@router.get("/reset-password", response_class=HTMLResponse)
async def reset_password_page(request: Request):
    return _templates(request).TemplateResponse(
        "reset_password.html",
        {
            "request": request,
            "publishable_key": _publishable_key(request),
            "api_url": _api_url(request),
        },
    )


@router.post("/sign-out")
async def sign_out(request: Request):
    response = RedirectResponse("/sign-in", status_code=302)
    response.delete_cookie("authon_token")
    response.delete_cookie("authon_refresh_token")
    return response


@router.post("/auth/set-token")
async def set_token(request: Request):
    body = await request.json()
    access_token: Optional[str] = body.get("accessToken")
    refresh_token: Optional[str] = body.get("refreshToken")

    if not access_token:
        return JSONResponse({"error": "Missing accessToken"}, status_code=400)

    response = JSONResponse({"ok": True})
    response.set_cookie(
        "authon_token",
        access_token,
        httponly=True,
        secure=IS_PRODUCTION,
        samesite="lax",
        max_age=15 * 60,
    )
    if refresh_token:
        response.set_cookie(
            "authon_refresh_token",
            refresh_token,
            httponly=True,
            secure=IS_PRODUCTION,
            samesite="lax",
            max_age=7 * 24 * 60 * 60,
        )
    return response


# ---------------------------------------------------------------------------
# Profile routes
# ---------------------------------------------------------------------------


@router.get("/profile", response_class=HTMLResponse)
async def profile_page(request: Request):
    user = await get_current_user(request)
    if not user:
        return RedirectResponse("/sign-in", status_code=302)
    return _templates(request).TemplateResponse(
        "profile.html",
        {
            "request": request,
            "user": user,
            "success": None,
            "error": None,
            "publishable_key": _publishable_key(request),
            "api_url": _api_url(request),
        },
    )


@router.post("/profile", response_class=HTMLResponse)
async def profile_update(
    request: Request,
    displayName: Optional[str] = Form(None),
    avatarUrl: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
):
    user = await get_current_user(request)
    if not user:
        return RedirectResponse("/sign-in", status_code=302)

    token = request.cookies.get("authon_token", "")
    api_url = _api_url(request)
    publishable_key = _publishable_key(request)

    payload = {}
    if displayName:
        payload["displayName"] = displayName
    if avatarUrl:
        payload["avatarUrl"] = avatarUrl
    if phone:
        payload["phone"] = phone

    try:
        async with httpx.AsyncClient() as client:
            r = await client.patch(
                f"{api_url}/v1/auth/me",
                headers=_api_headers(token, publishable_key),
                json=payload,
                timeout=10,
            )
        if not r.is_success:
            raise Exception(f"API {r.status_code}")
        updated_user = r.json()
        return _templates(request).TemplateResponse(
            "profile.html",
            {
                "request": request,
                "user": updated_user,
                "success": "Profile updated successfully.",
                "error": None,
                "publishable_key": publishable_key,
                "api_url": api_url,
            },
        )
    except Exception as e:
        return _templates(request).TemplateResponse(
            "profile.html",
            {
                "request": request,
                "user": user,
                "success": None,
                "error": str(e) or "Failed to update profile.",
                "publishable_key": publishable_key,
                "api_url": api_url,
            },
        )


# ---------------------------------------------------------------------------
# MFA routes
# ---------------------------------------------------------------------------


@router.get("/mfa", response_class=HTMLResponse)
async def mfa_page(request: Request):
    user = await get_current_user(request)
    if not user:
        return RedirectResponse("/sign-in", status_code=302)

    token = request.cookies.get("authon_token", "")
    api_url = _api_url(request)
    publishable_key = _publishable_key(request)

    mfa_status = {"enabled": False, "backupCodesRemaining": 0}
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"{api_url}/v1/auth/mfa/status",
                headers=_api_headers(token, publishable_key),
                timeout=10,
            )
        if r.is_success:
            mfa_status = r.json()
    except Exception:
        pass

    return _templates(request).TemplateResponse(
        "mfa.html",
        {
            "request": request,
            "user": user,
            "mfa_status": mfa_status,
            "setup_data": None,
            "error": None,
            "success": None,
            "publishable_key": publishable_key,
            "api_url": api_url,
        },
    )


@router.post("/mfa/setup", response_class=HTMLResponse)
async def mfa_setup(request: Request):
    user = await get_current_user(request)
    if not user:
        return RedirectResponse("/sign-in", status_code=302)

    token = request.cookies.get("authon_token", "")
    api_url = _api_url(request)
    publishable_key = _publishable_key(request)

    try:
        async with httpx.AsyncClient() as client:
            r = await client.post(
                f"{api_url}/v1/auth/mfa/totp/setup",
                headers=_api_headers(token, publishable_key),
                timeout=10,
            )
        if not r.is_success:
            raise Exception(f"API {r.status_code}")
        setup_data = r.json()
        return _templates(request).TemplateResponse(
            "mfa.html",
            {
                "request": request,
                "user": user,
                "mfa_status": {"enabled": False, "backupCodesRemaining": 0},
                "setup_data": setup_data,
                "error": None,
                "success": None,
                "publishable_key": publishable_key,
                "api_url": api_url,
            },
        )
    except Exception as e:
        return _templates(request).TemplateResponse(
            "mfa.html",
            {
                "request": request,
                "user": user,
                "mfa_status": {"enabled": False, "backupCodesRemaining": 0},
                "setup_data": None,
                "error": str(e) or "Failed to start MFA setup.",
                "success": None,
                "publishable_key": publishable_key,
                "api_url": api_url,
            },
        )


@router.post("/mfa/verify", response_class=HTMLResponse)
async def mfa_verify(request: Request, code: Optional[str] = Form(None)):
    user = await get_current_user(request)
    if not user:
        return RedirectResponse("/sign-in", status_code=302)

    token = request.cookies.get("authon_token", "")
    api_url = _api_url(request)
    publishable_key = _publishable_key(request)

    try:
        async with httpx.AsyncClient() as client:
            r = await client.post(
                f"{api_url}/v1/auth/mfa/totp/verify-setup",
                headers=_api_headers(token, publishable_key),
                json={"code": code},
                timeout=10,
            )
        if not r.is_success:
            raise Exception("Invalid verification code.")
        return _templates(request).TemplateResponse(
            "mfa.html",
            {
                "request": request,
                "user": user,
                "mfa_status": {"enabled": True, "backupCodesRemaining": 8},
                "setup_data": None,
                "error": None,
                "success": "Two-factor authentication enabled successfully.",
                "publishable_key": publishable_key,
                "api_url": api_url,
            },
        )
    except Exception as e:
        return _templates(request).TemplateResponse(
            "mfa.html",
            {
                "request": request,
                "user": user,
                "mfa_status": {"enabled": False, "backupCodesRemaining": 0},
                "setup_data": None,
                "error": str(e) or "Verification failed.",
                "success": None,
                "publishable_key": publishable_key,
                "api_url": api_url,
            },
        )


@router.post("/mfa/disable", response_class=HTMLResponse)
async def mfa_disable(request: Request, code: Optional[str] = Form(None)):
    user = await get_current_user(request)
    if not user:
        return RedirectResponse("/sign-in", status_code=302)

    token = request.cookies.get("authon_token", "")
    api_url = _api_url(request)
    publishable_key = _publishable_key(request)

    try:
        async with httpx.AsyncClient() as client:
            r = await client.post(
                f"{api_url}/v1/auth/mfa/disable",
                headers=_api_headers(token, publishable_key),
                json={"code": code},
                timeout=10,
            )
        if not r.is_success:
            raise Exception("Invalid code or MFA not enabled.")
        return _templates(request).TemplateResponse(
            "mfa.html",
            {
                "request": request,
                "user": user,
                "mfa_status": {"enabled": False, "backupCodesRemaining": 0},
                "setup_data": None,
                "error": None,
                "success": "Two-factor authentication disabled.",
                "publishable_key": publishable_key,
                "api_url": api_url,
            },
        )
    except Exception as e:
        return _templates(request).TemplateResponse(
            "mfa.html",
            {
                "request": request,
                "user": user,
                "mfa_status": {"enabled": True, "backupCodesRemaining": 0},
                "setup_data": None,
                "error": str(e) or "Failed to disable MFA.",
                "success": None,
                "publishable_key": publishable_key,
                "api_url": api_url,
            },
        )


# ---------------------------------------------------------------------------
# Sessions routes
# ---------------------------------------------------------------------------


@router.get("/sessions", response_class=HTMLResponse)
async def sessions_page(request: Request):
    user = await get_current_user(request)
    if not user:
        return RedirectResponse("/sign-in", status_code=302)

    token = request.cookies.get("authon_token", "")
    api_url = _api_url(request)
    publishable_key = _publishable_key(request)

    sessions = []
    error = None
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"{api_url}/v1/auth/me/sessions",
                headers={
                    "x-api-key": publishable_key,
                    "Authorization": f"Bearer {token}",
                },
                timeout=10,
            )
        if not r.is_success:
            raise Exception(f"API {r.status_code}")
        sessions = r.json()
    except Exception as e:
        error = str(e) or "Failed to load sessions."

    return _templates(request).TemplateResponse(
        "sessions.html",
        {
            "request": request,
            "user": user,
            "sessions": sessions,
            "error": error,
            "success": request.query_params.get("revoked") and "Session revoked.",
            "publishable_key": publishable_key,
            "api_url": api_url,
        },
    )


@router.post("/sessions/revoke")
async def sessions_revoke(request: Request, sessionId: Optional[str] = Form(None)):
    user = await get_current_user(request)
    if not user:
        return RedirectResponse("/sign-in", status_code=302)

    if not sessionId:
        return RedirectResponse("/sessions", status_code=302)

    token = request.cookies.get("authon_token", "")
    api_url = _api_url(request)
    publishable_key = _publishable_key(request)

    try:
        async with httpx.AsyncClient() as client:
            r = await client.delete(
                f"{api_url}/v1/auth/me/sessions/{sessionId}",
                headers={
                    "x-api-key": publishable_key,
                    "Authorization": f"Bearer {token}",
                },
                timeout=10,
            )
        if not r.is_success and r.status_code != 204:
            raise Exception(f"API {r.status_code}")
        return RedirectResponse("/sessions?revoked=1", status_code=302)
    except Exception:
        return RedirectResponse("/sessions?error=1", status_code=302)


# ---------------------------------------------------------------------------
# Delete account routes
# ---------------------------------------------------------------------------


@router.get("/delete-account", response_class=HTMLResponse)
async def delete_account_page(request: Request):
    user = await get_current_user(request)
    if not user:
        return RedirectResponse("/sign-in", status_code=302)
    return _templates(request).TemplateResponse(
        "delete_account.html",
        {
            "request": request,
            "user": user,
            "error": None,
            "publishable_key": _publishable_key(request),
            "api_url": _api_url(request),
        },
    )


@router.post("/delete-account", response_class=HTMLResponse)
async def delete_account(request: Request, confirm: Optional[str] = Form(None)):
    user = await get_current_user(request)
    if not user:
        return RedirectResponse("/sign-in", status_code=302)

    if confirm != "DELETE":
        return _templates(request).TemplateResponse(
            "delete_account.html",
            {
                "request": request,
                "user": user,
                "error": "Please type DELETE to confirm account deletion.",
                "publishable_key": _publishable_key(request),
                "api_url": _api_url(request),
            },
        )

    try:
        await request.app.state.authon.users.delete(user.id)
        response = RedirectResponse("/sign-in?deleted=1", status_code=302)
        response.delete_cookie("authon_token")
        response.delete_cookie("authon_refresh_token")
        return response
    except Exception as e:
        return _templates(request).TemplateResponse(
            "delete_account.html",
            {
                "request": request,
                "user": user,
                "error": str(e) or "Failed to delete account.",
                "publishable_key": _publishable_key(request),
                "api_url": _api_url(request),
            },
        )


# ---------------------------------------------------------------------------
# Webhook route
# ---------------------------------------------------------------------------


@router.post("/webhook")
async def webhook(request: Request):
    signature = request.headers.get("x-authon-signature")
    secret = os.environ.get("AUTHON_WEBHOOK_SECRET")

    if not signature or not secret:
        return JSONResponse({"error": "Missing webhook headers or secret"}, status_code=400)

    payload = await request.body()

    try:
        event = request.app.state.authon.webhooks.verify(payload, signature, secret)
        print(f"Authon webhook event: {event.type} {event}")
        return JSONResponse({"received": True})
    except Exception:
        return JSONResponse({"error": "Invalid webhook signature"}, status_code=400)
