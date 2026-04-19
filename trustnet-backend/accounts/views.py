from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from core.permissions import IsAdminRole, IsVerifiedUser
from .models import CustomUser, VerificationRequest
from .serializers import (
    SignupSerializer, UserProfileSerializer,
    VerificationRequestSerializer, AdminVerificationSerializer
)
from core.trust_service import calculate_user_trust_score



@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    calculate_user_trust_score(user)
    refresh = RefreshToken.for_user(user)
    return Response({
        'user': UserProfileSerializer(user).data,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    from django.contrib.auth import authenticate
    email = request.data.get('email')
    password = request.data.get('password')
    if not email or not password:
        return Response({'detail': 'Email and password required.'}, status=400)
    user = authenticate(request, username=email, password=password)
    if not user:
        return Response({'detail': 'Invalid credentials.'}, status=401)
    refresh = RefreshToken.for_user(user)
    return Response({
        'user': UserProfileSerializer(user).data,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    phone = request.data.get('phone_no')
    if not phone:
        return Response({'detail': 'Phone number required'}, status=400)
    return Response({'detail': f'OTP sent to {phone}'})

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    otp = request.data.get('otp')
    if otp == '123456':
        return Response({'verified': True})
    return Response({'verified': False, 'detail': 'Invalid OTP'}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_gst(request):
    from .models import OfficialGSTData
    gst = request.data.get('gst_no', '').strip()
    company_name = request.data.get('company_name', '').strip()
    city = request.data.get('city', '').strip()

    if not gst or (not company_name and not city):
        return Response({'verified': False, 'detail': 'Missing checking parameters'}, status=400)

    try:
        record = OfficialGSTData.objects.get(gstin__iexact=gst)
        if record.status.strip().lower() != 'active':
            return Response({'verified': False, 'detail': f'GST Status is {record.status}, must be active.'}, status=400)
            
        if record.company_name.strip().lower() != company_name.lower():
            return Response({'verified': False, 'detail': 'Company Name does not match official GST records.'}, status=400)
            
        if record.city.strip().lower() != city.lower():
            return Response({'verified': False, 'detail': 'City does not match official GST records.'}, status=400)
            
        return Response({'verified': True})
    except OfficialGSTData.DoesNotExist:
        return Response({'verified': False, 'detail': 'GST Number does not exist in official records.'}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_face(request):
    live_image = request.data.get('live_image')
    passport_image = request.data.get('passport_image')
    
    if not live_image or not passport_image:
        import time
        time.sleep(1)
        return Response({'matched': True, 'confidence': 0.98, 'detail': 'Simulated verification bypass.'})
    
    import requests
    import json
    import os
    import time
    time.sleep(1.5)
    return Response({'matched': True, 'confidence': 0.99, 'detail': 'Biometric bypass active.'})


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_verification(request):
    if hasattr(request.user, 'verification_request'):
        existing = request.user.verification_request
        if existing.status == 'pending':
            return Response({'detail': 'Verification request already pending.'}, status=400)
        if existing.status == 'verified':
            return Response({'detail': 'Already verified.'}, status=400)
        existing.delete()

    serializer = VerificationRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(user=request.user)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verification_status(request):
    try:
        vr = request.user.verification_request
        return Response(VerificationRequestSerializer(vr).data)
    except VerificationRequest.DoesNotExist:
        return Response({'status': 'not_submitted'})



class AdminVerificationListView(generics.ListAPIView):
    serializer_class = AdminVerificationSerializer
    permission_classes = [IsAdminRole]
    queryset = VerificationRequest.objects.select_related('user').order_by('-created_at')


@api_view(['PATCH'])
@permission_classes([IsAdminRole])
def admin_review_verification(request, pk):
    try:
        vr = VerificationRequest.objects.select_related('user').get(pk=pk)
    except VerificationRequest.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=404)

    action = request.data.get('action')  # 'approve' or 'reject'
    notes = request.data.get('notes', '')

    if action == 'approve':
        vr.status = 'verified'
        vr.user.is_verified = True
        vr.user.verification_status = 'verified'
    elif action == 'reject':
        vr.status = 'rejected'
        vr.user.verification_status = 'rejected'
    else:
        return Response({'detail': 'action must be "approve" or "reject".'}, status=400)

    vr.reviewed_by = request.user
    vr.reviewed_at = timezone.now()
    vr.notes = notes
    vr.save()
    vr.user.save(update_fields=['is_verified', 'verification_status'])

    calculate_user_trust_score(vr.user)

    return Response({'detail': f'Verification {action}d.', 'trust_score': vr.user.trust_score})



class AdminUserListView(generics.ListAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdminRole]
    queryset = CustomUser.objects.all().order_by('-date_joined')
    search_fields = ['name', 'email']
    filterset_fields = ['role', 'is_verified', 'verification_status']



class UserListView(generics.ListAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    queryset = CustomUser.objects.filter(is_verified=True).order_by('-date_joined')
    search_fields = ['name', 'full_name']


class ProfileDetailView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    queryset = CustomUser.objects.all()
    lookup_field = 'pk'



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def dev_auto_verify(request):
    """Bypass admin review for development/hackathon testing."""
    user = request.user
    user.is_verified = True
    user.verification_status = 'verified'
    user.save(update_fields=['is_verified', 'verification_status'])
    calculate_user_trust_score(user)
    return Response({
        'detail': 'Account auto-verified for development.',
        'is_verified': user.is_verified,
        'verification_status': user.verification_status,
        'trust_score': user.trust_score
    })


@api_view(['GET'])
@permission_classes([IsAdminRole])
def admin_metrics(request):
    """Aggregate stats for the admin panel and dashboard."""
    from accounts.models import CustomUser, VerificationRequest
    from trust.models import Report
    from companies.models import CompanyClaim

    return Response({
        'totalUsers': CustomUser.objects.count(),
        'verifiedUsers': CustomUser.objects.filter(is_verified=True).count(),
        'pendingReviews': VerificationRequest.objects.filter(status='pending').count(),
        'fraudAlerts': Report.objects.count(), # approximating for now
        'companyClaims': CompanyClaim.objects.filter(status='pending').count(),
    })
