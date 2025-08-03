from django.db import models
from users.models import User
from products.models import Product
from decimal import Decimal

class Order(models.Model):
    """
    Order model represents a customer's order in the e-commerce system.
    Each order belongs to a user and contains multiple order items.
    """
    
    # Define possible order statuses as choices
    # This ensures data consistency and provides a dropdown in admin
    STATUS_CHOICES = [
        ('pending', 'Pending'),        # Order placed but not processed
        ('processing', 'Processing'),  # Order is being prepared
        ('shipped', 'Shipped'),        # Order has been shipped
        ('delivered', 'Delivered'),    # Order has been delivered
        ('cancelled', 'Cancelled'),    # Order has been cancelled
    ]
    
    # Foreign key to User - each order belongs to one user
    # CASCADE means if user is deleted, their orders are also deleted
    # related_name='orders' allows us to access user.orders.all()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    
    # Text field to store the shipping address
    shipping_address = models.TextField()
    
    # Automatically set when order is created (auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Automatically updated every time the order is saved (auto_now=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Boolean field to track payment status, defaults to False (unpaid)
    is_paid = models.BooleanField(default=False)
    
    # CharField with predefined choices for order status
    # max_length=20 is enough for our status values
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Decimal field for storing money amounts (better than FloatField for currency)
    # max_digits=10 allows up to 99,999,999.99
    # decimal_places=2 gives us cents precision
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        """String representation of the order for admin and debugging"""
        return f"Order #{self.id} by {self.user.username}"

    def calculate_total(self):
        """
        Calculate the total amount of the order by summing all order items.
        This method iterates through all related OrderItems and calculates
        the total cost (quantity × price for each item).
        """
        # Use the 'items' related name to get all OrderItems for this order
        # Sum up (quantity * price) for each item
        total = sum(item.quantity * item.price for item in self.items.all())
        
        # Update the total_amount field and save to database
        self.total_amount = total
        self.save()
        return total

    class Meta:
        """
        Meta class defines metadata for the model.
        ordering = ['-created_at'] means orders will be sorted by creation date,
        newest first (the minus sign indicates descending order).
        """
        ordering = ['-created_at']

class OrderItem(models.Model):
    """
    OrderItem represents individual products within an order.
    Each OrderItem contains one product with a specific quantity and price.
    This design allows tracking the price at the time of purchase.
    """
    
    # Foreign key to Order - each item belongs to one order
    # related_name='items' allows us to access order.items.all()
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    
    # Foreign key to Product - each item references one product
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    
    # Positive integer for quantity (can't be negative)
    quantity = models.PositiveIntegerField()
    
    # Price at the time of order (important for price history)
    # We store the price here so if product price changes later,
    # the order still shows the original price paid
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        """String representation showing quantity and product name"""
        return f"{self.quantity} x {self.product.title}"

    @property
    def subtotal(self):
        """
        Property method to calculate subtotal for this item.
        @property decorator makes this accessible like an attribute: item.subtotal
        Returns quantity multiplied by price.
        """
        return self.quantity * self.price