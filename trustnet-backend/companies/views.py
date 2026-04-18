from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.permissions import IsAdminRole, IsVerifiedUser, IsOwnerOrAdmin
from .models import Company, CompanyClaim, B2BProject, B2BProposal, InvestmentPitch
from .serializers import CompanySerializer, CompanyClaimSerializer, B2BProjectSerializer, B2BProposalSerializer, InvestmentPitchSerializer
from rest_framework import viewsets


class CompanyListCreateView(generics.ListCreateAPIView):
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]
    queryset = Company.objects.select_related('owner').all()
    search_fields = ['name', 'description']

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class CompanyDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    queryset = Company.objects.all()

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH'):
            return [IsAuthenticated(), IsOwnerOrAdmin()]
        return [IsAuthenticated()]


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_claim(request, pk):
    try:
        company = Company.objects.get(pk=pk)
    except Company.DoesNotExist:
        return Response({'detail': 'Company not found.'}, status=404)

    serializer = CompanyClaimSerializer(data={'company': company.id, **request.data})
    serializer.is_valid(raise_exception=True)
    serializer.save(user=request.user, company=company)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PATCH'])
@permission_classes([IsAdminRole])
def admin_review_claim(request, pk):
    try:
        claim = CompanyClaim.objects.select_related('user', 'company').get(pk=pk)
    except CompanyClaim.DoesNotExist:
        return Response({'detail': 'Claim not found.'}, status=404)

    action = request.data.get('action')
    if action == 'approve':
        claim.status = 'approved'
        claim.company.owner = claim.user
        claim.company.save(update_fields=['owner'])
        claim.user.role = 'company_admin'
        claim.user.save(update_fields=['role'])
    elif action == 'reject':
        claim.status = 'rejected'
    else:
        return Response({'detail': 'action must be "approve" or "reject".'}, status=400)

    claim.save(update_fields=['status'])
    claim.save(update_fields=['status'])
    return Response({'detail': f'Claim {action}d.'})


class B2BProjectViewSet(viewsets.ModelViewSet):
    serializer_class = B2BProjectSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return B2BProject.objects.all().order_by('-created_at')

class B2BProposalViewSet(viewsets.ModelViewSet):
    serializer_class = B2BProposalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return B2BProposal.objects.all().order_by('-created_at')

class InvestmentPitchViewSet(viewsets.ModelViewSet):
    serializer_class = InvestmentPitchSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return InvestmentPitch.objects.all().order_by('-created_at')
