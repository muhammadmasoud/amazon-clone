from django.urls import path
from .views import view_add_product,product_by_id

urlpatterns = [
    path('', view_add_product,name='product-list-create'),
    path('<int:id>/',product_by_id,name='product-detail')
]