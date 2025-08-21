from django.urls import path
from .views import (
    signup, logout, profile, CustomTokenObtainPairView, 
    verify_email, resend_verification_email, change_password, user_orders
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('signup/', signup, name='signup'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('logout/', logout, name='logout'),
    path('profile/', profile, name='profile'),
    path('change-password/', change_password, name='change_password'),
    path('orders/', user_orders, name='user_orders'),
    path('verify-email/<uuid:token>/', verify_email, name='verify_email'),
    path('resend-verification/', resend_verification_email, name='resend_verification'),
]