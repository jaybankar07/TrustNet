from rest_framework import serializers
from accounts.serializers import PublicUserSerializer, UserProfileSerializer
from .models import Company, CompanyClaim, B2BProject, B2BProposal, InvestmentPitch


class CompanySerializer(serializers.ModelSerializer):
    owner = PublicUserSerializer(read_only=True)

    class Meta:
        model = Company
        fields = ['id', 'name', 'description', 'logo_url', 'website', 'owner',
                  'trust_score', 'is_verified', 'created_at']
        read_only_fields = ['id', 'owner', 'trust_score', 'is_verified', 'created_at']


class CompanyClaimSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    company = CompanySerializer(read_only=True)
    
    class Meta:
        model = CompanyClaim
        fields = ['id', 'company', 'status', 'evidence', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']

class B2BProjectSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    
    class Meta:
        model = B2BProject
        fields = '__all__'
        read_only_fields = ['is_open', 'created_at']

class B2BProposalSerializer(serializers.ModelSerializer):
    bidding_company = CompanySerializer(read_only=True)
    
    class Meta:
        model = B2BProposal
        fields = '__all__'
        read_only_fields = ['status', 'created_at', 'project']

class InvestmentPitchSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    founder = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = InvestmentPitch
        fields = '__all__'
        read_only_fields = ['created_at']
