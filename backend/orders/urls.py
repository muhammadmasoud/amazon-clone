from django.urls import path
from .views import (
    PlaceOrderView, 
    UserOrderHistoryView, 
    UserOrderDetailView,
    CancelOrderView,
    AdminOrderListView,
    AdminOrderDetailView,
    admin_dashboard_stats,
    update_order_status,
    order_tracking
)

"""
Enhanced URL Configuration for Orders App

This file defines all the URL patterns (routes) for the orders application.
Each URL pattern maps a specific URL to a corresponding view function or class.

URL Structure:
- User endpoints: /api/orders/...
- Admin endpoints: /api/admin/orders/...
- Public endpoints: /api/track/...
"""

urlpatterns = [
    # ===== USER ENDPOINTS =====
    # These endpoints are for regular users to manage their orders
    
    # POST /api/orders/ - Create a new order from cart
    # Enhanced with comprehensive shipping info and payment methods
    path('orders/', PlaceOrderView.as_view(), name='place-order'),
    
    # GET /api/orders/history/ - View user's order history  
    # Enhanced with filtering by status and date range
    path('orders/history/', UserOrderHistoryView.as_view(), name='user-order-history'),
    
    # GET /api/orders/{id}/ - View specific order details
    # Enhanced with tracking information and status timeline
    path('orders/<int:pk>/', UserOrderDetailView.as_view(), name='user-order-detail'),
    
    # POST /api/orders/{id}/cancel/ - Cancel order if eligible
    # Allows users to cancel orders in pending/confirmed status
    path('orders/<int:order_id>/cancel/', CancelOrderView.as_view(), name='cancel-order'),
    
    # ===== PUBLIC ENDPOINTS =====
    # GET /api/track/{order_number}/ - Track order by order number
    # Public order tracking with status timeline
    path('track/<str:order_number>/', order_tracking, name='order-tracking'),
    
    # ===== ADMIN ENDPOINTS =====
    # These endpoints are only accessible by admin users (is_staff=True)
    
    # GET /api/admin/orders/ - List all orders with enhanced filtering
    # Supports search, status filters, payment method filters, date ranges
    path('admin/orders/', AdminOrderListView.as_view(), name='admin-order-list'),
    
    # GET /api/admin/orders/{id}/ - View any order details
    # PUT /api/admin/orders/{id}/ - Update order information
    # Enhanced with comprehensive order management
    path('admin/orders/<int:pk>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
    
    # PATCH /api/admin/orders/{id}/status/ - Enhanced status updates
    # Supports automatic timestamp setting and tracking info
    path('admin/orders/<int:order_id>/status/', update_order_status, name='update-order-status'),
    
    # GET /api/admin/dashboard/stats/ - Enhanced dashboard statistics
    # Comprehensive analytics with customer insights and product performance
    path('admin/dashboard/stats/', admin_dashboard_stats, name='admin-dashboard-stats'),
]