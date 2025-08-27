from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from products.models import Product, Review, Category
from decimal import Decimal
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Update product prices to 0-2000$ range and create sample reviews'

    def handle(self, *args, **options):
        # Update product prices to be in 0-2000$ range
        products = Product.objects.all()
        
        if not products.exists():
            self.stdout.write('No products found. Run create_sample_orders first.')
            return
        
        # Update prices
        price_ranges = {
            'Gaming Laptop Pro': 1899.99,
            'Professional Smartphone': 1299.99,
            'Wireless Noise-Canceling Headphones': 599.99,
            'High-End Tablet': 849.99,
            'Premium Smartwatch': 699.99,
            'Professional DSLR Camera': 1699.99,
            'Mechanical Gaming Keyboard': 299.99,
            'Wireless Gaming Mouse': 149.99,
            '4K Monitor 32"': 1299.99,
            'Bluetooth Speaker': 89.99,
            'Smart Home Assistant': 199.99,
            'Fitness Tracker': 129.99,
            'Wireless Earbuds Pro': 349.99,
            'External Hard Drive 2TB': 179.99,
            'Graphics Card RTX': 1599.99,
            'Memory Foam Pillow': 49.99,
            'Coffee Maker Premium': 259.99,
            'Air Fryer Deluxe': 199.99,
            'Electric Toothbrush': 79.99,
            'Portable Charger 20000mAh': 59.99,
        }
        
        # Generate random prices for products not in the predefined list
        for product in products:
            if product.title in price_ranges:
                new_price = price_ranges[product.title]
            else:
                # Generate random price between 10 and 1999
                new_price = round(random.uniform(10.00, 1999.00), 2)
            
            product.unit_price = Decimal(str(new_price))
            product.save()
            self.stdout.write(f'Updated {product.title}: ${new_price}')
        
        # Create sample users for reviews if they don't exist
        review_users = []
        for i in range(5):
            username = f'reviewer{i+1}'
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': f'{username}@example.com',
                    'first_name': f'Reviewer',
                    'last_name': f'{i+1}',
                    'mobile': f'987654321{i}',
                }
            )
            if created:
                user.set_password('reviewpass123')
                user.save()
                self.stdout.write(f'Created reviewer: {username}')
            review_users.append(user)
        
        # Create sample reviews for products
        review_titles = [
            'Great product!',
            'Excellent quality',
            'Good value for money',
            'Highly recommended',
            'Amazing features',
            'Perfect for my needs',
            'Outstanding performance',
            'Love this product',
            'Exceeded expectations',
            'Worth every penny'
        ]
        
        review_contents = [
            'This product is absolutely fantastic. The quality is top-notch and it works exactly as described.',
            'I am very satisfied with this purchase. Great build quality and excellent performance.',
            'Highly recommend this product to anyone looking for quality and reliability.',
            'The product arrived quickly and works perfectly. Very happy with my purchase.',
            'Excellent value for the price. The features are amazing and it\'s very user-friendly.',
            'This product has exceeded my expectations in every way. Definitely worth buying.',
            'Outstanding quality and performance. I would definitely buy this again.',
            'Perfect product for my needs. Great design and functionality.',
            'Very impressed with this purchase. The quality is excellent and it works great.',
            'Amazing product! The features are exactly what I was looking for.'
        ]
        
        # Add reviews to random products
        products_list = list(products)
        for _ in range(50):  # Create 50 reviews
            product = random.choice(products_list)
            user = random.choice(review_users)
            
            # Check if user already reviewed this product
            if Review.objects.filter(user=user, product=product).exists():
                continue
            
            Review.objects.create(
                product=product,
                user=user,
                title=random.choice(review_titles),
                content=random.choice(review_contents),
                rating=random.randint(3, 5)  # Random rating between 3-5 stars
            )
        
        total_reviews = Review.objects.count()
        self.stdout.write(
            self.style.SUCCESS(f'Successfully updated product data and created reviews. Total reviews: {total_reviews}')
        )
