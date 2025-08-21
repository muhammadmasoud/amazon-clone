
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
            return user  # Password is correct
        return False  # Password is incorrect