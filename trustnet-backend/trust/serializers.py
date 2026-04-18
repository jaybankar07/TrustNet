from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['id', 'target_type', 'target_id', 'reason', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_target_type(self, value):
        if value not in ('user', 'event', 'post', 'company'):
            raise serializers.ValidationError("Invalid target_type.")
        return value
