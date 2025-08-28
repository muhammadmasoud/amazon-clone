from django.shortcuts import render
from django.db.models import Sum, Count, Q, F
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from datetime import datetime, timedelta
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)
from .models import Order, OrderItem
from products.models import Product
from cart.models import Cart, CartItem
from users.models import User
from .serializers import (
    OrderSerializer, 
    UserOrderHistorySerializer, 
    AdminOrderSerializer,
    PlaceOrderSerializer,
    OrderStatusUpdateSerializer
)

class PlaceOrderView(APIView):
    """
    Enhanced API View for creating new orders from cart.
    Supports multiple payment methods, enhanced shipping info, and promo codes.
    
    POST /api/orders/
    - Requires user authentication
    - Accepts cart items and comprehensive shipping details
    - Validates product availability and stock
    - Creates order and order items
    - Updates product stock levels
    - Clears user's cart after successful order
    """
    
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Handle order creation from cart data with enhanced features.
        """
        serializer = PlaceOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        validated_data = serializer.validated_data
        cart_items = validated_data['cart']
        
        # Enhanced duplicate prevention for cash on delivery orders
        from django.db import transaction
        
        # Use atomic transaction with database-level locking to prevent race conditions
        with transaction.atomic():
            # Lock the user record to prevent concurrent order creation
            user_locked = User.objects.select_for_update().get(id=user.id)
            
            logger.info(f"Processing order request for user {user.id} with {len(cart_items)} items")
            
            # Check if user already has any pending order (now within the locked transaction)
            existing_pending_order = Order.objects.filter(
                user=user_locked, 
                status='pending',
                payment_method='cash_on_delivery'
            ).first()
            
            if existing_pending_order:
                # Check if the existing order has the same items as the cart
                existing_items = existing_pending_order.items.all()
                cart_product_ids = [item['product_id'] for item in cart_items]
                existing_product_ids = [item.product.id for item in existing_items]
                
                logger.info(f"User {user.id} attempting to place order with products {cart_product_ids}, existing order has {existing_product_ids}")
                
                # If it's the same products, return the existing order instead of creating a new one
                if set(cart_product_ids) == set(existing_product_ids):
                    logger.info(f"Preventing duplicate order for user {user.id}, returning existing order {existing_pending_order.id}")
                    return Response({
                        'message': 'You already have a pending order with the same items.',
                        'order': OrderSerializer(existing_pending_order).data,
                        'is_duplicate': True
                    }, status=status.HTTP_200_OK)
                else:
                    # Different items - warn but allow for now, but with stricter time check
                    recent_order = Order.objects.filter(
                        user=user_locked, 
                        created_at__gte=timezone.now() - timedelta(minutes=5),
                        status='pending'
                    ).first()
                    
                    if recent_order:
                        logger.info(f"Preventing recent duplicate order for user {user.id}, recent order {recent_order.id}")
                        return Response({
                            'error': 'You have a recent pending order. Please wait a few minutes before placing another order or complete your existing order first.',
                            'existing_order_id': recent_order.id,
                            'existing_order_number': recent_order.order_number,
                            'is_duplicate': True
                        }, status=status.HTTP_409_CONFLICT)  # Changed to 409 Conflict instead of 400
            
            # If we get here, no duplicate order exists, so proceed with creating a new order
            # Get user's cart to apply any existing promo codes
            user_cart = None
            try:
                user_cart = Cart.objects.get(user=user_locked)
            except Cart.DoesNotExist:
                pass

            # Create the main order object
            order_data = {
                'user': user_locked,
                'shipping_address': validated_data['shipping_address'],
                'shipping_city': validated_data.get('shipping_city', ''),
                'shipping_state': validated_data.get('shipping_state', ''),
                'shipping_zip': validated_data.get('shipping_zip', ''),
                'shipping_country': validated_data.get('shipping_country', 'USA'),
                'shipping_phone': validated_data.get('shipping_phone', ''),
                'payment_method': validated_data.get('payment_method', 'cash_on_delivery'),
                'customer_notes': validated_data.get('customer_notes', ''),
            }
            
            # Apply promo code if exists
            if user_cart and user_cart.promo_code:
                order_data['promo_code'] = user_cart.promo_code
                order_data['discount_amount'] = user_cart.discount_amount

            # Create the order (still within the atomic transaction)
            try:
                # Create the order
                order = Order.objects.create(**order_data)
                
                # Calculate totals
                subtotal = Decimal('0')
                items_created = []
                
                # Process each item in the cart
                for item in cart_items:
                    try:
                        product = Product.objects.select_for_update().get(id=item['product_id'])
                        quantity = int(item['quantity'])
                        price = product.unit_price
                        
                        # Check if enough stock is available
                        if product.stock < quantity:
                            raise ValueError(f'Insufficient stock for {product.title}. Available: {product.stock}, requested: {quantity}')
                        
                        # Create order item with current product price
                        order_item = OrderItem.objects.create(
                            order=order,
                            product=product,
                            quantity=quantity,
                            price=price,
                            product_title=product.title,
                            product_sku=getattr(product, 'sku', ''),
                        )
                        
                        items_created.append(order_item)
                        
                        # Update product stock (reduce by ordered quantity)
                        product.stock -= quantity
                        product.save()
                        
                        # Add to subtotal
                        subtotal += price * quantity
                        
                    except Product.DoesNotExist:
                        raise ValueError(f'Product with ID {item["product_id"]} not found')
                    except (ValueError, KeyError) as e:
                        raise ValueError(f'Invalid cart data: {str(e)}')

                # Calculate order totals
                order.subtotal = subtotal
                
                # Calculate shipping cost (free shipping over $100)
                if subtotal >= 100:
                    order.shipping_cost = Decimal('0.00')
                else:
                    order.shipping_cost = Decimal('10.00')
                
                # Calculate tax (10%)
                order.tax_amount = (subtotal * Decimal('0.10')).quantize(Decimal('0.01'))
                
                # Apply discount if any
                discount = order.discount_amount or Decimal('0')
                
                # Calculate final total
                order.total_amount = subtotal + order.shipping_cost + order.tax_amount - discount
                order.save()

                # Clear user's cart after successful order
                if user_cart:
                    user_cart.items.all().delete()
                    user_cart.promo_code = None
                    user_cart.discount_amount = 0
                    user_cart.save()

                logger.info(f"Successfully created order {order.id} for user {user.id}")
                
                # Return the created order data
                return Response({
                    'message': 'Order placed successfully!',
                    'order': OrderSerializer(order).data
                }, status=status.HTTP_201_CREATED)
                    
            except ValueError as e:
                return Response({
                    'detail': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Error creating order for user {user.id}: {str(e)}")
                return Response({
                    'detail': f'Failed to create order: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserOrderHistoryView(generics.ListAPIView):
    """
    Enhanced API View for users to view their order history with filtering.
    
    GET /api/orders/history/
    - Requires user authentication
    - Returns paginated list of user's orders
    - Supports filtering by status and date range
    - Only shows orders belonging to the authenticated user
    """
    
    serializer_class = UserOrderHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter orders with enhanced filtering capabilities
        """
        queryset = Order.objects.filter(user=self.request.user).prefetch_related('items__product')
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        return queryset


class UserOrderDetailView(generics.RetrieveAPIView):
    """
    Enhanced API View for users to view a specific order's details.
    
    GET /api/orders/{order_id}/
    - Requires user authentication
    - Returns detailed information about a specific order
    - Users can only access their own orders (security)
    """
    
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter to only orders belonging to the authenticated user.
        """
        return Order.objects.filter(user=self.request.user).prefetch_related('items__product')


class CancelOrderView(APIView):
    """
    Allow users to cancel their orders if eligible
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if not order.can_be_cancelled():
            return Response({
                'detail': f'Order cannot be cancelled. Current status: {order.status_display}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Restore product stock
        for item in order.items.all():
            product = item.product
            product.stock += item.quantity
            product.save()
        
        # Update order status
        order.status = 'cancelled'
        order.save()
        
        return Response({
            'message': 'Order cancelled successfully',
            'order': OrderSerializer(order).data
        }, status=status.HTTP_200_OK)


# Admin Dashboard APIs - Enhanced with better functionality

class AdminOrderListView(generics.ListAPIView):
    """
    Enhanced Admin API to view all orders with comprehensive filtering.
    
    GET /api/admin/orders/
    - Requires admin authentication
    - Returns all orders in the system
    - Supports filtering by status, payment, date range, and search
    - Includes pagination
    """
    
    serializer_class = AdminOrderSerializer
    permission_classes = [IsAdminUser]
    queryset = Order.objects.all().prefetch_related('items__product').select_related('user')

    def get_queryset(self):
        """
        Enhanced filtering with search functionality
        """
        queryset = super().get_queryset()
        
        # Filter by order status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by payment status
        is_paid = self.request.query_params.get('is_paid')
        if is_paid is not None:
            queryset = queryset.filter(is_paid=is_paid.lower() == 'true')
        
        # Filter by payment method
        payment_method = self.request.query_params.get('payment_method')
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(order_number__icontains=search) |
                Q(user__username__icontains=search) |
                Q(user__email__icontains=search) |
                Q(shipping_address__icontains=search)
            )
        
        return queryset


class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    """
    Enhanced Admin API to view and update order details.
    
    GET /api/admin/orders/{order_id}/ - View order details
    PUT /api/admin/orders/{order_id}/ - Update order details
    """
    
    serializer_class = AdminOrderSerializer
    permission_classes = [IsAdminUser]
    queryset = Order.objects.all().prefetch_related('items__product').select_related('user')


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard_stats(request):
    """
    Enhanced API for comprehensive admin dashboard statistics.
    
    GET /api/admin/dashboard/stats/?days=30
    - Returns enhanced analytics and metrics
    - Supports different time periods
    """
    
    # Get date range from query params (default to last 30 days)
    days = int(request.query_params.get('days', 30))
    date_from = timezone.now() - timedelta(days=days)
    
    # Base queryset for the specified time period
    orders_queryset = Order.objects.filter(created_at__gte=date_from)
    
    # Enhanced statistics
    total_orders = orders_queryset.count()
    total_sales = orders_queryset.aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
    paid_orders = orders_queryset.filter(is_paid=True).count()
    pending_orders = orders_queryset.filter(status='pending').count()
    cancelled_orders = orders_queryset.filter(status='cancelled').count()
    delivered_orders = orders_queryset.filter(status='delivered').count()
    
    # Average order value
    avg_order_value = orders_queryset.aggregate(avg=Sum('total_amount')/Count('id'))['avg'] or Decimal('0')
    
    # Orders by status with counts
    orders_by_status = orders_queryset.values('status').annotate(
        count=Count('id'),
        total_sales=Sum('total_amount')
    ).order_by('status')
    
    # Orders by payment method
    orders_by_payment = orders_queryset.values('payment_method').annotate(
        count=Count('id'),
        total_sales=Sum('total_amount')
    ).order_by('-count')
    
    # Recent orders
    recent_orders = orders_queryset.order_by('-created_at')[:10]
    recent_orders_data = AdminOrderSerializer(recent_orders, many=True).data
    
    # Daily sales trend
    daily_sales = orders_queryset.extra(
        select={'date': 'DATE(created_at)'}
    ).values('date').annotate(
        orders_count=Count('id'),
        sales_amount=Sum('total_amount'),
        avg_order_value=Sum('total_amount')/Count('id')
    ).order_by('date')
    
    # Top selling products
    top_products = OrderItem.objects.filter(
        order__created_at__gte=date_from
    ).values(
        'product__id', 'product__title'
    ).annotate(
        total_quantity=Sum('quantity'),
        total_revenue=Sum(F('quantity') * F('price')),
        orders_count=Count('order', distinct=True)
    ).order_by('-total_quantity')[:10]
    
    # Customer analytics
    top_customers = Order.objects.filter(
        created_at__gte=date_from
    ).values(
        'user__id', 'user__username', 'user__email'
    ).annotate(
        total_orders=Count('id'),
        total_spent=Sum('total_amount')
    ).order_by('-total_spent')[:10]
    
    return Response({
        'period_days': days,
        'overview': {
            'total_orders': total_orders,
            'total_sales': float(total_sales),
            'avg_order_value': float(avg_order_value),
            'paid_orders': paid_orders,
            'pending_orders': pending_orders,
            'cancelled_orders': cancelled_orders,
            'delivered_orders': delivered_orders,
        },
        'orders_by_status': list(orders_by_status),
        'orders_by_payment': list(orders_by_payment),
        'recent_orders': recent_orders_data,
        'daily_sales': list(daily_sales),
        'top_products': list(top_products),
        'top_customers': list(top_customers),
    })


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def update_order_status(request, order_id):
    """
    Enhanced API for admin to update order status with automatic timestamp updates.
    """
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = OrderStatusUpdateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    validated_data = serializer.validated_data
    new_status = validated_data.get('status')
    is_paid = validated_data.get('is_paid')
    tracking_number = validated_data.get('tracking_number')
    courier_service = validated_data.get('courier_service')
    admin_notes = validated_data.get('admin_notes')
    
    # Update status and set appropriate timestamps
    if new_status and new_status != order.status:
        order.status = new_status
        
        # Set appropriate timestamps based on status
        now = timezone.now()
        if new_status == 'confirmed' and not order.confirmed_at:
            order.confirmed_at = now
        elif new_status == 'shipped' and not order.shipped_at:
            order.shipped_at = now
        elif new_status == 'delivered' and not order.delivered_at:
            order.delivered_at = now
    
    # Update payment status
    if is_paid is not None:
        order.is_paid = is_paid
        if is_paid and not order.payment_date:
            order.payment_date = timezone.now()
    
    # Update tracking information
    if tracking_number is not None:
        order.tracking_number = tracking_number
    if courier_service is not None:
        order.courier_service = courier_service
    if admin_notes is not None:
        order.admin_notes = admin_notes
    
    order.save()
    
    return Response({
        'message': 'Order updated successfully',
        'order': AdminOrderSerializer(order).data
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def order_tracking(request, order_number):
    """
    Public order tracking by order number
    """
    try:
        # For authenticated users, limit to their orders (unless staff)
        if request.user.is_authenticated:
            order = Order.objects.get(
                Q(order_number=order_number) & 
                (Q(user=request.user) if not request.user.is_staff else Q())
            )
        else:
            # For public access, allow tracking by order number
            order = Order.objects.get(order_number=order_number)
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Create tracking timeline
    timeline = []
    
    if order.created_at:
        timeline.append({
            'status': 'pending',
            'title': 'Order Placed',
            'description': 'Your order has been placed successfully',
            'date': order.created_at,
            'completed': True
        })
    
    if order.confirmed_at:
        timeline.append({
            'status': 'confirmed',
            'title': 'Order Confirmed',
            'description': 'Your order has been confirmed and is being prepared',
            'date': order.confirmed_at,
            'completed': True
        })
    
    if order.shipped_at:
        timeline.append({
            'status': 'shipped',
            'title': 'Order Shipped',
            'description': f'Your order has been shipped{" via " + order.courier_service if order.courier_service else ""}',
            'date': order.shipped_at,
            'completed': True
        })
    
    if order.delivered_at:
        timeline.append({
            'status': 'delivered',
            'title': 'Order Delivered',
            'description': 'Your order has been delivered successfully',
            'date': order.delivered_at,
            'completed': True
        })
    
    return Response({
        'order': OrderSerializer(order).data,
        'timeline': timeline
    })
