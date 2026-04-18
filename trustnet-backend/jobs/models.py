import uuid
from django.db import models
from django.conf import settings
from companies.models import Company


class Job(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='jobs')
    posted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='posted_jobs'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255, blank=True)
    salary_range = models.CharField(max_length=100, blank=True)
    job_type = models.CharField(max_length=50, blank=True, default='Full-time')  # Full-time, Part-time, Contract, etc.
    work_mode = models.CharField(max_length=50, blank=True, default='On-site')   # On-site, Remote, Hybrid
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'jobs'
        indexes = [models.Index(fields=['company']), models.Index(fields=['is_active'])]

    def __str__(self):
        return f"{self.title} @ {self.company.name}"


class Application(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applications'
    )
    cover_letter = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'applications'
        constraints = [
            models.UniqueConstraint(fields=['job', 'applicant'], name='unique_job_application')
        ]
        indexes = [models.Index(fields=['job']), models.Index(fields=['applicant'])]

    def __str__(self):
        return f"Application({self.applicant.email} -> {self.job.title})"
