from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from products.models import Product, Category
from decimal import Decimal
import requests
import time
import random

class Command(BaseCommand):
    help = 'Add more products to reach 40-70 total products'

    def handle(self, *args, **options):
        current_count = Product.objects.count()
        self.stdout.write(f"Current products: {current_count}")
        
        # Get or create categories
        electronics = Category.objects.get(name="Electronics")
        home = Category.objects.get(name="Home & Kitchen")
        fitness = Category.objects.get(name="Sports & Fitness")
        
        # Create additional categories
        clothing, _ = Category.objects.get_or_create(
            name="Clothing & Fashion",
            defaults={"description": "Clothing and fashion accessories"}
        )
        books, _ = Category.objects.get_or_create(
            name="Books & Media",
            defaults={"description": "Books, media and entertainment"}
        )
        automotive, _ = Category.objects.get_or_create(
            name="Automotive",
            defaults={"description": "Car accessories and automotive products"}
        )
        
        # Additional products to add (30 more products to reach ~50 total)
        additional_products = [
            # Electronics (15 more)
            {
                'title': 'MacBook Air M2',
                'price': 1199.99,
                'description': 'Ultra-thin laptop with M2 chip and all-day battery life',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Samsung Galaxy Tab S9',
                'price': 799.99,
                'description': 'Premium Android tablet with S Pen included',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Google Pixel 8 Pro',
                'price': 999.99,
                'description': 'AI-powered smartphone with advanced photography',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Dell XPS 13 Laptop',
                'price': 1099.99,
                'description': 'Premium ultrabook with InfinityEdge display',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Sony PlayStation 5',
                'price': 499.99,
                'description': 'Next-gen gaming console with 4K gaming',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Microsoft Surface Pro 9',
                'price': 1299.99,
                'description': '2-in-1 laptop tablet with detachable keyboard',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1572649114456-5b4b3c84a5d8?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Nintendo Switch OLED',
                'price': 349.99,
                'description': 'Portable gaming console with vivid OLED screen',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Bose QuietComfort Earbuds',
                'price': 279.99,
                'description': 'Premium noise-canceling true wireless earbuds',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'GoPro Hero 12 Black',
                'price': 399.99,
                'description': 'Action camera with 5.3K video and HyperSmooth',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Ring Video Doorbell Pro',
                'price': 249.99,
                'description': 'Smart doorbell with 1080p HD video and motion detection',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Nest Thermostat',
                'price': 129.99,
                'description': 'Smart thermostat that learns your schedule',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa2?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'iPad Air 5th Generation',
                'price': 599.99,
                'description': 'Powerful tablet with M1 chip and Apple Pencil support',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Kindle Paperwhite',
                'price': 139.99,
                'description': 'Waterproof e-reader with adjustable warm light',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Razer DeathAdder V3',
                'price': 89.99,
                'description': 'Ergonomic gaming mouse with Focus Pro sensor',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1563297007-3a9b4d8a9d47?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'SteelSeries Arctis 7P',
                'price': 149.99,
                'description': 'Wireless gaming headset with lossless audio',
                'category': electronics,
                'image_url': 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop&crop=center'
            },
            
            # Home & Kitchen (8 more)
            {
                'title': 'Instant Pot Duo Plus',
                'price': 119.99,
                'description': '9-in-1 electric pressure cooker with smart programs',
                'category': home,
                'image_url': 'https://images.unsplash.com/photo-1556909114-717c8a8e3e46?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'KitchenAid Stand Mixer',
                'price': 379.99,
                'description': 'Professional-grade stand mixer with multiple attachments',
                'category': home,
                'image_url': 'https://images.unsplash.com/photo-1586032010646-8c7ac4d2b67d?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Vitamix E310 Blender',
                'price': 349.99,
                'description': 'High-performance blender for smoothies and soups',
                'category': home,
                'image_url': 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Dyson V15 Detect',
                'price': 749.99,
                'description': 'Cordless vacuum with laser dust detection',
                'category': home,
                'image_url': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Shark Robot Vacuum',
                'price': 299.99,
                'description': 'Self-emptying robot vacuum with Wi-Fi connectivity',
                'category': home,
                'image_url': 'https://images.unsplash.com/photo-1558618666-a2b2c8c80d6c?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Philips Hue Smart Bulbs 4-Pack',
                'price': 99.99,
                'description': 'Color-changing smart LED bulbs with app control',
                'category': home,
                'image_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Lodge Cast Iron Skillet',
                'price': 34.99,
                'description': 'Pre-seasoned 12-inch cast iron skillet',
                'category': home,
                'image_url': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Keurig K-Supreme Coffee Maker',
                'price': 159.99,
                'description': 'Single-serve coffee maker with iced coffee capability',
                'category': home,
                'image_url': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop&crop=center'
            },
            
            # Sports & Fitness (5 more)
            {
                'title': 'Peloton Bike+',
                'price': 1895.99,
                'description': 'Premium exercise bike with rotating HD touchscreen',
                'category': fitness,
                'image_url': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Bowflex Adjustable Dumbbells',
                'price': 349.99,
                'description': 'Space-saving dumbbells that adjust from 5 to 52.5 lbs',
                'category': fitness,
                'image_url': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Yoga Mat Premium',
                'price': 49.99,
                'description': 'Non-slip yoga mat with alignment guides',
                'category': fitness,
                'image_url': 'https://images.unsplash.com/photo-1506629905607-c9b5d5b3d9c4?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Resistance Bands Set',
                'price': 29.99,
                'description': 'Complete resistance training set with multiple bands',
                'category': fitness,
                'image_url': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Garmin Forerunner 255',
                'price': 349.99,
                'description': 'GPS running watch with advanced training metrics',
                'category': fitness,
                'image_url': 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&h=600&fit=crop&crop=center'
            },
            
            # Clothing & Fashion (10 products)
            {
                'title': 'Levi\'s 501 Original Jeans',
                'price': 89.99,
                'description': 'Classic straight-fit denim jeans',
                'category': clothing,
                'image_url': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Nike Air Force 1 Sneakers',
                'price': 110.99,
                'description': 'Iconic basketball sneakers with classic design',
                'category': clothing,
                'image_url': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Patagonia Fleece Jacket',
                'price': 199.99,
                'description': 'Warm and lightweight fleece jacket for outdoor activities',
                'category': clothing,
                'image_url': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Ray-Ban Aviator Sunglasses',
                'price': 154.99,
                'description': 'Classic aviator sunglasses with UV protection',
                'category': clothing,
                'image_url': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Champion Hoodie',
                'price': 45.99,
                'description': 'Comfortable cotton blend hoodie with logo',
                'category': clothing,
                'image_url': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Adidas Ultraboost 22',
                'price': 189.99,
                'description': 'High-performance running shoes with Boost technology',
                'category': clothing,
                'image_url': 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Calvin Klein T-Shirt Pack',
                'price': 39.99,
                'description': 'Pack of 3 premium cotton t-shirts',
                'category': clothing,
                'image_url': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'The North Face Backpack',
                'price': 89.99,
                'description': 'Durable outdoor backpack with laptop compartment',
                'category': clothing,
                'image_url': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Timex Weekender Watch',
                'price': 49.99,
                'description': 'Classic analog watch with interchangeable straps',
                'category': clothing,
                'image_url': 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Converse Chuck Taylor All Star',
                'price': 55.99,
                'description': 'Iconic canvas sneakers in classic high-top style',
                'category': clothing,
                'image_url': 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=600&fit=crop&crop=center'
            },
            
            # Books & Media (5 products)
            {
                'title': 'Atomic Habits Book',
                'price': 18.99,
                'description': 'Bestselling book on building good habits and breaking bad ones',
                'category': books,
                'image_url': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Spotify Premium 12 Months',
                'price': 119.99,
                'description': 'Annual subscription to Spotify Premium music streaming',
                'category': books,
                'image_url': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Netflix Gift Card $50',
                'price': 50.00,
                'description': 'Digital gift card for Netflix streaming service',
                'category': books,
                'image_url': 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Programming Books Bundle',
                'price': 89.99,
                'description': 'Collection of 5 bestselling programming books',
                'category': books,
                'image_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Audible Subscription 6 Months',
                'price': 89.99,
                'description': '6-month subscription to Audible audiobook service',
                'category': books,
                'image_url': 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=600&h=600&fit=crop&crop=center'
            },
            
            # Automotive (5 products)
            {
                'title': 'Dash Cam 4K',
                'price': 199.99,
                'description': 'High-resolution dashboard camera with night vision',
                'category': automotive,
                'image_url': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Car Phone Mount',
                'price': 24.99,
                'description': 'Magnetic car phone holder for dashboard or vent',
                'category': automotive,
                'image_url': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Car Vacuum Cleaner',
                'price': 79.99,
                'description': 'Portable vacuum cleaner designed for car interiors',
                'category': automotive,
                'image_url': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Car Air Freshener Set',
                'price': 15.99,
                'description': 'Set of 6 long-lasting car air fresheners',
                'category': automotive,
                'image_url': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=600&fit=crop&crop=center'
            },
            {
                'title': 'Jump Starter Power Bank',
                'price': 89.99,
                'description': 'Portable car jump starter with USB charging ports',
                'category': automotive,
                'image_url': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=600&fit=crop&crop=center'
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
        
        for product_data in additional_products:
            self.stdout.write(f"Creating: {product_data['title']}")
            
            # Create the product
            product = Product.objects.create(
                title=product_data['title'],
                description=product_data['description'],
                unit_price=Decimal(str(product_data['price'])),
                category=product_data['category'],
                stock=random.randint(10, 100)  # Random stock between 10-100
            )
            
            # Download and assign image
            safe_filename = product_data['title'].lower().replace(' ', '_').replace('\'', '').replace('-', '_')
            image_content = download_image(product_data['image_url'], safe_filename)
            
            if image_content:
                product.image.save(f"{safe_filename}.jpg", image_content, save=True)
                self.stdout.write(f"✓ Image saved for {product.title}")
            else:
                self.stdout.write(f"✗ Failed to download image for {product.title}")
            
            created_count += 1
            time.sleep(0.3)  # Small delay to be respectful
        
        total_products = Product.objects.count()
        self.stdout.write(
            self.style.SUCCESS(f'Successfully added {created_count} products! Total: {total_products} products')
        )
