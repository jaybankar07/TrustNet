import uuid
from django.db import models
from django.conf import settings


class ReferralCode(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='referral_code'
    )
    code = models.CharField(max_length=20, unique=True)
    reward_points = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'referral_codes'

    def __str__(self):
        return f"{self.user.email} → {self.code}"


class ReferralUsage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.ForeignKey(ReferralCode, on_delete=models.CASCADE, related_name='usages')
    used_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='used_referrals'
    )
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'referral_usages'
        constraints = [
            models.UniqueConstraint(fields=['code', 'used_by'], name='unique_referral_usage')
        ]

    def __str__(self):
        return f"{self.used_by.email} used {self.code.code}"
