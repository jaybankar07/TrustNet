import uuid
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Event(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='organized_events'
    )
    title = models.CharField(max_length=255)
    CATEGORY_CHOICES = [
        ('Networking', 'Networking'), ('Conference', 'Conference'),
        ('Workshop', 'Workshop'), ('Investor', 'Investor'), ('Hackathon', 'Hackathon'),
        ('General', 'General'),
    ]
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Networking')
    description = models.TextField(blank=True)
    date = models.DateTimeField()
    location = models.CharField(max_length=255, blank=True)
    is_online = models.BooleanField(default=False)
    max_attendees = models.PositiveIntegerField(null=True, blank=True)

    # Trust system fields
    trust_score = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    reports_count = models.PositiveIntegerField(default=0)
    is_flagged = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'events'
        indexes = [
            models.Index(fields=['organizer']),
            models.Index(fields=['is_flagged']),
            models.Index(fields=['date']),
        ]
        ordering = ['date']

    def __str__(self):
        return self.title


class Registration(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='registrations')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='event_registrations'
    )
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'event_registrations'
        constraints = [
            models.UniqueConstraint(fields=['event', 'user'], name='unique_event_registration')
        ]
        indexes = [models.Index(fields=['event']), models.Index(fields=['user'])]

    def __str__(self):
        return f"Registration({self.user.email} -> {self.event.title})"


class EventTicket(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='tickets')
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity_available = models.PositiveIntegerField(null=True, blank=True)
    
    class Meta:
        db_table = 'event_tickets'


class EscrowPayment(models.Model):
    STATUS_CHOICES = [
        ('held', 'Held in Escrow'),
        ('released', 'Released to Organizer'),
        ('refunded', 'Refunded to Buyer')
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    registration = models.OneToOneField(Registration, on_delete=models.CASCADE, related_name='escrow_payment')
    ticket = models.ForeignKey(EventTicket, on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='held')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'escrow_payments'
