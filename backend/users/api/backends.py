from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

class CustomAuthBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        try:
            # Use email instead of username for authentication
            user = UserModel.objects.get(email=username)
        except UserModel.DoesNotExist:
            return None  # User doesn't exist
        
        if user.check_password(password):
            # Check if email is verified
            if not user.is_email_verified:
                return "unverified"  # Email not verified
            return user  # Password is correct and email is verified
        return False  # Password is incorrect