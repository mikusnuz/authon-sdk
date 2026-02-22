"""
Django middleware/decorator for Authon token verification.

Usage:
    from authon.middleware.django import authon_login_required

    authon = AuthonBackend("sk_live_...")

    @authon_login_required(authon)
    def my_view(request):
        user = request.authon_user  # AuthonUser instance
        return JsonResponse({"email": user.email})
"""

from functools import wraps
from typing import Any, Callable

from ..client import AuthonBackend
from ..types import AuthonUser


def authon_login_required(
    authon: AuthonBackend,
) -> Callable[..., Any]:
    """
    Decorator that verifies the Authorization header and attaches
    the AuthonUser to `request.authon_user`.
    """

    def decorator(view_func: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(view_func)
        def wrapper(request: Any, *args: Any, **kwargs: Any) -> Any:
            auth_header = request.META.get("HTTP_AUTHORIZATION", "")
            if not auth_header.startswith("Bearer "):
                # Import here to avoid hard dependency
                from django.http import JsonResponse  # type: ignore

                return JsonResponse(
                    {"error": "Missing authorization header"}, status=401
                )

            token = auth_header[7:]  # Strip "Bearer "

            try:
                user: AuthonUser = authon.verify_token(token)
                request.authon_user = user  # type: ignore
            except Exception:
                from django.http import JsonResponse  # type: ignore

                return JsonResponse({"error": "Invalid token"}, status=401)

            return view_func(request, *args, **kwargs)

        return wrapper

    return decorator
