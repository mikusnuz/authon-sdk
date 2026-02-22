"""
Django middleware/decorator for Authup token verification.

Usage:
    from authup.middleware.django import authup_login_required

    authup = AuthupBackend("sk_live_...")

    @authup_login_required(authup)
    def my_view(request):
        user = request.authup_user  # AuthupUser instance
        return JsonResponse({"email": user.email})
"""

from functools import wraps
from typing import Any, Callable

from ..client import AuthupBackend
from ..types import AuthupUser


def authup_login_required(
    authup: AuthupBackend,
) -> Callable[..., Any]:
    """
    Decorator that verifies the Authorization header and attaches
    the AuthupUser to `request.authup_user`.
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
                user: AuthupUser = authup.verify_token(token)
                request.authup_user = user  # type: ignore
            except Exception:
                from django.http import JsonResponse  # type: ignore

                return JsonResponse({"error": "Invalid token"}, status=401)

            return view_func(request, *args, **kwargs)

        return wrapper

    return decorator
