from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

class CustomAuthBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        
        if username is None or password is None:
            return None
            
        try:
            # Since USERNAME_FIELD is 'email', username parameter contains the email
            user = UserModel.objects.get(email=username)
        except UserModel.DoesNotExist:
            return None  # User doesn't exist
        
        if user.check_password(password):
            # For Django admin, don't check email verification
            if (hasattr(request, 'resolver_match') and 
                request.resolver_match and 
                hasattr(request.resolver_match, 'namespace') and 
                request.resolver_match.namespace and 
                'admin' in request.resolver_match.namespace):
                return user
            # For API authentication, check email verification
            if not user.is_email_verified:
                return None
            return user
        return None