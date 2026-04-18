from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EventListCreateView, EventDetailView, register_for_event, report_event,
    EventTicketViewSet, EscrowPaymentViewSet
)

router = DefaultRouter()
router.register(r'tickets', EventTicketViewSet, basename='event-ticket')
router.register(r'escrow', EscrowPaymentViewSet, basename='escrow-payment')

urlpatterns = [
    path('', EventListCreateView.as_view(), name='event-list'),
    path('<uuid:pk>/', EventDetailView.as_view(), name='event-detail'),
    path('<uuid:pk>/register/', register_for_event, name='event-register'),
    path('<uuid:pk>/report/', report_event, name='event-report'),
    path('', include(router.urls)),
]
