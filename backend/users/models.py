from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    username = None  # Disable username field since we're using email
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    email = models.EmailField(unique=True)
    mobile = models.CharField(max_length=50, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
