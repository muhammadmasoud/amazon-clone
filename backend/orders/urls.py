from django.urls import path
from .views import PlaceOrderView

urlpatterns = [
    path('orders/', PlaceOrderView.as_view(), name='place-order'),
]