
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

class CustomAuthBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        try:
            user = UserModel.objects.get(username=username)
        except UserModel.DoesNotExist:
            return None  # User doesn't exist
        
        if user.check_password(password):
            return user  # Password is correct
        return False  # Password is incorrect