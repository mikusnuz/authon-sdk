"""
Flask decorator for Authup token verification.

Usage:
    from authup.middleware.flask import flask_authup_required

    authup = AuthupBackend("sk_live_...")

    @app.route("/protected")
    @flask_authup_required(authup)
    def protected():
        from flask import g
        user = g.authup_user  # AuthupUser instance
        return {"email": user.email}
"""

from functools import wraps
from typing import Any, Callable

from ..client import AuthupBackend
from ..types import AuthupUser


def flask_authup_required(
    authup: AuthupBackend,
) -> Callable[..., Any]:
    """
    Decorator that verifies the Authorization header and stores
    the AuthupUser in `flask.g.authup_user`.
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
                user: AuthupUser = authup.verify_token(token)
                g.authup_user = user
            except Exception:
                return jsonify({"error": "Invalid token"}), 401

            return f(*args, **kwargs)

        return wrapper

    return decorator
