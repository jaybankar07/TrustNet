from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomUser


@receiver(post_save, sender=CustomUser)
def bootstrap_user(sender, instance, created, **kwargs):
    """On user creation: create wallet and referral code."""
    if created:
        from django.apps import apps
        import random, string

        Wallet = apps.get_model('wallet', 'Wallet')
        ReferralCode = apps.get_model('referrals', 'ReferralCode')

        Wallet.objects.get_or_create(user=instance)

        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        ReferralCode.objects.get_or_create(user=instance, defaults={'code': code})
