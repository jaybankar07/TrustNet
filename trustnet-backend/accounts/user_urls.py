"""accounts/user_urls.py — /users/ endpoints"""
from django.urls import path
from .views import MeView

urlpatterns = [
    path('me/', MeView.as_view(), name='user-me'),
]
