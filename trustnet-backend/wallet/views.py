from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import serializers as drf_serializers

from core.permissions import IsAdminRole, IsVerifiedUser
from .models import Wallet, Transaction, Coupon


class WalletSerializer(drf_serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ['id', 'balance', 'updated_at']


class TransactionSerializer(drf_serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'type', 'description', 'created_at']


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wallet_detail(request):
    wallet, _ = Wallet.objects.get_or_create(user=request.user)
    return Response(WalletSerializer(wallet).data)


class TransactionHistoryView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            return self.request.user.wallet.transactions.all()
        except Wallet.DoesNotExist:
            return Transaction.objects.none()


@api_view(['POST'])
@permission_classes([IsAdminRole])
def add_credits(request):
    """Admin-only: manually add credits to a user's wallet."""
    user_id = request.data.get('user_id')
    amount = request.data.get('amount')
    description = request.data.get('description', 'Admin credit')
    if not user_id or not amount:
        return Response({'detail': 'user_id and amount required.'}, status=400)

    from accounts.models import CustomUser
    try:
        target_user = CustomUser.objects.get(pk=user_id)
    except CustomUser.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=404)

    wallet, _ = Wallet.objects.get_or_create(user=target_user)
    wallet.balance += float(amount)
    wallet.save(update_fields=['balance'])
    Transaction.objects.create(
        wallet=wallet, amount=amount, type='credit', description=description
    )
    return Response({'balance': wallet.balance})


@api_view(['POST'])
@permission_classes([IsVerifiedUser])
def redeem_coupon(request):
    code_str = request.data.get('code')
    if not code_str:
        return Response({'detail': 'code is required.'}, status=400)

    try:
        coupon = Coupon.objects.get(code=code_str, is_active=True)
    except Coupon.DoesNotExist:
        return Response({'detail': 'Invalid or inactive coupon.'}, status=400)

    if coupon.expires_at and coupon.expires_at < timezone.now():
        return Response({'detail': 'Coupon has expired.'}, status=400)

    if coupon.used_by.filter(pk=request.user.pk).exists():
        return Response({'detail': 'Coupon already redeemed.'}, status=400)

    wallet, _ = Wallet.objects.get_or_create(user=request.user)
    wallet.balance += coupon.discount_amount
    wallet.save(update_fields=['balance'])
    coupon.used_by.add(request.user)

    Transaction.objects.create(
        wallet=wallet, amount=coupon.discount_amount,
        type='credit', description=f'Coupon {coupon.code} redeemed'
    )
    return Response({'detail': 'Coupon redeemed.', 'credited': str(coupon.discount_amount)})
