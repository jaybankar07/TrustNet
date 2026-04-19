"""
Trust score calculation service for TrustNet.
All score mutations go through this module — scores are always persisted to DB.
"""
from django.db.models import Count


def calculate_user_trust_score(user) -> int:
    """
    Compute and PERSIST trust score for a user.
    Returns the new score.
    """
    score = 10

    if user.is_verified:
        score += 40

    posts_count = getattr(user, 'posts', None)
    if posts_count is not None:
        posts_bonus = min(user.posts.count() * 2, 20)
        score += posts_bonus

    events_count = getattr(user, 'organized_events', None)
    if events_count is not None:
        events_bonus = min(user.organized_events.count() * 3, 15)
        score += events_bonus

    try:
        referral_bonus = min(user.referral_code.usages.count(), 10)
        score += referral_bonus
    except Exception:
        pass

    from trust.models import Report
    reports_against = Report.objects.filter(target_type='user', target_id=str(user.id)).count()
    score -= reports_against * 5

    score = max(0, min(100, score))

    user.trust_score = score
    user.save(update_fields=['trust_score'])

    return score


def calculate_event_trust_score(event) -> int:
    """
    Compute and PERSIST trust score for an event.
    Formula: min(100, organizer.trust_score * 0.6 + registrations_count * 2)
    """
    organizer_score = event.organizer.trust_score
    reg_count = event.registrations.count()
    score = int(min(100, organizer_score * 0.6 + reg_count * 2))

    is_flagged = event.reports_count > 5 or score < 25

    event.trust_score = score
    event.is_flagged = is_flagged
    event.save(update_fields=['trust_score', 'is_flagged'])

    return score


def flag_user_if_needed(user):
    """Check fraud thresholds and update is_verified if flagged."""
    from trust.models import Report
    reports_count = Report.objects.filter(
        target_type='user', target_id=str(user.id)
    ).count()
    if user.trust_score < 20 or reports_count > 5:
        user.is_verified = False
        user.verification_status = 'rejected'
        user.save(update_fields=['is_verified', 'verification_status'])
