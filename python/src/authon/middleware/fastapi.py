"""
FastAPI dependency for Authon token verification.

Usage:
    from authon.middleware.fastapi import AuthonDependency

    authon_dep = AuthonDependency("sk_live_...")

    @app.get("/protected")
    async def protected(user: AuthonUser = Depends(authon_dep)):
        return {"email": user.email}
"""

from typing import Optional

from ..async_client import AsyncAuthonBackend
from ..types import AuthonUser


class AuthonDependency:
    """
    FastAPI dependency that verifies the Authorization header
    and returns an AuthonUser.
    """

    def __init__(
        self,
        secret_key: str,
        api_url: str = "https://api.authon.dev",
    ) -> None:
        self._client = AsyncAuthonBackend(secret_key, api_url)

    async def __call__(
        self,
        authorization: Optional[str] = None,
    ) -> AuthonUser:
        # FastAPI with Header dependency
        # Users should use: Depends(authon_dep) with proper header extraction
        if not authorization:
            # Try to get from request directly
            raise _http_exception(401, "Missing authorization header")

        if not authorization.startswith("Bearer "):
            raise _http_exception(401, "Invalid authorization format")

        token = authorization[7:]  # Strip "Bearer "

        try:
            return await self._client.verify_token(token)
        except Exception:
            raise _http_exception(401, "Invalid token")


def _http_exception(status_code: int, detail: str) -> Exception:
    """Create an HTTPException without importing FastAPI at module level."""
    try:
        from fastapi import HTTPException  # type: ignore

        return HTTPException(status_code=status_code, detail=detail)
    except ImportError:
        return Exception(detail)
