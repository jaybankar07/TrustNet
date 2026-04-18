from django.contrib import admin
from .models import Campaign, Promotion


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ['user', 'target_type', 'target_id', 'status', 'budget', 'created_at']
    list_filter = ['status', 'target_type']


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ['campaign', 'impressions', 'clicks']
