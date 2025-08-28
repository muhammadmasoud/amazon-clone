from django.urls import path
from . import views

urlpatterns = [
    path('create-payment-intent/', views.create_payment_intent, name='create_payment_intent'),
    path('confirm-payment/', views.confirm_payment, name='confirm_payment'),
    path('payment-status/<str:payment_id>/', views.payment_status, name='payment_status'),
    path('user-payments/', views.user_payments, name='user_payments'),
    path('stripe-config/', views.stripe_config, name='stripe_config'),
]
