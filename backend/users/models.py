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
    
    # Password reset fields
    password_reset_token = models.UUIDField(null=True, blank=True, editable=False)
    password_reset_token_created = models.DateTimeField(null=True, blank=True)
    
    USERNAME_FIELD = 'email'  # Still use email for login
    REQUIRED_FIELDS = ['username']  # Username will be required when creating superuser

    def generate_verification_token(self):
        """Generate a new verification token"""
        self.email_verification_token = uuid.uuid4()
        self.save()
        
    def generate_password_reset_token(self):
        """Generate a new password reset token"""
        from django.utils import timezone
        self.password_reset_token = uuid.uuid4()
        self.password_reset_token_created = timezone.now()
        self.save()
        
    def is_password_reset_token_valid(self):
        """Check if password reset token is still valid (24 hours)"""
        if not self.password_reset_token or not self.password_reset_token_created:
            return False
        from django.utils import timezone
        from datetime import timedelta
        return timezone.now() - self.password_reset_token_created < timedelta(hours=24)