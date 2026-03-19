from django.urls import include, path

urlpatterns = [
    path("", include("authapp.urls")),
]
