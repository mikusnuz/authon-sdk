from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("auth/token", views.set_token, name="set_token"),
    path("auth/signout", views.signout, name="signout"),
    path("webhook", views.webhook, name="webhook"),
]
