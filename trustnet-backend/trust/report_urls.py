"""trust/report_urls.py — /reports/ endpoints"""
from django.urls import path
from .views import file_report

urlpatterns = [
    path('', file_report, name='report-create'),
]
