from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from products.models import Product
import requests
import os
import time

class Command(BaseCommand):
    help = 'Download and assign images to products from Unsplash'

    def handle(self, *args, **options):
        # Product categories and their Unsplash search terms
        product_image_mapping = {
            'Gaming Laptop Pro': 'gaming-laptop',
            'Professional Smartphone': 'smartphone',
            'Wireless Noise-Canceling Headphones': 'wireless-headphones',
            'High-End Tablet': 'tablet',
            'Premium Smartwatch': 'smartwatch',
            'Professional DSLR Camera': 'dslr-camera',
            'Mechanical Gaming Keyboard': 'gaming-keyboard',
            'Wireless Gaming Mouse': 'gaming-mouse',
            '4K Monitor 32inch': '4k-monitor',
            'Bluetooth Speaker': 'bluetooth-speaker',
            'Smart Home Assistant': 'smart-speaker',
            'Fitness Tracker': 'fitness-tracker',
            'Wireless Earbuds Pro': 'wireless-earbuds',
            'External Hard Drive 2TB': 'external-hard-drive',
            'Graphics Card RTX': 'graphics-card',
            'Memory Foam Pillow': 'memory-foam-pillow',
            'Coffee Maker Premium': 'coffee-maker',
            'Air Fryer Deluxe': 'air-fryer',
            'Electric Toothbrush': 'electric-toothbrush',
            'Portable Charger 20000mAh': 'portable-charger',
        }

        def download_image(search_term, filename):
            """Download image from Unsplash"""
            try:
                # Using Unsplash Source API for simple image access
                url = f"https://source.unsplash.com/600x600/?{search_term}"
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    return ContentFile(response.content, name=f"{filename}.jpg")
                else:
                    self.stdout.write(f"Failed to download image for {search_term}")
                    return None
            except Exception as e:
                self.stdout.write(f"Error downloading image for {search_term}: {str(e)}")
                return None

        products = Product.objects.all()
        updated_count = 0

        for product in products:
            if product.image:  # Skip if already has an image
                continue

            search_term = product_image_mapping.get(product.title)
            if not search_term:
                # Generate a generic search term based on the product title
                search_term = product.title.lower().replace(' ', '-')

            self.stdout.write(f"Downloading image for {product.title}...")
            
            # Create a safe filename
            safe_filename = product.title.lower().replace(' ', '_').replace('&', 'and')
            
            image_content = download_image(search_term, safe_filename)
            if image_content:
                product.image.save(f"{safe_filename}.jpg", image_content, save=True)
                updated_count += 1
                self.stdout.write(f"✓ Image saved for {product.title}")
            
            # Add a small delay to be respectful to the API
            time.sleep(0.5)

        self.stdout.write(
            self.style.SUCCESS(f'Successfully updated {updated_count} products with images')
        )
