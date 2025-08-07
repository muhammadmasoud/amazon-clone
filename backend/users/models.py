from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    username = None  # Disable username field since we're using email
    email = models.EmailField(unique=True)
    mobile = models.CharField(max_length=50, null=True, blank=True)
    profile_image = models.ImageField(upload_to='users_profile', null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
