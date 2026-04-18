import uuid
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Company(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    logo_url = models.URLField(blank=True)
    website = models.URLField(blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='owned_companies'
    )
    trust_score = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    reports_count = models.PositiveIntegerField(default=0)
    is_verified = models.BooleanField(default=False)
    is_seeking_funding = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'companies'
        indexes = [models.Index(fields=['owner'])]
        verbose_name_plural = 'companies'

    def __str__(self):
        return self.name


class CompanyClaim(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='claims')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='company_claims'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    evidence = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'company_claims'
        constraints = [
            models.UniqueConstraint(fields=['company', 'user'], name='unique_company_claim')
        ]

    def __str__(self):
        return f"Claim({self.user.email} -> {self.company.name}, {self.status})"


class B2BProject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='b2b_projects')
    title = models.CharField(max_length=255)
    description = models.TextField()
    budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    is_open = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'b2b_projects'


class B2BProposal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(B2BProject, on_delete=models.CASCADE, related_name='proposals')
    bidding_company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='submitted_proposals')
    proposal_text = models.TextField()
    bid_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'b2b_proposals'


class InvestmentPitch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.OneToOneField(Company, on_delete=models.CASCADE, related_name='pitch')
    founder = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='investment_pitches', help_text="Ensures direct founder connection")
    pitch_deck_url = models.URLField(blank=True)
    funding_goal = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    equity_offered = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    summary = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'investment_pitches'
