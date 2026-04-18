from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CampaignViewSet, boost_campaign

router = DefaultRouter()
router.register(r'campaigns', CampaignViewSet, basename='campaign')

urlpatterns = [
    path('', include(router.urls)),
    path('campaigns/<uuid:pk>/boost/', boost_campaign, name='campaign-boost'),
]
