from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from ..models import Product,Category,Review
from .serializers import ProductSerializer,CategorySerializer,ReviewSerializer
from users.permissions import IsAdminOrReadOnly, IsOwnerOrReadOnly, IsVerifiedUser, IsReviewOwner


@api_view(['GET', 'POST'])
@permission_classes([IsAdminOrReadOnly])
def view_add_product(request):
    if request.method == 'GET':
        # Allow anyone to view products
        products = Product.objects.all()

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
        # Permission is handled by IsAdminOrReadOnly decorator
        created_product = ProductSerializer(data=request.data)
        # Automatically returns bad request if the product is invalid
        created_product.is_valid(raise_exception=True)
        created_product.save()
        return Response(created_product.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAdminOrReadOnly])
def product_by_id(request, id):
    try:
        product = Product.objects.get(pk=id)
    except Product.DoesNotExist as e:
        return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        # Anyone can view a product
        serialized_product = ProductSerializer(instance=product)
        return Response(serialized_product.data, status=status.HTTP_200_OK)
    
    # For modifying operations, permission is handled by IsAdminOrReadOnly decorator
    if request.method == 'DELETE':
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
    Public access - anyone can view categories.
    """
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data , status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])  # GET is public, POST checks auth in view
def product_reviews_list(request, product_id):
    """
    Handles:
    - GET: Returns all reviews for a specific product (public access).
    - POST: Creates a new review for a specific product (requires verified user).
    """
    # First, ensure the product exists
    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # Anyone can view reviews
        reviews = product.reviews.all() # Uses the related_name='reviews'
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        # Only authenticated and verified users can create reviews
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required to create reviews"}, status=status.HTTP_401_UNAUTHORIZED)
        
        if not request.user.is_email_verified:
            return Response({"error": "Email verification required to create reviews"}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if user already reviewed this product
        if Review.objects.filter(user=request.user, product=product).exists():
            return Response({"error": "You have already reviewed this product."}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Create the review
        serializer = ReviewSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(product=product) # Pass the product to the save method
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def review_detail(request, review_id):
    """
    Handle individual review operations:
    - GET: View review details (public)
    - PUT: Update review (owner only)
    - DELETE: Delete review (owner only)
    """
    try:
        review = Review.objects.get(pk=review_id)
    except Review.DoesNotExist:
        return Response({"error": "Review not found."}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        # Anyone can view a review
        serializer = ReviewSerializer(review)
        return Response(serializer.data)
    
    # Check if user owns the review for write operations
    if review.user != request.user:
        return Response({"error": "You can only modify your own reviews."}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'PUT':
        serializer = ReviewSerializer(review, data=request.data, partial=True, 
                                    context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    elif request.method == 'DELETE':
        review.delete()
        return Response({"message": "Review deleted successfully."}, 
                       status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_reviews(request):
    """
    Get all reviews by the current user.
    """
    reviews = Review.objects.filter(user=request.user).select_related('product')
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)