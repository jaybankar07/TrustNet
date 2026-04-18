from django.contrib import admin
from .models import Wallet, Transaction, Coupon


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ['user', 'balance', 'updated_at']
    search_fields = ['user__email']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['wallet', 'amount', 'type', 'description', 'created_at']
    list_filter = ['type']
    search_fields = ['wallet__user__email', 'description']


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_amount', 'is_active', 'expires_at']
    list_filter = ['is_active']
    search_fields = ['code']
