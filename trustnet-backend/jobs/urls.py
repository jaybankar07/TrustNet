from django.urls import path
from .views import JobListCreateView, JobDetailView, apply_to_job, MyApplicationsView

urlpatterns = [
    path('', JobListCreateView.as_view(), name='job-list'),
    path('<uuid:pk>/', JobDetailView.as_view(), name='job-detail'),
    path('<uuid:pk>/apply/', apply_to_job, name='job-apply'),
    path('my-applications/', MyApplicationsView.as_view(), name='my-applications'),
]
