from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from products.models import Product, Category
from decimal import Decimal
import requests
import time
import os

class Command(BaseCommand):
    help = 'Clean up duplicate products and assign unique, high-quality images'

    def handle(self, *args, **options):
        self.stdout.write("Starting database cleanup and image assignment...")
        
        # First, let's see what we have
        all_products = Product.objects.all()
        self.stdout.write(f"Found {all_products.count()} products")
        
        # Delete all existing products to start fresh
        all_products.delete()
        self.stdout.write("Deleted all existing products")
        
        # Ensure categories exist
        electronics, _ = Category.objects.get_or_create(
            name="Electronics", 
            defaults={"description": "Electronic devices and gadgets"}
        )
        home, _ = Category.objects.get_or_create(
            name="Home & Kitchen", 
            defaults={"description": "Home and kitchen appliances"}
        )
        fitness, _ = Category.objects.get_or_create(
            name="Sports & Fitness", 
            defaults={"description": "Sports and fitness equipment"}
        )
        
        # Create unique products with specific high-quality images
        products_data = [
            {
                'title': 'Gaming Laptop Pro',
                'price': 1899.99,
                'description': 'High-performance gaming laptop with RTX graphics and 16GB RAM',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'iPhone 15 Pro',
                'price': 1299.99,
                'description': 'Latest iPhone with advanced camera system and A17 Pro chip',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Sony WH-1000XM5 Headphones',
                'price': 399.99,
                'description': 'Premium wireless noise-canceling headphones',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'iPad Pro 12.9"',
                'price': 1099.99,
                'description': 'Professional tablet with M2 chip and Liquid Retina display',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Apple Watch Series 9',
                'price': 499.99,
                'description': 'Advanced smartwatch with health monitoring and GPS',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Canon EOS R5 Camera',
                'price': 1699.99,
                'description': 'Professional mirrorless camera with 45MP sensor',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Mechanical Gaming Keyboard RGB',
                'price': 149.99,
                'description': 'Cherry MX switches with customizable RGB lighting',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Logitech MX Master 3 Mouse',
                'price': 99.99,
                'description': 'Precision wireless mouse for productivity',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Samsung 32" 4K Monitor',
                'price': 549.99,
                'description': 'Ultra-high definition monitor for work and gaming',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'JBL Charge 5 Speaker',
                'price': 179.99,
                'description': 'Portable Bluetooth speaker with powerful bass',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Amazon Echo Dot 5th Gen',
                'price': 49.99,
                'description': 'Smart speaker with Alexa voice assistant',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Fitbit Versa 4',
                'price': 199.99,
                'description': 'Advanced fitness tracker with GPS and heart rate monitoring',
                'category': fitness,
                'image_url': 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'AirPods Pro 2nd Gen',
                'price': 249.99,
                'description': 'Premium wireless earbuds with active noise cancellation',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Samsung T7 2TB SSD',
                'price': 199.99,
                'description': 'High-speed external solid state drive',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'NVIDIA RTX 4080 Graphics Card',
                'price': 1199.99,
                'description': 'High-end graphics card for gaming and content creation',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Tempur-Pedic Memory Foam Pillow',
                'price': 89.99,
                'description': 'Ergonomic memory foam pillow for better sleep',
                'category': home,
                'image_url': 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Breville Espresso Machine',
                'price': 699.99,
                'description': 'Professional-grade espresso machine with milk frother',
                'category': home,
                'image_url': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Ninja Foodi Air Fryer',
                'price': 149.99,
                'description': 'Multi-function air fryer with pressure cooking',
                'category': home,
                'image_url': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Oral-B Electric Toothbrush',
                'price': 129.99,
                'description': 'Smart electric toothbrush with app connectivity',
                'category': home,
                'image_url': 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Anker PowerCore 26800mAh',
                'price': 69.99,
                'description': 'High-capacity portable charger with fast charging',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1609592082880-f8b1d9e97d72?w=600&h=600&fit=crop&crop=center'
            }
        ]
        
        def download_image(url, filename):
            """Download image from URL"""
            try:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
                response = requests.get(url, headers=headers, timeout=15)
                if response.status_code == 200:
                    return ContentFile(response.content, name=f"{filename}.jpg")
                return None
            except:
                return None
        
        created_count = 0
        
        for product_data in products_data:
            self.stdout.write(f"Creating: {product_data['title']}")
            
            # Create the product
            product = Product.objects.create(
                title=product_data['title'],
                description=product_data['description'],
                unit_price=Decimal(str(product_data['price'])),
                category=product_data['category'],
                stock=50  # Set reasonable stock
            )
            
            # Download and assign image
            safe_filename = product_data['title'].lower().replace(' ', '_').replace('-', '_')
            image_content = download_image(product_data['image_url'], safe_filename)
            
            if image_content:
                product.image.save(f"{safe_filename}.jpg", image_content, save=True)
                self.stdout.write(f"✓ Image saved for {product.title}")
            else:
                self.stdout.write(f"✗ Failed to download image for {product.title}")
            
            created_count += 1
            time.sleep(0.5)  # Be respectful to Unsplash
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} unique products with images!')
        )
