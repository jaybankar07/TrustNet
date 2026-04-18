from django.contrib import admin
from .models import ReferralCode, ReferralUsage


@admin.register(ReferralCode)
class ReferralCodeAdmin(admin.ModelAdmin):
    list_display = ['user', 'code', 'reward_points', 'created_at']
    search_fields = ['user__email', 'code']


@admin.register(ReferralUsage)
class ReferralUsageAdmin(admin.ModelAdmin):
    list_display = ['code', 'used_by', 'used_at']
    search_fields = ['used_by__email', 'code__code']
