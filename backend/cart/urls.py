from django.urls import path
from .views import CartView, AddToCartView, RemoveFromCartView, UpdateCartQuantityView

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/add/', AddToCartView.as_view(), name='add-to-cart'),
    path('cart/remove/<int:item_id>/', RemoveFromCartView.as_view(), name='remove-from-cart'),
    path('cart/update/<int:item_id>/', UpdateCartQuantityView.as_view(), name='update-cart'),  # ✅ تحديث الكمية
]
