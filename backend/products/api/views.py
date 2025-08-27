from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from ..models import Product,Category,Review
from .serializers import ProductSerializer,CategorySerializer,ReviewSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import models
from django.db.models import Min, Max

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
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
        
        # Filter by price range
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        
        if min_price is not None:
            try:
                min_price_decimal = float(min_price)
                products = products.filter(unit_price__gte=min_price_decimal)
            except (ValueError, TypeError):
                return Response({"error": "Invalid min_price. Must be a number."}, status=status.HTTP_400_BAD_REQUEST)
        
        if max_price is not None:
            try:
                max_price_decimal = float(max_price)
                products = products.filter(unit_price__lte=max_price_decimal)
            except (ValueError, TypeError):
                return Response({"error": "Invalid max_price. Must be a number."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Filter by minimum rating
        min_rating = request.query_params.get('min_rating')
        if min_rating is not None:
            try:
                min_rating_int = int(min_rating)
                if min_rating_int < 1 or min_rating_int > 5:
                    return Response({"error": "Invalid min_rating. Must be between 1 and 5."}, status=status.HTTP_400_BAD_REQUEST)
                
                # Filter products that have an average rating >= min_rating
                # Use distinct() to avoid duplicates from joins
                from django.db.models import Avg, Q
                products = products.annotate(
                    avg_rating=Avg('reviews__rating')
                ).filter(
                    Q(avg_rating__gte=min_rating_int) | Q(avg_rating__isnull=True, reviews__isnull=True)
                ).distinct()
            except (ValueError, TypeError):
                return Response({"error": "Invalid min_rating. Must be an integer between 1 and 5."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure no duplicates in the final queryset
        products = products.distinct()
            
        paginator = PageNumberPagination()
        paginated_products = paginator.paginate_queryset(products, request)
        serialized_products = ProductSerializer(instance=paginated_products, many=True, context={'request': request})
        return paginator.get_paginated_response(serialized_products.data)
    if request.method == 'POST':
        created_product = ProductSerializer(data=request.data)
        # Automatically returns bad request if the product is invalid
        created_product.is_valid(raise_exception=True)
        created_product.save()
        return Response(created_product.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([AllowAny])
def product_by_id(request, id):
    try:
        product = Product.objects.get(pk=id)
    except Product.DoesNotExist as e:
        return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serialized_product = ProductSerializer(instance=product, context={'request': request})
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
@permission_classes([AllowAny])
def category_list(request):
    """
    Simple endpoint to retrieve all categories.
    """
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data , status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def price_range(request):
    """
    Endpoint to get the minimum and maximum prices of all products.
    Used for setting up the price range slider.
    """
    price_stats = Product.objects.aggregate(
        min_price=Min('unit_price'),
        max_price=Max('unit_price')
    )
    
    # Handle case where there are no products
    if price_stats['min_price'] is None:
        price_stats['min_price'] = 0
    if price_stats['max_price'] is None:
        price_stats['max_price'] = 0
    
    return Response(price_stats, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
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