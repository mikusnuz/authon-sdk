from typing import Any, Dict, Optional

import httpx

from .types import AuthupUser, ListResult
from .webhook import verify_webhook as _verify_webhook
from .types import WebhookEvent


class _AsyncUsersAPI:
    """Async users API."""

    def __init__(self, client: "AsyncAuthupBackend") -> None:
        self._client = client

    async def list(
        self,
        page: Optional[int] = None,
        limit: Optional[int] = None,
        search: Optional[str] = None,
    ) -> ListResult:
        params: Dict[str, str] = {}
        if page is not None:
            params["page"] = str(page)
        if limit is not None:
            params["limit"] = str(limit)
        if search is not None:
            params["search"] = search
        data = await self._client._request("GET", "/v1/users", params=params)
        return ListResult.from_dict(data)

    async def get(self, user_id: str) -> AuthupUser:
        data = await self._client._request("GET", f"/v1/users/{user_id}")
        return AuthupUser.from_dict(data)

    async def create(
        self,
        email: str,
        password: Optional[str] = None,
        display_name: Optional[str] = None,
    ) -> AuthupUser:
        body: Dict[str, Any] = {"email": email}
        if password is not None:
            body["password"] = password
        if display_name is not None:
            body["displayName"] = display_name
        data = await self._client._request("POST", "/v1/users", json_body=body)
        return AuthupUser.from_dict(data)

    async def update(self, user_id: str, **kwargs: Any) -> AuthupUser:
        body: Dict[str, Any] = {}
        if "email" in kwargs:
            body["email"] = kwargs["email"]
        if "display_name" in kwargs:
            body["displayName"] = kwargs["display_name"]
        if "public_metadata" in kwargs:
            body["publicMetadata"] = kwargs["public_metadata"]
        data = await self._client._request("PATCH", f"/v1/users/{user_id}", json_body=body)
        return AuthupUser.from_dict(data)

    async def delete(self, user_id: str) -> None:
        await self._client._request("DELETE", f"/v1/users/{user_id}")

    async def ban(self, user_id: str, reason: Optional[str] = None) -> AuthupUser:
        body: Dict[str, Any] = {}
        if reason is not None:
            body["reason"] = reason
        data = await self._client._request("POST", f"/v1/users/{user_id}/ban", json_body=body)
        return AuthupUser.from_dict(data)

    async def unban(self, user_id: str) -> AuthupUser:
        data = await self._client._request("POST", f"/v1/users/{user_id}/unban")
        return AuthupUser.from_dict(data)


class _AsyncWebhooksAPI:
    """Async webhooks API."""

    def verify(
        self,
        payload: Any,
        signature: str,
        secret: str,
    ) -> WebhookEvent:
        return _verify_webhook(payload, signature, secret)


class AsyncAuthupBackend:
    """
    Asynchronous Authup backend client.

    Usage:
        from authup import AsyncAuthupBackend

        async with AsyncAuthupBackend("sk_live_...") as authup:
            user = await authup.verify_token("eyJ...")
            result = await authup.users.list(page=1, limit=10)
    """

    def __init__(
        self,
        secret_key: str,
        api_url: str = "https://api.authup.dev",
    ) -> None:
        self._secret_key = secret_key
        self._api_url = api_url.rstrip("/")
        self._http = httpx.AsyncClient(
            base_url=self._api_url,
            headers={
                "Content-Type": "application/json",
                "x-api-key": self._secret_key,
            },
            timeout=30.0,
        )
        self.users = _AsyncUsersAPI(self)
        self.webhooks = _AsyncWebhooksAPI()

    async def verify_token(self, access_token: str) -> AuthupUser:
        data = await self._request(
            "GET",
            "/v1/auth/token/verify",
            extra_headers={"Authorization": f"Bearer {access_token}"},
        )
        return AuthupUser.from_dict(data)

    async def _request(
        self,
        method: str,
        path: str,
        params: Optional[Dict[str, str]] = None,
        json_body: Optional[Dict[str, Any]] = None,
        extra_headers: Optional[Dict[str, str]] = None,
    ) -> Any:
        headers = dict(extra_headers) if extra_headers else {}
        response = await self._http.request(
            method,
            path,
            params=params,
            json=json_body,
            headers=headers,
        )
        if response.status_code >= 400:
            raise Exception(
                f"Authup API error {response.status_code}: {response.text}"
            )
        if response.status_code == 204:
            return None
        return response.json()

    async def close(self) -> None:
        await self._http.aclose()

    async def __aenter__(self) -> "AsyncAuthupBackend":
        return self

    async def __aexit__(self, *args: Any) -> None:
        await self.close()
