import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import MinValueValidator, MaxValueValidator


class CustomUserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, name, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('company_admin', 'Company Admin'),
        ('admin', 'Admin'),
    ]
    VERIFICATION_STATUS = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    is_verified = models.BooleanField(default=False)
    verification_status = models.CharField(
        max_length=20, choices=VERIFICATION_STATUS, default='pending'
    )
    phone_no = models.CharField(max_length=20, null=True, blank=True)
    ceo_name = models.CharField(max_length=255, null=True, blank=True)
    company_type = models.CharField(max_length=100, null=True, blank=True)
    gst_no = models.CharField(max_length=50, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    
    trust_score = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    reports_count = models.PositiveIntegerField(default=0)
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        db_table = 'users'
        indexes = [models.Index(fields=['email']), models.Index(fields=['trust_score'])]

    def __str__(self):
        return f"{self.name} <{self.email}>"


class VerificationRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name='verification_request'
    )
    face_image = models.ImageField(upload_to='verification/', null=True, blank=True)
    face_image_url = models.URLField(blank=True)  # alternative: mock URL
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reviewed_by = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='reviewed_verifications'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'verification_requests'

    def __str__(self):
        return f"VerificationRequest({self.user.email}, {self.status})"

class OfficialGSTData(models.Model):
    gstin = models.CharField(max_length=50, unique=True, primary_key=True)
    company_name = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    status = models.CharField(max_length=50, default='Active')

    class Meta:
        db_table = 'official_gst_data'

    def __str__(self):
        return f"{self.gstin} - {self.company_name}"


class Connection(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    follower = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name='following_connections'
    )
    following = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name='follower_connections'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'connections'
        constraints = [
            models.UniqueConstraint(fields=['follower', 'following'], name='unique_connection')
        ]

    def __str__(self):
        return f"Connection({self.follower.email} -> {self.following.email})"
