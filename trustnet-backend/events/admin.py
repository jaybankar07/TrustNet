from django.contrib import admin
from .models import Event, Registration


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'organizer', 'date', 'trust_score', 'reports_count', 'is_flagged']
    list_filter = ['is_flagged', 'is_online']
    search_fields = ['title', 'organizer__email']
    readonly_fields = ['trust_score', 'reports_count']
    actions = ['unflag_events']

    @admin.action(description='Unflag selected events')
    def unflag_events(self, request, queryset):
        queryset.update(is_flagged=False)
        self.message_user(request, f"{queryset.count()} event(s) unflagged.")


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ['user', 'event', 'registered_at']
    search_fields = ['user__email', 'event__title']
