from django.contrib import admin
from .models import Company, CompanyClaim


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'trust_score', 'is_verified', 'created_at']
    list_filter = ['is_verified']
    search_fields = ['name', 'owner__email']


@admin.register(CompanyClaim)
class CompanyClaimAdmin(admin.ModelAdmin):
    list_display = ['company', 'user', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['company__name', 'user__email']
