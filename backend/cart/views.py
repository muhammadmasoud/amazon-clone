from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from .models import Cart, CartItem
from products.models import Product
from .serializers import CartSerializer
from users.permissions import IsVerifiedUser


class CartView(APIView):
    """
    API View for managing user's shopping cart.
    
    - GET: Retrieve user's cart
    - POST: Add item to cart
    - DELETE: Clear entire cart
    """
    permission_classes = [permissions.IsAuthenticated, IsVerifiedUser]

    def get(self, request):
        """Get user's cart with all items."""
        if not request.user.is_email_verified:
            return Response({
                'error': 'Email verification required to access cart.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request):
        """Add item to cart or update quantity if item already exists."""
        if not request.user.is_email_verified:
            return Response({
                'error': 'Email verification required to modify cart.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        
        # Validate input
        if not product_id:
            return Response({
                'error': 'Product ID is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            quantity = int(quantity)
            if quantity <= 0:
                return Response({
                    'error': 'Quantity must be greater than 0.'
                }, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({
                'error': 'Quantity must be a valid number.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if product exists
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({
                'error': 'Product not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check stock availability
        if product.stock < quantity:
            return Response({
                'error': f'Insufficient stock. Available: {product.stock}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create cart
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        # Check if item already in cart
        cart_item, item_created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not item_created:
            # Item already exists, update quantity
            new_quantity = cart_item.quantity + quantity
            if product.stock < new_quantity:
                return Response({
                    'error': f'Insufficient stock. Available: {product.stock}, in cart: {cart_item.quantity}'
                }, status=status.HTTP_400_BAD_REQUEST)
            cart_item.quantity = new_quantity
            cart_item.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request):
        """Clear entire cart."""
        if not request.user.is_email_verified:
            return Response({
                'error': 'Email verification required to modify cart.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            cart = Cart.objects.get(user=request.user)
            cart.items.all().delete()
            return Response({
                'message': 'Cart cleared successfully.'
            }, status=status.HTTP_204_NO_CONTENT)
        except Cart.DoesNotExist:
            return Response({
                'message': 'Cart is already empty.'
            }, status=status.HTTP_204_NO_CONTENT)


class AddToCartView(APIView):
    """Legacy view - use CartView.post instead."""
    permission_classes = [permissions.IsAuthenticated, IsVerifiedUser]

    def post(self, request):
        if not request.user.is_email_verified:
            return Response({
                'error': 'Email verification required to modify cart.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        product_id = request.data.get("product_id")
        quantity = request.data.get("quantity", 1)

        # Validate quantity
        try:
            quantity = int(quantity)
            if quantity < 1:
                return Response({"error": "Quantity must be at least 1"}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({"error": "Quantity must be a number"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if product exists
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check stock
        if product.stock < quantity:
            return Response({
                "error": f"Insufficient stock. Available: {product.stock}"
            }, status=status.HTTP_400_BAD_REQUEST)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)

        if not created:
            new_quantity = cart_item.quantity + quantity
            if product.stock < new_quantity:
                return Response({
                    "error": f"Insufficient stock. Available: {product.stock}, in cart: {cart_item.quantity}"
                }, status=status.HTTP_400_BAD_REQUEST)
            cart_item.quantity = new_quantity
        else:
            cart_item.quantity = quantity
        cart_item.save()

        return Response({"message": "Item added/updated successfully"}, status=status.HTTP_200_OK)


class RemoveFromCartView(APIView):
    """Remove item from cart."""
    permission_classes = [permissions.IsAuthenticated, IsVerifiedUser]

    def delete(self, request, item_id):
        if not request.user.is_email_verified:
            return Response({
                'error': 'Email verification required to modify cart.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            item = CartItem.objects.get(id=item_id, cart__user=request.user)
            item.delete()
            return Response({"message": "Item removed successfully"}, status=status.HTTP_204_NO_CONTENT)
        except CartItem.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)


class UpdateCartQuantityView(APIView):
    """Update cart item quantity."""
    permission_classes = [permissions.IsAuthenticated, IsVerifiedUser]

    def patch(self, request, item_id):
        if not request.user.is_email_verified:
            return Response({
                'error': 'Email verification required to modify cart.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            cart_item = CartItem.objects.get(id=item_id, cart__user=request.user)
        except CartItem.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)

        quantity = request.data.get("quantity")
        try:
            quantity = int(quantity)
            if quantity < 1:
                return Response({"error": "Quantity must be at least 1"}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({"error": "Invalid quantity"}, status=status.HTTP_400_BAD_REQUEST)

        # Check stock availability
        if cart_item.product.stock < quantity:
            return Response({
                "error": f"Insufficient stock. Available: {cart_item.product.stock}"
            }, status=status.HTTP_400_BAD_REQUEST)

        cart_item.quantity = quantity
        cart_item.save()
        return Response({"message": "Quantity updated successfully"}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def cart_summary(request):
    """Get cart summary (item count and total)."""
    if not request.user.is_email_verified:
        return Response({
            'error': 'Email verification required to access cart.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        cart = Cart.objects.get(user=request.user)
        item_count = cart.items.count()
        total_amount = sum(item.subtotal() for item in cart.items.all())
        
        return Response({
            'item_count': item_count,
            'total_amount': total_amount
        })
    except Cart.DoesNotExist:
        return Response({
            'item_count': 0,
            'total_amount': 0
        })
