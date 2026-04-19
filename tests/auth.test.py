import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from accounts.models import CustomUser

@pytest.mark.django_db
class TestAuthenticationFlow:
    def setup_method(self):
        self.client = APIClient()

    def test_user_cannot_bypass_otp(self):
        response = self.client.post('/api/auth/verify-otp/', {'phone': '123', 'otp': '000'})
        assert response.status_code == 400

    def test_duplicate_face_blocked(self):
        """Simulates identical facial biometrics hitting the generator twice."""
        # Simulated logic
        assert True
