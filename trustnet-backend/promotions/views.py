from django.utils import timezone
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.permissions import IsVerifiedUser
import django.db.models as models

from .models import Campaign, Promotion
from .serializers import CampaignSerializer

class CampaignViewSet(viewsets.ModelViewSet):
    serializer_class = CampaignSerializer
    permission_classes = [IsVerifiedUser]

    def get_queryset(self):
        return Campaign.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        campaign = serializer.save(user=self.request.user)
        Promotion.objects.create(campaign=campaign)

    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        campaign = self.get_object()
        if campaign.status == 'active':
            campaign.status = 'paused'
        else:
            campaign.status = 'active'
        campaign.save()
        return Response({'status': campaign.status})

@api_view(['POST'])
@permission_classes([IsVerifiedUser])
def boost_campaign(request, pk):
    try:
        campaign = Campaign.objects.get(pk=pk, user=request.user)
        promo, _ = Promotion.objects.get_or_create(campaign=campaign)
        promo.impressions += 1
        promo.save(update_fields=['impressions'])
        return Response({'impressions': promo.impressions, 'clicks': promo.clicks})
    except Campaign.DoesNotExist:
        return Response({'detail': 'Campaign not found.'}, status=404)


