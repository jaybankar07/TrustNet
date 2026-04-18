import uuid
from django.db import models
from django.conf import settings


class Wallet(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wallet'
    )
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'wallets'

    def __str__(self):
        return f"Wallet({self.user.email}, balance={self.balance})"


class Transaction(models.Model):
    TYPE_CHOICES = [('credit', 'Credit'), ('debit', 'Debit')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'transactions'
        indexes = [models.Index(fields=['wallet']), models.Index(fields=['-created_at'])]
        ordering = ['-created_at']


class Coupon(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    used_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL, blank=True, related_name='used_coupons'
    )
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'coupons'

    def __str__(self):
        return f"Coupon({self.code}, {self.discount_amount})"
