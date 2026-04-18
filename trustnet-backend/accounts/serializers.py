from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, VerificationRequest


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'email', 'password', 'role', 'phone_no', 'ceo_name', 'company_type', 'gst_no', 'city']

    def validate_role(self, value):
        if value not in ['user', 'company_admin']:
            return 'user'
        return value

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            is_verified=True, 
            verification_status='verified', 
            **validated_data
        )
        if user.role == 'company_admin':
            from companies.models import Company
            Company.objects.create(
                name=user.name,
                owner=user,
                description=f"Official profile for {user.name}"
            )
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    connections_count = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'name', 'email', 'role', 'is_verified',
            'verification_status', 'trust_score', 'bio', 'avatar_url', 'date_joined',
            'followers_count', 'connections_count'
        ]
        read_only_fields = [
            'id', 'email', 'role', 'is_verified',
            'verification_status', 'trust_score', 'date_joined'
        ]

    def get_followers_count(self, obj):
        return obj.follower_connections.count()

    def get_connections_count(self, obj):
        return obj.following_connections.count()


class PublicUserSerializer(serializers.ModelSerializer):
    """Minimal public-facing user info."""
    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'is_verified', 'trust_score', 'avatar_url']


class VerificationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationRequest
        fields = ['id', 'face_image', 'face_image_url', 'status', 'created_at', 'notes']
        read_only_fields = ['id', 'status', 'created_at']

    def validate(self, attrs):
        if not attrs.get('face_image') and not attrs.get('face_image_url'):
            raise serializers.ValidationError(
                "Provide either face_image (file upload) or face_image_url."
            )
        return attrs


class AdminVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationRequest
        fields = ['id', 'user', 'status', 'notes', 'reviewed_at']
        read_only_fields = ['id', 'user', 'reviewed_at']
