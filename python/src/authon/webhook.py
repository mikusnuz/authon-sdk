import hashlib
import hmac
import json
from typing import Any, Dict, Union

from .types import WebhookEvent


def verify_webhook(
    payload: Union[str, bytes],
    signature: str,
    secret: str,
) -> WebhookEvent:
    """
    Verify an Authon webhook signature (HMAC-SHA256) and parse the event.

    Args:
        payload: Raw request body as string or bytes.
        signature: Value of the x-authon-signature header (e.g. "sha256=abc123...").
        secret: Webhook signing secret from the Authon dashboard.

    Returns:
        Parsed WebhookEvent.

    Raises:
        ValueError: If the signature is invalid.
    """
    body = payload if isinstance(payload, bytes) else payload.encode("utf-8")
    expected = hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()
    actual = signature.replace("sha256=", "")

    if not hmac.compare_digest(expected, actual):
        raise ValueError("Invalid webhook signature")

    data: Dict[str, Any] = json.loads(body)
    return WebhookEvent.from_dict(data)
