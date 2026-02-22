"""
FastAPI dependency for Authup token verification.

Usage:
    from authup.middleware.fastapi import AuthupDependency

    authup_dep = AuthupDependency("sk_live_...")

    @app.get("/protected")
    async def protected(user: AuthupUser = Depends(authup_dep)):
        return {"email": user.email}
"""

from typing import Optional

from ..async_client import AsyncAuthupBackend
from ..types import AuthupUser


class AuthupDependency:
    """
    FastAPI dependency that verifies the Authorization header
    and returns an AuthupUser.
    """

    def __init__(
        self,
        secret_key: str,
        api_url: str = "https://api.authup.dev",
    ) -> None:
        self._client = AsyncAuthupBackend(secret_key, api_url)

    async def __call__(
        self,
        authorization: Optional[str] = None,
    ) -> AuthupUser:
        # FastAPI with Header dependency
        # Users should use: Depends(authup_dep) with proper header extraction
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
