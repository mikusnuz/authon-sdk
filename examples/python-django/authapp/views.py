import json

from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from authon import AuthonBackend

authon = AuthonBackend(
    secret_key=settings.AUTHON_API_KEY,
    api_url=settings.AUTHON_API_URL,
)


def index(request):
    user = None
    token = request.COOKIES.get("authon_token")
    if token:
        try:
            user = authon.verify_token(token)
        except Exception:
            pass
    return render(
        request,
        "authapp/index.html",
        {
            "user": user,
            "project_id": settings.AUTHON_PROJECT_ID,
            "api_url": settings.AUTHON_API_URL,
        },
    )


@csrf_exempt
@require_http_methods(["POST"])
def set_token(request):
    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({"error": "invalid json"}, status=400)
    token = data.get("token")
    if not token:
        return JsonResponse({"error": "missing token"}, status=400)
    resp = JsonResponse({"ok": True})
    resp.set_cookie(
        "authon_token",
        token,
        httponly=True,
        samesite="Lax",
        max_age=3600,
    )
    return resp


@csrf_exempt
@require_http_methods(["POST"])
def signout(request):
    resp = redirect("/")
    resp.delete_cookie("authon_token")
    return resp


@csrf_exempt
@require_http_methods(["POST"])
def webhook(request):
    body = request.body
    sig = request.headers.get("X-Authon-Signature", "")
    try:
        event = authon.webhooks.verify(body, sig, settings.AUTHON_WEBHOOK_SECRET)
        print("Webhook received:", event)
        return JsonResponse({"ok": True})
    except ValueError:
        return JsonResponse({"error": "invalid signature"}, status=400)
