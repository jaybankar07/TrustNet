"""
Root URL configuration for TrustNet.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "TrustNet Django API is running on Vercel!"})

urlpatterns = [
    path('', health_check),
    path('admin/', admin.site.urls),

    path('auth/', include('accounts.urls')),

    path('users/', include('accounts.user_urls')),
    path('verification/', include('accounts.verification_urls')),

    path('trust/', include('trust.urls')),
    path('companies/', include('companies.urls')),
    path('feed/', include('feed.urls')),
    path('jobs/', include('jobs.urls')),
    path('events/', include('events.urls')),
    path('promotions/', include('promotions.urls')),
    path('referrals/', include('referrals.urls')),
    path('wallet/', include('wallet.urls')),

    path('reports/', include('trust.report_urls')),

    path('admin-api/', include('accounts.admin_urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
