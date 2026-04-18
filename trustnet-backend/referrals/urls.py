from django.urls import path
from .views import my_referral_code, use_referral, ReferralHistoryView, ReferralLeaderboardView

urlpatterns = [
    path('my-code/', my_referral_code, name='referral-my-code'),
    path('use/', use_referral, name='referral-use'),
    path('history/', ReferralHistoryView.as_view(), name='referral-history'),
    path('leaderboard/', ReferralLeaderboardView.as_view(), name='referral-leaderboard'),
]
