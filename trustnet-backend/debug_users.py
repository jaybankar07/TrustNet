import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trustnet.settings')
django.setup()

from accounts.models import CustomUser

users = CustomUser.objects.all()
print("=== USERS IN DB ===")
for u in users:
    print(f"Email: {u.email} | Name: {u.name} | Role: {u.role}")

email = "admin@trustnet.com"
password = "password123"

if not CustomUser.objects.filter(email=email).exists():
    CustomUser.objects.create_superuser(email=email, name="Admin Setup", password=password)
    print(f"Created Superuser: {email} / {password}")
else:
    u = CustomUser.objects.get(email=email)
    u.set_password(password)
    u.is_active = True
    u.save()
    print(f"Reset password for existing user: {email} / {password}")
