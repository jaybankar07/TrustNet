from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, VerificationRequest, OfficialGSTData


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'name', 'role', 'is_verified', 'verification_status', 'trust_score', 'date_joined']
    list_filter = ['role', 'is_verified', 'verification_status']
    search_fields = ['email', 'name']
    ordering = ['-date_joined']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('name', 'bio', 'avatar_url')}),
        ('Trust & Verification', {'fields': ('is_verified', 'verification_status', 'trust_score', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {'classes': ('wide',), 'fields': ('email', 'name', 'password1', 'password2', 'role')}),
    )


@admin.register(VerificationRequest)
class VerificationRequestAdmin(admin.ModelAdmin):
    list_display = ['user', 'status', 'reviewed_by', 'reviewed_at', 'created_at']
    list_filter = ['status']
    search_fields = ['user__email', 'user__name']
    readonly_fields = ['created_at', 'reviewed_at']
    actions = ['approve_verifications', 'reject_verifications']

    @admin.action(description='Approve selected verifications')
    def approve_verifications(self, request, queryset):
        from django.utils import timezone
        from core.trust_service import calculate_user_trust_score
        for vr in queryset:
            vr.status = 'verified'
            vr.reviewed_by = request.user
            vr.reviewed_at = timezone.now()
            vr.save()
            vr.user.is_verified = True
            vr.user.verification_status = 'verified'
            vr.user.save(update_fields=['is_verified', 'verification_status'])
            calculate_user_trust_score(vr.user)
        self.message_user(request, f"{queryset.count()} verification(s) approved.")

    @admin.action(description='Reject selected verifications')
    def reject_verifications(self, request, queryset):
        from django.utils import timezone
        for vr in queryset:
            vr.status = 'rejected'
            vr.reviewed_by = request.user
            vr.reviewed_at = timezone.now()
            vr.save()
            vr.user.verification_status = 'rejected'
            vr.user.save(update_fields=['verification_status'])
        self.message_user(request, f"{queryset.count()} verification(s) rejected.")

@admin.register(OfficialGSTData)
class OfficialGSTDataAdmin(admin.ModelAdmin):
    list_display = ['gstin', 'company_name', 'city', 'state', 'status']
    search_fields = ['gstin', 'company_name']
