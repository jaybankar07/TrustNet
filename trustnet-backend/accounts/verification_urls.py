"""accounts/verification_urls.py — /verification/ endpoints"""
from django.urls import path
from .views import submit_verification, verification_status, dev_auto_verify

urlpatterns = [
    path('submit/', submit_verification, name='verification-submit'),
    path('status/', verification_status, name='verification-status'),
    path('dev-approve/', dev_auto_verify, name='dev-approve'),
]
