from typing import Any, Dict, Optional

import httpx

from .types import AuthonUser, ListResult
from .webhook import verify_webhook as _verify_webhook
from .types import WebhookEvent


class _UsersAPI:
    """Sync users API."""

    def __init__(self, client: "AuthonBackend") -> None:
        self._client = client

    def list(
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
        data = self._client._request("GET", "/v1/users", params=params)
        return ListResult.from_dict(data)

    def get(self, user_id: str) -> AuthonUser:
        data = self._client._request("GET", f"/v1/users/{user_id}")
        return AuthonUser.from_dict(data)

    def create(
        self,
        email: str,
        password: Optional[str] = None,
        display_name: Optional[str] = None,
    ) -> AuthonUser:
        body: Dict[str, Any] = {"email": email}
        if password is not None:
            body["password"] = password
        if display_name is not None:
            body["displayName"] = display_name
        data = self._client._request("POST", "/v1/users", json_body=body)
        return AuthonUser.from_dict(data)

    def update(self, user_id: str, **kwargs: Any) -> AuthonUser:
        body: Dict[str, Any] = {}
        if "email" in kwargs:
            body["email"] = kwargs["email"]
        if "display_name" in kwargs:
            body["displayName"] = kwargs["display_name"]
        if "public_metadata" in kwargs:
            body["publicMetadata"] = kwargs["public_metadata"]
        data = self._client._request("PATCH", f"/v1/users/{user_id}", json_body=body)
        return AuthonUser.from_dict(data)

    def delete(self, user_id: str) -> None:
        self._client._request("DELETE", f"/v1/users/{user_id}")

    def ban(self, user_id: str, reason: Optional[str] = None) -> AuthonUser:
        body: Dict[str, Any] = {}
        if reason is not None:
            body["reason"] = reason
        data = self._client._request("POST", f"/v1/users/{user_id}/ban", json_body=body)
        return AuthonUser.from_dict(data)

    def unban(self, user_id: str) -> AuthonUser:
        data = self._client._request("POST", f"/v1/users/{user_id}/unban")
        return AuthonUser.from_dict(data)


class _WebhooksAPI:
    """Sync webhooks API."""

    def verify(
        self,
        payload: Any,
        signature: str,
        secret: str,
    ) -> WebhookEvent:
        return _verify_webhook(payload, signature, secret)


class AuthonBackend:
    """
    Synchronous Authon backend client.

    Usage:
        from authon import AuthonBackend

        authon = AuthonBackend("sk_live_...")

        # Verify a token
        user = authon.verify_token("eyJ...")

        # List users
        result = authon.users.list(page=1, limit=10)

        # Verify webhook
        event = authon.webhooks.verify(payload, signature, secret)
    """

    def __init__(
        self,
        secret_key: str,
        api_url: str = "https://api.authon.dev",
    ) -> None:
        self._secret_key = secret_key
        self._api_url = api_url.rstrip("/")
        self._http = httpx.Client(
            base_url=self._api_url,
            headers={
                "Content-Type": "application/json",
                "x-api-key": self._secret_key,
            },
            timeout=30.0,
        )
        self.users = _UsersAPI(self)
        self.webhooks = _WebhooksAPI()

    def verify_token(self, access_token: str) -> AuthonUser:
        data = self._request(
            "GET",
            "/v1/auth/token/verify",
            extra_headers={"Authorization": f"Bearer {access_token}"},
        )
        return AuthonUser.from_dict(data)

    def _request(
        self,
        method: str,
        path: str,
        params: Optional[Dict[str, str]] = None,
        json_body: Optional[Dict[str, Any]] = None,
        extra_headers: Optional[Dict[str, str]] = None,
    ) -> Any:
        headers = dict(extra_headers) if extra_headers else {}
        response = self._http.request(
            method,
            path,
            params=params,
            json=json_body,
            headers=headers,
        )
        if response.status_code >= 400:
            raise Exception(
                f"Authon API error {response.status_code}: {response.text}"
            )
        if response.status_code == 204:
            return None
        return response.json()

    def close(self) -> None:
        self._http.close()

    def __enter__(self) -> "AuthonBackend":
        return self

    def __exit__(self, *args: Any) -> None:
        self.close()
