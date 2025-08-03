from django.urls import path
from .views import (
    PlaceOrderView, 
    UserOrderHistoryView, 
    UserOrderDetailView,
    AdminOrderListView,
    AdminOrderDetailView,
    admin_dashboard_stats,
    update_order_status
)

"""
URL Configuration for Orders App

This file defines all the URL patterns (routes) for the orders application.
Each URL pattern maps a specific URL to a corresponding view function or class.

URL Structure:
- User endpoints: /api/orders/...
- Admin endpoints: /api/admin/orders/...
"""

urlpatterns = [
    # ===== USER ENDPOINTS =====
    # These endpoints are for regular users to manage their orders
    
    # POST /api/orders/ - Create a new order from cart
    # Handles the checkout process when users place orders
    path('orders/', PlaceOrderView.as_view(), name='place-order'),
    
    # GET /api/orders/history/ - View user's order history  
    # Returns paginated list of all orders for the authenticated user
    path('orders/history/', UserOrderHistoryView.as_view(), name='user-order-history'),
    
    # GET /api/orders/{id}/ - View specific order details
    # Users can only access their own orders (security enforced in view)
    # <int:pk> means the URL expects an integer parameter named 'pk' (primary key)
    path('orders/<int:pk>/', UserOrderDetailView.as_view(), name='user-order-detail'),
    
    # ===== ADMIN ENDPOINTS =====
    # These endpoints are only accessible by admin users (is_staff=True)
    
    # GET /api/admin/orders/ - List all orders with filtering
    # Supports query parameters: ?status=pending&is_paid=true&date_from=2024-01-01
    path('admin/orders/', AdminOrderListView.as_view(), name='admin-order-list'),
    
    # GET /api/admin/orders/{id}/ - View any order details
    # PUT /api/admin/orders/{id}/ - Update order information
    # Admins can view and modify any order in the system
    path('admin/orders/<int:pk>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
    
    # PATCH /api/admin/orders/{id}/status/ - Update order status
    # Quick endpoint for updating order status and payment status
    # <int:order_id> creates a parameter that gets passed to the view function
    path('admin/orders/<int:order_id>/status/', update_order_status, name='update-order-status'),
    
    # GET /api/admin/dashboard/stats/ - Dashboard statistics
    # Returns comprehensive analytics for admin dashboard
    # Supports query parameter: ?days=30 for time period
    path('admin/dashboard/stats/', admin_dashboard_stats, name='admin-dashboard-stats'),
]