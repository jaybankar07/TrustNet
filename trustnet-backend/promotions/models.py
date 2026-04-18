import uuid
from django.db import models
from django.conf import settings

class Campaign(models.Model):
    STATUS_CHOICES = [('active', 'Active'), ('paused', 'Paused'), ('ended', 'Ended')]
    TARGET_TYPES = [('post', 'Post'), ('event', 'Event')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='campaigns'
    )
    target_type = models.CharField(max_length=10, choices=TARGET_TYPES)
    target_id = models.CharField(max_length=36)
    budget = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'campaigns'
        indexes = [models.Index(fields=['user']), models.Index(fields=['target_type', 'target_id'])]


class Promotion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.OneToOneField(Campaign, on_delete=models.CASCADE, related_name='promotion')
    impressions = models.PositiveIntegerField(default=0)
    clicks = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'promotions'
