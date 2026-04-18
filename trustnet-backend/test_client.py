import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trustnet.settings')
django.setup()

from django.test import Client
import json

c = Client()
resp = c.post('/auth/login/', json.dumps({'email': 'bankarjay2304@gmail.com', 'password': 'password123'}), content_type='application/json')
print(resp.status_code)
print(resp.content.decode()[:1000])
