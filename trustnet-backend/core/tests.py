from django.test import TestCase, RequestFactory
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from core.trust_service import calculate_user_trust_score
from core.permissions import IsVerifiedUser
import unittest

User = get_user_model()

class TrustScoreEngineTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='testuser@example.com',
            name='John Doe',
            password='testpassword123',
            is_verified=False
        )

    def test_base_score_logic(self):
        """Test that unverified users start exactly at base limits."""
        score = calculate_user_trust_score(self.user)
        self.assertEqual(score, 10, "Base initial score should equal profile baseline without verification bonus")

    def test_verified_user_bump(self):
        """Test that passing biometric face verification cleanly spikes the algorithmic trust score."""
        self.user.verification_status = 'verified'
        self.user.is_verified = True
        self.user.save()
        score = calculate_user_trust_score(self.user)
        self.assertGreaterEqual(score, 50, "Verified user should immediately gain +40 trust bump")

class SecurityPermissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.unverified_user = User.objects.create_user(
            email='malicious@hacker.com',
            name='Fake Identity',
            password='Password1',
            is_verified=False
        )
        self.verified_user = User.objects.create_user(
            email='legit@ceo.com',
            name='Legit Founder',
            password='Password1',
            is_verified=True,
            verification_status='verified'
        )
        self.url = '/feed/posts/'

    def test_unverified_write_block(self):
        """Test that an unverified profile cannot inject spam/posts into the feed system."""
        self.client.force_authenticate(user=self.unverified_user)
        response = self.client.post(self.url, {'content': 'Spam test!'})
        self.assertEqual(response.status_code, 403, "Unverified user must be explicitly blocked from writing")

    def test_verified_write_allow(self):
        """Test that verified humans easily bypass security gates."""
        self.client.force_authenticate(user=self.verified_user)
        response = self.client.post(self.url, {'content': 'Official announcement.'})
        self.assertNotEqual(response.status_code, 403, "Verified users should seamlessly pass gateway checks")
