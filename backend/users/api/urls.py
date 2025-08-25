from django.urls import path
from .views import (
    signup, logout, profile, CustomTokenObtainPairView, 
    verify_email, resend_verification_email, forgot_password, 
    reset_password, validate_reset_token
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('signup/', signup, name='signup'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('logout/', logout, name='logout'),
    path('profile/', profile, name='profile'),
    path('verify-email/<uuid:token>/', verify_email, name='verify_email'),
    path('resend-verification/', resend_verification_email, name='resend_verification'),
    path('forgot-password/', forgot_password, name='forgot_password'),
    path('reset-password/<uuid:token>/', reset_password, name='reset_password'),
    path('validate-reset-token/<uuid:token>/', validate_reset_token, name='validate_reset_token'),
]