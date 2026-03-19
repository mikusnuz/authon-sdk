from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("sign-in", views.sign_in, name="sign_in"),
    path("sign-up", views.sign_up, name="sign_up"),
    path("sign-out", views.sign_out, name="sign_out"),
    path("reset-password", views.reset_password, name="reset_password"),
    path("profile", views.profile, name="profile"),
    path("mfa", views.mfa, name="mfa"),
    path("mfa/setup", views.mfa_setup, name="mfa_setup"),
    path("mfa/verify", views.mfa_verify, name="mfa_verify"),
    path("mfa/disable", views.mfa_disable, name="mfa_disable"),
    path("sessions", views.sessions, name="sessions"),
    path("sessions/revoke", views.sessions_revoke, name="sessions_revoke"),
    path("delete-account", views.delete_account, name="delete_account"),
    path("api/set-token", views.set_token, name="set_token"),
    path("webhook", views.webhook, name="webhook"),
]
