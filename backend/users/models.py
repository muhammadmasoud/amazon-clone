from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid


class User(AbstractUser):
    # Keep username field active (remove the username = None line)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    email = models.EmailField(unique=True)
    mobile = models.CharField(max_length=50, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    
    # Email verification fields
    is_email_verified = models.BooleanField(default=False)
    email_verification_token = models.UUIDField(default=uuid.uuid4, editable=False)
    
    USERNAME_FIELD = 'email'  # Still use email for login
    REQUIRED_FIELDS = ['username']  # Username will be required when creating superuser

    def generate_verification_token(self):
        """Generate a new verification token"""
        self.email_verification_token = uuid.uuid4()
        self.save()