from .django import authup_login_required
from .flask import flask_authup_required
from .fastapi import AuthupDependency

__all__ = [
    "authup_login_required",
    "flask_authup_required",
    "AuthupDependency",
]
