from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    mobile = models.CharField(max_length=50)
    profile_image = models.ImageField(upload_to='users_profile', null=True, blank=True)
    address = models.TextField(null=True, blank=True)
