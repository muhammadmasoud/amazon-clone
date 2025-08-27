#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to Python path
sys.path.append('C:/Users/kldma/Desktop/ITI/Amazon Clone/amazon-clone/backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from products.models import Product, Category
from decimal import Decimal

def create_test_products():
    # Create a few test products to test the price filter
    
    # Create a test category
    category, created = Category.objects.get_or_create(
        name='Electronics',
        defaults={'description': 'Electronic devices'}
    )
    
    test_products = [
        ('Test Laptop', 999.99),
        ('Test Phone', 599.99),
        ('Test Tablet', 299.99),
        ('Test Headphones', 149.99),
        ('Test Mouse', 29.99),
    ]
    
    for name, price in test_products:
        product, created = Product.objects.get_or_create(
            title=name,
            defaults={
                'description': f'Test product: {name}',
                'unit_price': Decimal(str(price)),
                'stock': 10,
                'category': category,
            }
        )
        if created:
            print(f'Created product: {name} - ${price}')
        else:
            print(f'Product already exists: {name}')

if __name__ == '__main__':
    create_test_products()
    print('Test products creation completed!')
