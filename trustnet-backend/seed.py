import os
import django
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trustnet.settings')
django.setup()

from django.contrib.auth import get_user_model
from feed.models import Post
from events.models import Event
from jobs.models import Job
from companies.models import Company

User = get_user_model()

def seed():
    print("Re-generating realistic Hackathon presentation data...")

    # Get or create a superuser / verified users
    users = list(User.objects.all())
    if not users:
        u1 = User.objects.create_user(email="founder@test.com", password="pwd", name="Alex Carter", is_verified=True, verification_status='verified', role="company_admin", title="CEO at TechFlow")
        u2 = User.objects.create_user(email="dev@test.com", password="pwd", name="Jordan Lee", is_verified=True, verification_status='verified', role="user", title="Senior Engineer")
        users = [u1, u2]
    
    author = users[0]
    dev = users[1] if len(users) > 1 else users[0]

    # Create Companies if none
    if not Company.objects.exists():
        Company.objects.create(name="TechFlow Solutions", owner=author, description="AI driven backend APIs.", industry="tech")
        Company.objects.create(name="Nexus Cyber", owner=dev, description="Cybersecurity audits.", industry="security")

    comp1 = Company.objects.first()
    comp2 = Company.objects.last()

    now = timezone.now()

    # Create Posts
    Post.objects.create(
        user=author,
        content="Just officially launched our new AI scaling server! Expect latency to drop by 40% globally. #AI #Scaling #ProductLaunch",
        post_type="update",
        created_at=now - timedelta(hours=2)
    )
    Post.objects.create(
        user=dev,
        content="Looking for recommendations on the best Edge computing frameworks right now. Has anyone benchmarked Vercel vs Cloudflare Workers for raw throughput? #Dev #Cloudflare #Vercel",
        post_type="update",
        created_at=now - timedelta(hours=5)
    )
    Post.objects.create(
        user=author,
        content="I believe strict identity verification is going to completely change B2B networking. It's time to end synthetic bot profiles. What do you think?",
        post_type="poll",
        poll_data={"options": [{"text": "100% Agree", "votes": 42}, {"text": "Privacy concerns", "votes": 12}]},
        created_at=now - timedelta(days=1)
    )

    # Create Jobs
    Job.objects.create(
        company=comp1,
        title="Senior AI Architect",
        description="We are looking for an experienced architect to lead our multi-agent framework integration. Must have deep expertise in PyTorch and LLM inference pipelines.",
        location="Remote",
        salary_range="$140,000 - $190,000",
        job_type="full_time",
        work_mode="remote",
        is_active=True
    )
    Job.objects.create(
        company=comp1,
        title="Lead Product Designer",
        description="Looking for an aesthetic master to completely re-vamp our TanStack frontend. Glassmorphism and micro-animations required.",
        location="New York / Hybrid",
        salary_range="$110,000 - $150,000",
        job_type="full_time",
        work_mode="hybrid",
        is_active=True
    )

    # Create Events
    Event.objects.create(
        title="DevClash 2k26 Final Demo Day",
        description="Join us for the final presentation of the top hackathon projects! Watch as teams demo their verified networking solutions live.",
        organizer=author,
        category="Hackathon",
        date=now + timedelta(days=2),
        location="Virtual (Zoom)",
        is_online=True,
        max_attendees=500
    )
    Event.objects.create(
        title="B2B Founder Mixer",
        description="An exclusive mixer for verified startup founders and seed-stage investors to bypass middlemen and talk term sheets.",
        organizer=comp2.owner,
        category="Networking",
        date=now + timedelta(days=5),
        location="San Francisco Tech Hub",
        is_online=False,
        max_attendees=50
    )

    print("Success! Created Mock Posts, Jobs, and Events natively in Django! Refresh the page!")

if __name__ == "__main__":
    seed()
