from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class AuthonUser:
    id: str
    project_id: str
    email: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    email_verified: bool = False
    phone_verified: bool = False
    is_banned: bool = False
    public_metadata: Optional[Dict[str, Any]] = None
    last_sign_in_at: Optional[str] = None
    sign_in_count: int = 0
    created_at: str = ""
    updated_at: str = ""

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AuthonUser":
        return cls(
            id=data["id"],
            project_id=data.get("projectId", ""),
            email=data.get("email"),
            display_name=data.get("displayName"),
            avatar_url=data.get("avatarUrl"),
            phone=data.get("phone"),
            email_verified=data.get("emailVerified", False),
            phone_verified=data.get("phoneVerified", False),
            is_banned=data.get("isBanned", False),
            public_metadata=data.get("publicMetadata"),
            last_sign_in_at=data.get("lastSignInAt"),
            sign_in_count=data.get("signInCount", 0),
            created_at=data.get("createdAt", ""),
            updated_at=data.get("updatedAt", ""),
        )


@dataclass
class AuthonSession:
    id: str
    user_id: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    device_name: Optional[str] = None
    last_active_at: Optional[str] = None
    created_at: str = ""
    expires_at: str = ""

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AuthonSession":
        return cls(
            id=data["id"],
            user_id=data.get("userId", ""),
            ip_address=data.get("ipAddress"),
            user_agent=data.get("userAgent"),
            device_name=data.get("deviceName"),
            last_active_at=data.get("lastActiveAt"),
            created_at=data.get("createdAt", ""),
            expires_at=data.get("expiresAt", ""),
        )


@dataclass
class WebhookEvent:
    id: str
    type: str
    project_id: str
    timestamp: str
    data: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "WebhookEvent":
        return cls(
            id=data["id"],
            type=data["type"],
            project_id=data.get("projectId", ""),
            timestamp=data.get("timestamp", ""),
            data=data.get("data", {}),
        )


@dataclass
class ListResult:
    data: List[AuthonUser]
    total: int
    page: int
    limit: int

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ListResult":
        return cls(
            data=[AuthonUser.from_dict(u) for u in data.get("data", [])],
            total=data.get("total", 0),
            page=data.get("page", 1),
            limit=data.get("limit", 20),
        )
