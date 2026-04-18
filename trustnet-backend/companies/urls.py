from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CompanyListCreateView, CompanyDetailView, submit_claim, admin_review_claim,
    B2BProjectViewSet, B2BProposalViewSet, InvestmentPitchViewSet
)

router = DefaultRouter()
router.register(r'b2b/projects', B2BProjectViewSet, basename='b2b-project')
router.register(r'b2b/proposals', B2BProposalViewSet, basename='b2b-proposal')
router.register(r'funding', InvestmentPitchViewSet, basename='funding-pitch')

urlpatterns = [
    path('', CompanyListCreateView.as_view(), name='company-list'),
    path('<uuid:pk>/', CompanyDetailView.as_view(), name='company-detail'),
    path('<uuid:pk>/claim/', submit_claim, name='company-claim'),
    path('claims/<uuid:pk>/review/', admin_review_claim, name='claim-review'),
    path('', include(router.urls)),
]
