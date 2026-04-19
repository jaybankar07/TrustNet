import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trustnet.settings')
django.setup()

from django.contrib.auth import get_user_model
from referrals.models import ReferralCode

User = get_user_model()

def seed_referrals():
    print("Awarding referral points to demo users...")
    
    users = User.objects.all()
    if not users.exists():
        print("No users found.")
        return

    for user in users:
        # Each user already has a ReferralCode via signal
        ref_code, created = ReferralCode.objects.get_or_create(user=user, defaults={'code': f"{user.name[:3].upper()}{random.randint(100,999)}"})
        
        # Give them some varied points
        points = random.choice([450, 320, 280, 150, 80])
        ref_code.reward_points = points
        ref_code.save()
        print(f"User {user.name} now has {points} referral points (Code: {ref_code.code}).")

    print("Success! Leaderboard populated.")

if __name__ == "__main__":
    seed_referrals()
