from rest_framework import serializers
from .models import Campaign, Promotion

class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = '__all__'

class CampaignSerializer(serializers.ModelSerializer):
    promotion = PromotionSerializer(read_only=True)
    
    class Meta:
        model = Campaign
        fields = '__all__'
        read_only_fields = ['user', 'status', 'created_at']
