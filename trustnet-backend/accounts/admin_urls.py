"""accounts/admin_urls.py — /admin-api/ endpoints"""
from django.urls import path
from .views import AdminVerificationListView, AdminUserListView, admin_review_verification, admin_metrics

urlpatterns = [
    path('overview/', admin_metrics, name='admin-overview'),
    path('users/', AdminUserListView.as_view(), name='admin-users'),
    path('verification/', AdminVerificationListView.as_view(), name='admin-verify-list'),
    path('verification/<uuid:pk>/', admin_review_verification, name='admin-verify-review'),
]
