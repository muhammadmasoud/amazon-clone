from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from ..models import Product,Category,Review
from .serializers import ProductSerializer,CategorySerializer,ReviewSerializer
from rest_framework.permissions import IsAuthenticated
from django.db import models

@api_view(['GET', 'POST'])
#@permission_classes([AllowAny])
def view_add_product(request):
    if request.method == 'GET':
        products = Product.objects.all()
        #Search Query:
        search_query = request.query_params.get('q')
        #Filter by search query:
        if search_query:
            products = products.filter(models.Q(title__icontains=search_query) | 
                                       models.Q(description__icontains=search_query))
        #Filter by category, from queryparam:
        category_id = request.query_params.get('category')
        if category_id is not None:
            try:
                # Convert the string parameter to an integer
                category_id_int = int(category_id)
                # Filter using the correct database column name
                products = products.filter(category_id=category_id_int)
            except ValueError:
                return Response({"error": "Invalid category ID. Must be an integer."}, status=status.HTTP_400_BAD_REQUEST)
            
        paginator = PageNumberPagination()
        paginated_products = paginator.paginate_queryset(products, request)
        serialized_products = ProductSerializer(instance=paginated_products, many=True)
        return paginator.get_paginated_response(serialized_products.data)
    if request.method == 'POST':
        created_product = ProductSerializer(data=request.data)
        # Automatically returns bad request if the product is invalid
        created_product.is_valid(raise_exception=True)
        created_product.save()
        return Response(created_product.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
#@permission_classes([AllowAny])
def product_by_id(request, id):
    try:
        product = Product.objects.get(pk=id)
    except Product.DoesNotExist as e:
        return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serialized_product = ProductSerializer(instance=product)
        return Response(serialized_product.data, status=status.HTTP_200_OK)
    elif request.method == 'DELETE':
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    else:
        if request.method == 'PUT':
            edited_product = ProductSerializer(instance=product, data=request.data)
        elif request.method == 'PATCH':
            edited_product = ProductSerializer(instance=product, data=request.data, partial=True)

        edited_product.is_valid(raise_exception=True)
        edited_product.save()
        return Response(data=edited_product.data, status=status.HTTP_200_OK)
    
@api_view(['GET'])
#@permission_classes([AllowAny])
def category_list(request):
    """
    Simple endpoint to retrieve all categories.
    """
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data , status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
def product_reviews_list(request, product_id):
    """
    Handles:
    - GET: Returns all reviews for a specific product.
    - POST: Creates a new review for a specific product (requires auth).
    """
    # First, ensure the product exists
    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # Get all reviews for this product, ordered by newest first
        reviews = product.reviews.all() # Uses the related_name='reviews'
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required to write a review."}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if user has already reviewed this product
        existing_review = Review.objects.filter(user=request.user, product=product).exists()
        if existing_review:
            return Response({"error": "You have already reviewed this product."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create the review
        serializer = ReviewSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(product=product) # Pass the product to the save method
        return Response(serializer.data, status=status.HTTP_201_CREATED)