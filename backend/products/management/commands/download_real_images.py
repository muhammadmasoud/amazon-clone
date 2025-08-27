from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from products.models import Product
import requests
import time
import os

class Command(BaseCommand):
    help = 'Download real product images from Unsplash and assign to products'

    def handle(self, *args, **options):
        # Unsplash API configuration
        # Note: For production, you should use the official Unsplash API with an access key
        # For now, we'll use the Source API which provides random images
        
        # Product-specific search terms for better image results
        product_image_mapping = {
            'Gaming Laptop Pro': 'gaming-laptop-computer',
            'Professional Smartphone': 'modern-smartphone-iphone',
            'Wireless Noise-Canceling Headphones': 'wireless-headphones-sony-bose',
            'High-End Tablet': 'tablet-ipad-pro',
            'Premium Smartwatch': 'apple-watch-smartwatch',
            'Professional DSLR Camera': 'dslr-camera-canon-nikon',
            'Mechanical Gaming Keyboard': 'mechanical-keyboard-gaming-rgb',
            'Wireless Gaming Mouse': 'gaming-mouse-wireless',
            '4K Monitor 32inch': '4k-monitor-display-screen',
            'Bluetooth Speaker': 'bluetooth-speaker-portable',
            'Smart Home Assistant': 'amazon-echo-google-home',
            'Fitness Tracker': 'fitness-tracker-fitbit',
            'Wireless Earbuds Pro': 'airpods-wireless-earbuds',
            'External Hard Drive 2TB': 'external-hard-drive-storage',
            'Graphics Card RTX': 'graphics-card-nvidia-rtx',
            'Memory Foam Pillow': 'memory-foam-pillow-white',
            'Coffee Maker Premium': 'coffee-machine-espresso',
            'Air Fryer Deluxe': 'air-fryer-kitchen-appliance',
            'Electric Toothbrush': 'electric-toothbrush-oral-care',
            'Portable Charger 20000mAh': 'power-bank-portable-charger',
        }

        def download_real_image(search_term, filename):
            """Download real product image from Unsplash"""
            try:
                # Using Unsplash Source API with specific search terms
                # This provides higher quality, more relevant images
                base_url = "https://source.unsplash.com/600x600"
                url = f"{base_url}/?{search_term}"
                
                # Add headers to appear more like a real browser
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
                
                self.stdout.write(f"Downloading from: {url}")
                response = requests.get(url, headers=headers, timeout=15)
                
                if response.status_code == 200:
                    # Check if we got an actual image
                    if response.headers.get('content-type', '').startswith('image/'):
                        return ContentFile(response.content, name=f"{filename}.jpg")
                    else:
                        self.stdout.write(f"Warning: Response doesn't seem to be an image for {search_term}")
                        return None
                else:
                    self.stdout.write(f"Failed to download image for {search_term}. Status: {response.status_code}")
                    return None
                    
            except requests.exceptions.RequestException as e:
                self.stdout.write(f"Network error downloading image for {search_term}: {str(e)}")
                return None
            except Exception as e:
                self.stdout.write(f"Error downloading image for {search_term}: {str(e)}")
                return None

        # Get all products
        products = Product.objects.all()
        updated_count = 0
        failed_count = 0

        self.stdout.write(f"Found {products.count()} products to update")

        for i, product in enumerate(products, 1):
            self.stdout.write(f"\n[{i}/{products.count()}] Processing: {product.title}")
            
            # Get search term for this product
            search_term = product_image_mapping.get(product.title)
            if not search_term:
                # Create a generic search term from product title
                search_term = product.title.lower().replace(' ', '-')
                # Add some relevant keywords
                if 'laptop' in search_term:
                    search_term += '-computer'
                elif 'phone' in search_term:
                    search_term += '-mobile'
                elif 'watch' in search_term:
                    search_term += '-wearable'
            
            # Create a safe filename
            safe_filename = product.title.lower().replace(' ', '_').replace('&', 'and')
            
            # Download the image
            image_content = download_real_image(search_term, safe_filename)
            
            if image_content:
                try:
                    # Delete old image if exists
                    if product.image:
                        try:
                            product.image.delete(save=False)
                        except:
                            pass
                    
                    # Save new image
                    product.image.save(f"{safe_filename}.jpg", image_content, save=True)
                    updated_count += 1
                    self.stdout.write(f"✓ Successfully updated image for {product.title}")
                    
                except Exception as e:
                    self.stdout.write(f"✗ Failed to save image for {product.title}: {str(e)}")
                    failed_count += 1
            else:
                self.stdout.write(f"✗ Failed to download image for {product.title}")
                failed_count += 1
            
            # Add delay to be respectful to the API
            # Unsplash allows reasonable usage but we should still be polite
            time.sleep(1)

        # Final summary
        self.stdout.write(f"\n" + "="*50)
        self.stdout.write(
            self.style.SUCCESS(f'Image Update Complete!')
        )
        self.stdout.write(f"✓ Successfully updated: {updated_count} products")
        if failed_count > 0:
            self.stdout.write(f"✗ Failed to update: {failed_count} products")
        self.stdout.write(f"Total processed: {products.count()} products")
        self.stdout.write("="*50)
