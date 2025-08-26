from django.urls import path
from . import views

app_name = 'contact'

urlpatterns = [
    # Public endpoints
    path('contact/', views.ContactMessageCreateView.as_view(), name='contact-create'),
    path('contact/categories/', views.contact_categories, name='contact-categories'),
    
    # Admin endpoints
    path('admin/contact/messages/', views.ContactMessageListView.as_view(), name='admin-contact-list'),
]
