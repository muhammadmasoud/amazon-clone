from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    email = models.EmailField(unique=True)
    mobile = models.CharField(max_length=50, null=True, blank=True)
    profile_image = models.ImageField(upload_to='users_profile', null=True, blank=True)
    address = models.TextField(null=True, blank=True)
<<<<<<< HEAD
=======

    REQUIRED_FIELDS = ['email']  # Username & password are required by default
>>>>>>> 274940d4e79822d2e888694441349f586ba821a1
