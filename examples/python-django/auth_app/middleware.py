from django.conf import settings
from authon import AuthonBackend


_backend = None


def get_backend() -> AuthonBackend:
    global _backend
    if _backend is None:
        _backend = AuthonBackend(
            secret_key=settings.AUTHON_SECRET_KEY,
            api_url=settings.AUTHON_API_URL,
        )
    return _backend


class AuthonMiddleware:
    """
    Reads the authon_token cookie and attaches the verified user to request.authon_user.
    If the token is missing or invalid, request.authon_user is set to None.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        token = request.COOKIES.get("authon_token")
        request.authon_user = None
        if token:
            try:
                request.authon_user = get_backend().verify_token(token)
            except Exception:
                pass
        return self.get_response(request)
