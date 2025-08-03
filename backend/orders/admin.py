from django.contrib import admin
from .models import Order, OrderItem

"""
Django Admin Configuration for Orders App

This file configures how the Order and OrderItem models appear in Django's admin interface.
The admin interface is a web-based tool for managing database records through a user-friendly interface.
"""

class OrderItemInline(admin.TabularInline):
    """
    Inline admin class for OrderItem model.
    
    This allows editing OrderItems directly within the Order admin page.
    TabularInline displays the items in a table format (as opposed to StackedInline which is vertical).
    This is useful because orders typically have multiple items.
    """
    model = OrderItem  # The model to display inline
    extra = 0  # Don't show extra empty forms by default
    readonly_fields = ('subtotal',)  # Make subtotal field read-only (it's calculated)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """
    Admin configuration for Order model.
    
    This class defines how Orders appear and behave in the Django admin interface.
    It includes what fields to display, how to filter and search, and how to organize the form.
    """
    
    # Fields to display in the order list view (main admin page)
    # These columns will be shown when viewing all orders
    list_display = ['id', 'user', 'status', 'is_paid', 'total_amount', 'created_at']
    
    # Add filter sidebar for these fields
    # Users can filter orders by status, payment status, and creation date
    list_filter = ['status', 'is_paid', 'created_at']
    
    # Fields that can be searched using the search box
    # Django will search in order ID, username, and user email
    search_fields = ['id', 'user__username', 'user__email']
    
    # Fields that cannot be edited (automatically calculated or set)
    readonly_fields = ['created_at', 'updated_at', 'total_amount']
    
    # Include the OrderItem inline editor
    # This allows editing order items directly on the order page
    inlines = [OrderItemInline]
    
    # Organize the form into logical sections using fieldsets
    # This makes the admin form cleaner and more organized
    fieldsets = (
        ('Order Information', {
            'fields': ('user', 'status', 'is_paid', 'total_amount')
        }),
        ('Shipping', {
            'fields': ('shipping_address',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)  # This section starts collapsed
        }),
    )

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    """
    Admin configuration for OrderItem model.
    
    This provides a separate admin interface for managing individual order items.
    While items are usually managed through the Order admin, this provides additional flexibility.
    """
    
    # Fields to display in the order item list view
    list_display = ['order', 'product', 'quantity', 'price', 'subtotal']
    
    # Filter by order creation date (accessed through the order relationship)
    list_filter = ['order__created_at']
    
    # Search by order ID and product title
    search_fields = ['order__id', 'product__title']
