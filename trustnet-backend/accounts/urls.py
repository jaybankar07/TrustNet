"""accounts/urls.py — auth endpoints"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import signup, login, send_otp, verify_otp, verify_gst, verify_face, dev_auto_verify

urlpatterns = [
    path('signup/', signup, name='signup'),
    path('login/', login, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('send-otp/', send_otp, name='send_otp'),
    path('verify-otp/', verify_otp, name='verify_otp'),
    path('verify-gst/', verify_gst, name='verify_gst'),
    path('verify-face/', verify_face, name='verify_face'),
    path('dev-auto-verify/', dev_auto_verify, name='dev_auto_verify'),
]
