import os
from pathlib import Path

from django.urls import include, path
from django.views.static import serve

STATIC_ROOT = Path(__file__).resolve().parent.parent / "authapp" / "static"

urlpatterns = [
    path("static/<path:path>", serve, {"document_root": STATIC_ROOT}),
    path("", include("authapp.urls")),
]
