from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.permissions import IsCompanyAdmin, IsVerifiedUser
from .models import Job, Application
from .serializers import JobSerializer, ApplicationSerializer


class JobListCreateView(generics.ListCreateAPIView):
    serializer_class = JobSerializer
    queryset = Job.objects.select_related('company', 'posted_by').filter(is_active=True)
    search_fields = ['title', 'description', 'location']
    filterset_fields = ['is_active']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsVerifiedUser()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        from companies.models import Company
        from accounts.models import OfficialGSTData
        from rest_framework.exceptions import ValidationError
        
        validated = serializer.validated_data
        company_id = validated.pop('company_id', None)
        company_name_input = validated.pop('company_name_input', None)
        city_input = validated.pop('city_input', None)

        company = None
        if company_id:
            try:
                company = Company.objects.get(pk=company_id)
            except Company.DoesNotExist:
                pass

        if company is None and company_name_input and city_input:
            # Match company name and city against official GST data in DB
            is_valid = OfficialGSTData.objects.filter(
                company_name__iexact=company_name_input,
                city__iexact=city_input
            ).exists()
            
            if not is_valid:
                raise ValidationError({'detail': 'Company name and city do not match our official records.'})

            # Validated officially. Get or create the actual Company record for the job.
            company = Company.objects.filter(name__iexact=company_name_input).first()
            if not company:
                company = Company.objects.create(name=company_name_input, is_verified=True)

        if company is None:
            raise ValidationError({'detail': 'You must provide a valid company name and city.'})

        serializer.save(posted_by=self.request.user, company=company)


class JobDetailView(generics.RetrieveAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]
    queryset = Job.objects.select_related('company')


@api_view(['POST'])
@permission_classes([IsVerifiedUser])
def apply_to_job(request, pk):
    try:
        job = Job.objects.get(pk=pk, is_active=True)
    except Job.DoesNotExist:
        return Response({'detail': 'Job not found or inactive.'}, status=404)

    if Application.objects.filter(job=job, applicant=request.user).exists():
        return Response({'detail': 'Already applied to this job.'}, status=400)

    serializer = ApplicationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(job=job, applicant=request.user)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


class MyApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(applicant=self.request.user).select_related('job')
