from django.contrib import admin
from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['target_type', 'target_id', 'reporter', 'created_at']
    list_filter = ['target_type']
    search_fields = ['target_id', 'reason', 'reporter__email']
    readonly_fields = ['created_at']
