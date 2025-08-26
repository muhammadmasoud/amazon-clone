from django.urls import path
from .views import (
    CartView, AddToCartView, RemoveFromCartView, UpdateCartQuantityView,
    ClearCartView, apply_promo_code, remove_promo_code, cart_items_count
)

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/add/', AddToCartView.as_view(), name='add-to-cart'),
    path('cart/remove/<int:item_id>/', RemoveFromCartView.as_view(), name='remove-from-cart'),
    path('cart/update/<int:item_id>/', UpdateCartQuantityView.as_view(), name='update-cart'),
    path('cart/clear/', ClearCartView.as_view(), name='clear-cart'),
    path('cart/promo/apply/', apply_promo_code, name='apply-promo-code'),
    path('cart/promo/remove/', remove_promo_code, name='remove-promo-code'),
    path('cart/count/', cart_items_count, name='cart-items-count'),
]
