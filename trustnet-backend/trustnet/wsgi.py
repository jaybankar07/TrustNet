"""
WSGI config for trustnet project.
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trustnet.settings')
application = get_wsgi_application()

# Alias for Vercel
app = application
