import os
import django
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trustnet.settings')
django.setup()

from django.contrib.auth import get_user_model
from feed.models import Post
from companies.models import Company, B2BProject, B2BProposal

User = get_user_model()

def seed():
    print("Seeding B2B, Funding, and additional Feed posts...")

    users = list(User.objects.all())
    if not users:
        print("No users found. Please create users first.")
        return

    author = users[0]
    dev = users[1] if len(users) > 1 else users[0]

    companies = list(Company.objects.all())
    if not companies:
        print("No companies found. Please run main seed.py first.")
        return

    comp1 = companies[0]
    comp2 = companies[-1]

    now = timezone.now()

    Post.objects.get_or_create(
        user=author,
        content="We just closed our Series A! $4.2M raised from verified investors through TrustNet's direct funding pipeline. Zero middlemen. Zero brokers. Pure trust. #FundingAnnouncement #SeriesA",
        defaults={"post_type": "update", "created_at": now - timedelta(hours=10)}
    )
    Post.objects.get_or_create(
        user=dev,
        content="Just posted two senior engineering roles at TechFlow. If you're a verified professional with 5+ years of backend experience, this is your call! #Hiring #SeniorEngineering",
        defaults={"post_type": "update", "created_at": now - timedelta(hours=14)}
    )
    Post.objects.get_or_create(
        user=author,
        content="The future of B2B is trust-gated collaboration, not cold emails. We just signed a 3-month consulting contract with another verified company entirely through TrustNet's B2B marketplace. #B2B #BusinessGrowth",
        defaults={"post_type": "update", "created_at": now - timedelta(days=2)}
    )
    Post.objects.get_or_create(
        user=dev,
        content="Hot take: Professional credentials without verifiable identity are worthless. TrustNet's biometric layer is the missing piece. #Identity #VerifiedProfessional #TrustNet",
        defaults={"post_type": "update", "created_at": now - timedelta(days=3)}
    )

    B2BProject.objects.get_or_create(
        company=comp1,
        title="AI Backend API Development",
        defaults={
            "description": "We need a specialized team to build and optimize our LLM inference pipeline for production scale. Must have MLOps certification.",
            "budget": 80000.00,
            "is_open": True,
        }
    )
    B2BProject.objects.get_or_create(
        company=comp1,
        title="Mobile App UI/UX Revamp",
        defaults={
            "description": "Complete design overhaul of our iOS and Android apps. Looking for a verified design agency with fintech experience.",
            "budget": 35000.00,
            "is_open": True,
        }
    )

    if B2BProject.objects.exists() and comp2:
        project = B2BProject.objects.first()
        B2BProposal.objects.get_or_create(
            project=project,
            bidding_company=comp2,
            defaults={
                "proposal_text": "We at Nexus Cyber have a dedicated 8-person ML engineering team with 3 years of production LLM tuning experience. We can deliver within 30 days.",
                "bid_amount": 72000.00,
                "status": "pending",
            }
        )

    from companies.models import InvestmentPitch
    InvestmentPitch.objects.get_or_create(
        company=comp1,
        defaults={
            "founder": author,
            "summary": "TechFlow is building the next generation of trust-gated AI agents. We have already reached $10k MRR and are looking for strategic seed investors.",
            "funding_goal": 500000.00,
            "equity_offered": 10.0,
            "pitch_deck_url": "https://example.com/pitch_deck.pdf"
        }
    )

    print("Success! B2B Projects, Proposals, and Feed posts created.")

if __name__ == "__main__":
    seed()
