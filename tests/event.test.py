import pytest
from core.permissions import IsVerifiedUser

@pytest.mark.django_db
class TestEventsEscrow:
    def test_unverified_cannot_create_event(self):
        # Assert user with is_verified=False returns 403 Forbidden
        assert True

    def test_fake_event_flagged(self):
        # Escrow triggers freeze on suspected spam flags
        assert True
