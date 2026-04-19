from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import serializers as drf_serializers
from accounts.serializers import PublicUserSerializer

from core.trust_service import calculate_user_trust_score
from .models import ReferralCode, ReferralUsage


class ReferralCodeSerializer(drf_serializers.ModelSerializer):
    usages_count = drf_serializers.SerializerMethodField()
    user = PublicUserSerializer(read_only=True)

    class Meta:
        model = ReferralCode
        fields = ['id', 'user', 'code', 'reward_points', 'usages_count', 'created_at']

    def get_usages_count(self, obj):
        return obj.usages.count()


class ReferralUsageSerializer(drf_serializers.ModelSerializer):
    used_by_email = drf_serializers.CharField(source='used_by.email', read_only=True)

    class Meta:
        model = ReferralUsage
        fields = ['id', 'code', 'used_by_email', 'used_at']


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_referral_code(request):
    try:
        code = request.user.referral_code
        return Response(ReferralCodeSerializer(code).data)
    except ReferralCode.DoesNotExist:
        return Response({'detail': 'Referral code not found.'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def use_referral(request):
    code_str = request.data.get('code')
    if not code_str:
        return Response({'detail': 'code is required.'}, status=400)

    try:
        ref_code = ReferralCode.objects.select_related('user').get(code=code_str)
    except ReferralCode.DoesNotExist:
        return Response({'detail': 'Invalid referral code.'}, status=400)

    if ref_code.user == request.user:
        return Response({'detail': 'Cannot use your own referral code.'}, status=400)

    if ReferralUsage.objects.filter(code=ref_code, used_by=request.user).exists():
        return Response({'detail': 'Already used this referral code.'}, status=400)

    ReferralUsage.objects.create(code=ref_code, used_by=request.user)

    ref_code.reward_points += 10
    ref_code.save(update_fields=['reward_points'])

    try:
        wallet = ref_code.user.wallet
        wallet.balance += 5
        wallet.save(update_fields=['balance'])
        from wallet.models import Transaction
        Transaction.objects.create(
            wallet=wallet, amount=5, type='credit',
            description=f'Referral reward from {request.user.email}'
        )
    except Exception:
        pass

    calculate_user_trust_score(ref_code.user)

    return Response({'detail': 'Referral code applied successfully.'})


class ReferralHistoryView(generics.ListAPIView):
    serializer_class = ReferralUsageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ReferralUsage.objects.filter(
            code__user=self.request.user
        ).select_related('used_by').order_by('-used_at')

class ReferralLeaderboardView(generics.ListAPIView):
    serializer_class = ReferralCodeSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return ReferralCode.objects.select_related('user').order_by('-reward_points')[:10]
