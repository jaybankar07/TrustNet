from rest_framework import serializers
from accounts.serializers import PublicUserSerializer
from companies.serializers import CompanySerializer
from .models import Job, Application


class JobSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    # Allow posting by entering company name + city instead of needing a UUID
    company_name_input = serializers.CharField(write_only=True, required=False, allow_blank=True)
    city_input = serializers.CharField(write_only=True, required=False, allow_blank=True)
    # Expose plain name for display
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = Job
        fields = ['id', 'company', 'company_id', 'company_name', 'company_name_input', 'city_input',
                  'title', 'description', 'location', 'salary_range', 'job_type', 'work_mode',
                  'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class ApplicationSerializer(serializers.ModelSerializer):
    applicant = PublicUserSerializer(read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)

    class Meta:
        model = Application
        fields = ['id', 'job', 'job_title', 'applicant', 'cover_letter', 'status', 'applied_at']
        read_only_fields = ['id', 'applicant', 'status', 'applied_at']
