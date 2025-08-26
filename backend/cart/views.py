from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.db import transaction
from decimal import Decimal
from .models import Cart, CartItem
from products.models import Product
from .serializers import (
    CartSerializer, CartSummarySerializer, AddToCartSerializer,
    UpdateQuantitySerializer, PromoCodeSerializer
)

class CartView(APIView):
    """Get current user's cart with all items and calculations"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        # Check for lightweight request
        if request.query_params.get('summary') == 'true':
            serializer = CartSummarySerializer(cart)
        else:
            serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AddToCartView(APIView):
    """Add products to cart with validation and stock checking"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        product_id = serializer.validated_data['product_id']
        quantity = serializer.validated_data['quantity']

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check stock availability
        if product.stock < quantity:
            return Response({
                "error": f"Insufficient stock. Only {product.stock} items available."
            }, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            cart, _ = Cart.objects.get_or_create(user=request.user)
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart, 
                product=product,
                defaults={'quantity': quantity}
            )

            if not created:
                # Check if adding quantity exceeds stock
                new_quantity = cart_item.quantity + quantity
                if new_quantity > product.stock:
                    return Response({
                        "error": f"Cannot add {quantity} more items. Stock limit: {product.stock}, currently in cart: {cart_item.quantity}"
                    }, status=status.HTTP_400_BAD_REQUEST)
                cart_item.quantity = new_quantity
            
            cart_item.save()
            cart.save()  # Update cart timestamp

        return Response({
            "message": f"{'Updated' if not created else 'Added'} {product.title} to cart",
            "cart_total_items": cart.total_items(),
            "item_quantity": cart_item.quantity
        }, status=status.HTTP_200_OK)

class RemoveFromCartView(APIView):
    """Remove specific item from cart completely"""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, item_id):
        try:
            item = CartItem.objects.get(id=item_id, cart__user=request.user)
            product_title = item.product.title
            item.delete()
            
            # Update cart timestamp
            cart = Cart.objects.get(user=request.user)
            cart.save()
            
            return Response({
                "message": f"Removed {product_title} from cart"
            }, status=status.HTTP_200_OK)
        except CartItem.DoesNotExist:
            return Response({"error": "Item not found in cart"}, status=status.HTTP_404_NOT_FOUND)

class UpdateCartQuantityView(APIView):
    """Update quantity of specific cart item"""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, item_id):
        serializer = UpdateQuantitySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        quantity = serializer.validated_data['quantity']

        try:
            cart_item = CartItem.objects.get(id=item_id, cart__user=request.user)
        except CartItem.DoesNotExist:
            return Response({"error": "Item not found in cart"}, status=status.HTTP_404_NOT_FOUND)

        # Check stock availability
        if quantity > cart_item.product.stock:
            return Response({
                "error": f"Insufficient stock. Only {cart_item.product.stock} items available."
            }, status=status.HTTP_400_BAD_REQUEST)

        cart_item.quantity = quantity
        cart_item.save()
        
        # Update cart timestamp
        cart_item.cart.save()

        return Response({
            "message": f"Updated quantity to {quantity}",
            "subtotal": cart_item.subtotal()
        }, status=status.HTTP_200_OK)

class ClearCartView(APIView):
    """Clear all items from cart"""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
            items_count = cart.items.count()
            cart.items.all().delete()
            cart.promo_code = None
            cart.discount_amount = 0
            cart.save()
            
            return Response({
                "message": f"Cleared {items_count} items from cart"
            }, status=status.HTTP_200_OK)
        except Cart.DoesNotExist:
            return Response({"message": "Cart is already empty"}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def apply_promo_code(request):
    """Apply promo code to cart"""
    serializer = PromoCodeSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    promo_code = serializer.validated_data['promo_code'].upper()
    
    # Simple promo code logic (extend this with a PromoCode model later)
    PROMO_CODES = {
        'SAVE10': {'type': 'percentage', 'value': 10, 'min_amount': 50},
        'WELCOME15': {'type': 'percentage', 'value': 15, 'min_amount': 100},
        'FLAT20': {'type': 'fixed', 'value': 20, 'min_amount': 75},
        'FREESHIP': {'type': 'free_shipping', 'value': 0, 'min_amount': 0},
    }
    
    if promo_code not in PROMO_CODES:
        return Response({"error": "Invalid promo code"}, status=status.HTTP_400_BAD_REQUEST)
    
    cart, _ = Cart.objects.get_or_create(user=request.user)
    subtotal = cart.subtotal()
    promo_info = PROMO_CODES[promo_code]
    
    if subtotal < promo_info['min_amount']:
        return Response({
            "error": f"Minimum order amount of ${promo_info['min_amount']} required for this promo code"
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Calculate discount
    discount_amount = Decimal('0')
    if promo_info['type'] == 'percentage':
        discount_amount = (subtotal * Decimal(str(promo_info['value'])) / 100).quantize(Decimal('0.01'))
    elif promo_info['type'] == 'fixed':
        discount_amount = Decimal(str(promo_info['value']))
    
    cart.promo_code = promo_code
    cart.discount_amount = discount_amount
    cart.save()
    
    return Response({
        "message": f"Promo code '{promo_code}' applied successfully",
        "discount_amount": discount_amount,
        "new_total": cart.total_amount()
    }, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_promo_code(request):
    """Remove promo code from cart"""
    try:
        cart = Cart.objects.get(user=request.user)
        cart.promo_code = None
        cart.discount_amount = 0
        cart.save()
        
        return Response({
            "message": "Promo code removed",
            "new_total": cart.total_amount()
        }, status=status.HTTP_200_OK)
    except Cart.DoesNotExist:
        return Response({"error": "Cart not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def cart_items_count(request):
    """Get quick cart items count for navbar"""
    try:
        cart = Cart.objects.get(user=request.user)
        return Response({"count": cart.total_items()}, status=status.HTTP_200_OK)
    except Cart.DoesNotExist:
        return Response({"count": 0}, status=status.HTTP_200_OK)
