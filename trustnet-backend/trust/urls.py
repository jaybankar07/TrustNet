"""trust/urls.py — /trust/ admin endpoints"""
from django.urls import path
from .views import AdminReportListView, ai_chat_assistant, profile_optimization_tips

urlpatterns = [
    path('reports/', AdminReportListView.as_view(), name='admin-reports'),
    path('chat/', ai_chat_assistant, name='ai-chat'),
    path('profile-tips/', profile_optimization_tips, name='profile-tips'),
]
