import uuid
from django.db import models
from django.conf import settings


class Report(models.Model):
    TARGET_CHOICES = [
        ('user', 'User'),
        ('event', 'Event'),
        ('post', 'Post'),
        ('company', 'Company'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='filed_reports'
    )
    target_type = models.CharField(max_length=20, choices=TARGET_CHOICES)
    target_id = models.CharField(max_length=36)  # UUID stored as string
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reports'
        indexes = [
            models.Index(fields=['target_type', 'target_id']),
            models.Index(fields=['reporter']),
        ]

    def __str__(self):
        return f"Report({self.target_type}:{self.target_id})"
