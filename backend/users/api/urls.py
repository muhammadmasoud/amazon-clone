from django.urls import path
from .views import signup, logout, CustomTokenObtainPairView 
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path('signup/', signup, name='signup'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('logout/', logout, name='logout'),
]