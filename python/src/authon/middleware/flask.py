"""
Flask decorator for Authon token verification.

Usage:
    from authon.middleware.flask import flask_authon_required

    authon = AuthonBackend("sk_live_...")

    @app.route("/protected")
    @flask_authon_required(authon)
    def protected():
        from flask import g
        user = g.authon_user  # AuthonUser instance
        return {"email": user.email}
"""

from functools import wraps
from typing import Any, Callable

from ..client import AuthonBackend
from ..types import AuthonUser


def flask_authon_required(
    authon: AuthonBackend,
) -> Callable[..., Any]:
    """
    Decorator that verifies the Authorization header and stores
    the AuthonUser in `flask.g.authon_user`.
    """

    def decorator(f: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(f)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            from flask import g, request, jsonify  # type: ignore

            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                return jsonify({"error": "Missing authorization header"}), 401

            token = auth_header[7:]  # Strip "Bearer "

            try:
                user: AuthonUser = authon.verify_token(token)
                g.authon_user = user
            except Exception:
                return jsonify({"error": "Invalid token"}), 401

            return f(*args, **kwargs)

        return wrapper

    return decorator
