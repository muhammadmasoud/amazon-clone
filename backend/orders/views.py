from django.shortcuts import render
from django.db.models import Sum, Count, Q, F
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from datetime import datetime, timedelta
from decimal import Decimal
from .models import Order, OrderItem
from products.models import Product
from users.permissions import IsVerifiedUser, IsOwner
from .serializers import (
    OrderSerializer, 
    UserOrderHistorySerializer, 
    AdminOrderSerializer
)

class PlaceOrderView(APIView):
    """
    API View for creating new orders.
    This handles the cart checkout process, validating items and creating orders.
    
    POST /api/orders/
    - Requires user authentication and email verification
    - Accepts cart items and shipping address
    - Validates product availability and stock
    - Creates order and order items
    - Updates product stock levels
    """
    
    # Only authenticated and verified users can place orders
    permission_classes = [IsAuthenticated, IsVerifiedUser]

    def post(self, request):
        """
        Handle order creation from cart data.
        
        Expected request data:
        {
            "cart": [
                {"product_id": 1, "quantity": 2},
                {"product_id": 3, "quantity": 1}
            ],
            "shipping_address": "123 Main St, City, State, ZIP"
        }
        """
        # Check email verification
        if not request.user.is_email_verified:
            return Response({
                'error': 'Email verification required to place orders.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get the authenticated user from the request
        user = request.user
        
        # Extract data from the request body
        data = request.data
        cart_items = data.get('cart', [])  # List of items to order
        shipping_address = data.get('shipping_address')  # Delivery address

        # Validate required data is present
        if not cart_items:
            return Response({'detail': 'Cart cannot be empty.'}, status=400)
        
        if not shipping_address or not shipping_address.strip():
            return Response({'detail': 'Shipping address is required.'}, status=400)

        # Validate cart items structure
        for item in cart_items:
            if 'product_id' not in item or 'quantity' not in item:
                return Response({'detail': 'Each cart item must have product_id and quantity.'}, status=400)
            
            if not isinstance(item['quantity'], int) or item['quantity'] <= 0:
                return Response({'detail': 'Quantity must be a positive integer.'}, status=400)

        # Create the main order object
        order = Order.objects.create(user=user, shipping_address=shipping_address.strip())

        # Variable to track total order amount
        total = Decimal('0')
        
        # Process each item in the cart
        for item in cart_items:
            try:
                # Get the product from database
                product = Product.objects.get(id=item['product_id'])
                quantity = item['quantity']
                price = product.unit_price  # Use current product price
                
                # Check if enough stock is available
                if product.stock < quantity:
                    # If not enough stock, delete the order and return error
                    order.delete()  # Clean up the order if stock is insufficient
                    return Response({
                        'detail': f'Insufficient stock for {product.title}. Available: {product.stock}, requested: {quantity}'
                    }, status=400)
                
                # Create order item with current product price
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price=price  # Store price at time of order
                )
                
                # Update product stock (reduce by ordered quantity)
                product.stock -= quantity
                product.save()
                
                # Add to total order amount
                total += price * quantity
                
            except Product.DoesNotExist:
                # If product doesn't exist, clean up and return error
                order.delete()  # Clean up if product doesn't exist
                return Response({'detail': f'Product with ID {item["product_id"]} not found'}, status=400)

        # Set the calculated total amount on the order
        order.total_amount = total
        order.save()

        # Return the created order data using the serializer
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class UserOrderHistoryView(generics.ListAPIView):
    """
    API View for users to view their order history.
    
    GET /api/orders/history/
    - Requires user authentication and email verification
    - Returns paginated list of user's orders
    - Only shows orders belonging to the authenticated user
    """
    
    # Use the simplified serializer for order history
    serializer_class = UserOrderHistorySerializer
    # Only authenticated and verified users can access
    permission_classes = [IsAuthenticated, IsVerifiedUser]

    def get_queryset(self):
        """
        Filter orders to only show current user's orders.
        prefetch_related optimizes database queries by fetching related data.
        """
        # Check email verification
        if not self.request.user.is_email_verified:
            from django.core.exceptions import PermissionDenied
            raise PermissionDenied("Email verification required to access orders.")
        
        return Order.objects.filter(user=self.request.user).prefetch_related('items__product')


class UserOrderDetailView(generics.RetrieveAPIView):
    """
    API View for users to view a specific order's details.
    
    GET /api/orders/{order_id}/
    - Requires user authentication and email verification
    - Returns detailed information about a specific order
    - Users can only access their own orders (security)
    """
    
    # Use the detailed order serializer
    serializer_class = OrderSerializer
    # Only authenticated and verified users can access
    permission_classes = [IsAuthenticated, IsVerifiedUser]

    def get_queryset(self):
        """
        Filter to only orders belonging to the authenticated user.
        This ensures users can't access other users' orders.
        """
        # Check email verification
        if not self.request.user.is_email_verified:
            from django.core.exceptions import PermissionDenied
            raise PermissionDenied("Email verification required to access orders.")
        
        return Order.objects.filter(user=self.request.user).prefetch_related('items__product')


# Admin Dashboard APIs - Only accessible by admin users

class AdminOrderListView(generics.ListAPIView):
    """
    Admin API to view all orders with filtering capabilities.
    
    GET /api/admin/orders/
    - Requires admin authentication
    - Returns all orders in the system
    - Supports filtering by status, payment, and date range
    - Includes pagination
    """
    
    # Use the admin serializer with comprehensive data
    serializer_class = AdminOrderSerializer
    # Only admin users can access
    permission_classes = [IsAdminUser]
    # Base queryset with optimized database queries
    queryset = Order.objects.all().prefetch_related('items__product').select_related('user')

    def get_queryset(self):
        """
        Apply filters based on query parameters.
        Supports filtering by status, payment status, and date range.
        """
        queryset = super().get_queryset()
        
        # Filter by order status if provided (?status=pending)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by payment status (?is_paid=true)
        is_paid = self.request.query_params.get('is_paid')
        if is_paid is not None:
            queryset = queryset.filter(is_paid=is_paid.lower() == 'true')
        
        # Filter by date range (?date_from=2024-01-01&date_to=2024-01-31)
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        return queryset


class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    """
    Admin API to view and update order details.
    
    GET /api/admin/orders/{order_id}/ - View order details
    PUT /api/admin/orders/{order_id}/ - Update order details
    - Requires admin authentication
    - Allows viewing and updating any order in the system
    """
    
    # Use admin serializer for comprehensive data
    serializer_class = AdminOrderSerializer
    # Only admin users can access
    permission_classes = [IsAdminUser]
    # Include all orders with optimized queries
    queryset = Order.objects.all().prefetch_related('items__product').select_related('user')


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard_stats(request):
    """
    API for comprehensive admin dashboard statistics.
    
    GET /api/admin/dashboard/stats/?days=30
    - Requires admin authentication
    - Returns sales metrics, order counts, trends, and analytics
    - Supports filtering by time period (days parameter)
    """
    
    # Get date range from query params (default to last 30 days)
    days = int(request.query_params.get('days', 30))
    date_from = datetime.now() - timedelta(days=days)
    
    # Base queryset for the specified time period
    orders_queryset = Order.objects.filter(created_at__gte=date_from)
    
    # Calculate total statistics
    total_orders = orders_queryset.count()  # Total number of orders
    
    # Calculate total sales amount (sum of all order totals)
    total_sales = orders_queryset.aggregate(
        total=Sum('total_amount')
    )['total'] or Decimal('0')
    
    # Count paid and pending orders
    paid_orders = orders_queryset.filter(is_paid=True).count()
    pending_orders = orders_queryset.filter(status='pending').count()
    
    # Group orders by status and count each status
    orders_by_status = orders_queryset.values('status').annotate(
        count=Count('id')
    ).order_by('status')
    
    # Get recent orders (last 10) for quick overview
    recent_orders = orders_queryset.order_by('-created_at')[:10]
    recent_orders_data = AdminOrderSerializer(recent_orders, many=True).data
    
    # Calculate daily sales for trend analysis
    # extra() allows us to add custom SQL to extract date part
    daily_sales = orders_queryset.extra(
        select={'date': 'DATE(created_at)'}  # Extract date part from datetime
    ).values('date').annotate(
        orders_count=Count('id'),  # Count orders per day
        sales_amount=Sum('total_amount')  # Sum sales per day
    ).order_by('date')
    
    # Analyze top selling products
    # This aggregates data from OrderItems to find best-sellers
    top_products = OrderItem.objects.filter(
        order__created_at__gte=date_from  # Only items from orders in our date range
    ).values(
        'product__id', 'product__title'  # Group by product
    ).annotate(
        total_quantity=Sum('quantity'),  # Total quantity sold
        total_revenue=Sum(F('quantity') * F('price'))  # Total revenue (quantity × price)
    ).order_by('-total_quantity')[:10]  # Top 10 by quantity
    
    # Return comprehensive dashboard data
    return Response({
        'period_days': days,
        'total_orders': total_orders,
        'total_sales': total_sales,
        'paid_orders': paid_orders,
        'pending_orders': pending_orders,
        'orders_by_status': list(orders_by_status),
        'recent_orders': recent_orders_data,
        'daily_sales': list(daily_sales),
        'top_products': list(top_products),
    })


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def update_order_status(request, order_id):
    """
    API for admin to update order status and payment status.
    
    PATCH /api/admin/orders/{order_id}/status/
    - Requires admin authentication
    - Allows updating order status and payment status
    - Returns updated order data
    """
    
    # Try to get the order by ID
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found'}, status=404)
    
    # Get new values from request data
    new_status = request.data.get('status')
    is_paid = request.data.get('is_paid')
    
    # Update status if provided and valid
    if new_status and new_status in dict(Order.STATUS_CHOICES):
        order.status = new_status
    
    # Update payment status if provided
    if is_paid is not None:
        order.is_paid = is_paid
    
    # Save changes to database
    order.save()
    
    # Return updated order data
    return Response(AdminOrderSerializer(order).data)
