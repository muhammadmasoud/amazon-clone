from django.urls import path
from .views import view_add_product,product_by_id,category_list,product_reviews_list

urlpatterns = [
    path('', view_add_product,name='product-list-create'),
    path('<int:id>/',product_by_id,name='product-detail'),
    path('categories/',category_list,name='category-list'),
    path('<int:product_id>/reviews/',product_reviews_list,name='product-reviews-list'),
]