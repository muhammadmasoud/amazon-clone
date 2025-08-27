from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from orders.models import Order, OrderItem
from products.models import Product
from decimal import Decimal
import random
from datetime import datetime, timedelta

# Get the User model (could be custom user model)
User = get_user_model()

class Command(BaseCommand):
    """
    Django Management Command to create sample orders for testing.
    
    This is a custom management command that can be run from the terminal:
    python manage.py create_sample_orders --count 20
    
    Management commands are useful for:
    - Data migration and seeding
    - Periodic tasks
    - Administrative operations
    - Testing and development setup
    """
    
    # Help text shown when running: python manage.py help create_sample_orders
    help = 'Create sample orders for testing'

    def add_arguments(self, parser):
        """
        Define command line arguments for this command.
        
        This allows users to customize the command behavior:
        python manage.py create_sample_orders --count 50
        """
        parser.add_argument(
            '--count',              # Argument name
            type=int,               # Expected data type
            default=10,             # Default value if not provided
            help='Number of orders to create',  # Help text for this argument
        )

    def handle(self, *args, **options):
        """
        Main method that executes when the command is run.
        
        This method contains all the logic for creating sample data.
        *args and **options contain command line arguments.
        """
        # Get the count from command line arguments
        count = options['count']
        
        # ===== CREATE TEST USERS =====
        # Create a few test users for our sample orders
        users = []
        for i in range(3):  # Create 3 test users
            username = f'testuser{i+1}'
            
            # get_or_create returns (object, created_boolean)
            # This prevents duplicate users if command is run multiple times
            user, created = User.objects.get_or_create(
                username=username,
                defaults={  # These values are only used if user doesn't exist
                    'email': f'{username}@example.com',
                    'first_name': f'Test',
                    'last_name': f'User {i+1}',
                    'mobile': f'123456789{i}',
                }
            )
            
            # Set password only for new users
            if created:
                user.set_password('testpass123')  # Hash the password properly
                user.save()
                self.stdout.write(f'Created user: {username}')  # Print success message
                
            users.append(user)

        # ===== CREATE TEST PRODUCTS =====
        # Create sample products if they don't exist
        products = []
        
        # List of (product_name, price) tuples - prices range from 0-2000$
        product_names = [
            ('Gaming Laptop Pro', 1899.99),
            ('Professional Smartphone', 1299.99),
            ('Wireless Noise-Canceling Headphones', 599.99),
            ('High-End Tablet', 849.99),
            ('Premium Smartwatch', 699.99),
            ('Professional DSLR Camera', 1699.99),
            ('Mechanical Gaming Keyboard', 299.99),
            ('Wireless Gaming Mouse', 149.99),
            ('4K Monitor 32"', 1299.99),
            ('Bluetooth Speaker', 89.99),
            ('Smart Home Assistant', 199.99),
            ('Fitness Tracker', 129.99),
            ('Wireless Earbuds Pro', 349.99),
            ('External Hard Drive 2TB', 179.99),
            ('Graphics Card RTX', 1599.99),
            ('Memory Foam Pillow', 49.99),
            ('Coffee Maker Premium', 259.99),
            ('Air Fryer Deluxe', 199.99),
            ('Electric Toothbrush', 79.99),
            ('Portable Charger 20000mAh', 59.99),
        ]
        
        # Create each product
        for name, price in product_names:
            product, created = Product.objects.get_or_create(
                title=name,
                defaults={
                    'description': f'High quality {name.lower()} for your needs',
                    'unit_price': Decimal(str(price)),  # Convert to Decimal for accuracy
                    'stock': random.randint(10, 100),   # Random stock between 10-100
                }
            )
            if created:
                self.stdout.write(f'Created product: {name}')
            products.append(product)

        # ===== CREATE SAMPLE ORDERS =====
        # List of possible order statuses to randomly assign
        statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
        
        # Create the specified number of orders
        for i in range(count):
            # Select random user for this order
            user = random.choice(users)
            
            # Create random creation date (within last 30 days)
            # This makes the data look more realistic
            created_date = datetime.now() - timedelta(days=random.randint(0, 30))
            
            # Create the order with random data
            order = Order.objects.create(
                user=user,
                # Generate random shipping address
                shipping_address=f'{random.randint(100, 999)} Test St, Test City, TS {random.randint(10000, 99999)}',
                status=random.choice(statuses),          # Random status
                is_paid=random.choice([True, False]),    # Random payment status
                created_at=created_date,                 # Random creation date
            )
            
            # ===== ADD RANDOM ORDER ITEMS =====
            # Each order will have 1-4 random items
            num_items = random.randint(1, 4)
            total = Decimal('0')  # Track total order amount
            
            # Create random order items
            for _ in range(num_items):
                product = random.choice(products)           # Random product
                quantity = random.randint(1, 3)            # Random quantity (1-3)
                price = product.unit_price                  # Use current product price
                
                # Create the order item
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price=price
                )
                
                # Add to total (quantity × price)
                total += price * quantity
            
            # Update order with calculated total
            order.total_amount = total
            order.save()
            
            # Print progress message
            self.stdout.write(f'Created order #{order.id} for {user.username} - ${total}')

        # Print final success message with styling
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {count} sample orders')
        )
