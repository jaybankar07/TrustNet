from django.urls import path
from .views import wallet_detail, TransactionHistoryView, add_credits, redeem_coupon

urlpatterns = [
    path('', wallet_detail, name='wallet-detail'),
    path('transactions/', TransactionHistoryView.as_view(), name='wallet-transactions'),
    path('add-credits/', add_credits, name='wallet-add-credits'),
    path('redeem-coupon/', redeem_coupon, name='wallet-redeem-coupon'),
]
