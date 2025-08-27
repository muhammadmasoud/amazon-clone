from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from products.models import Product
import requests
import time

class Command(BaseCommand):
    help = 'Update products with high-quality, curated real images'

    def handle(self, *args, **options):
        # Curated high-quality image URLs for each product
        # These are from Unsplash with specific image IDs for consistency
        product_image_urls = {
            'Gaming Laptop Pro': 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&h=600&fit=crop&crop=center',
            'Professional Smartphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop&crop=center',
            'Wireless Noise-Canceling Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&crop=center',
            'High-End Tablet': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop&crop=center',
            'Premium Smartwatch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&crop=center',
            'Professional DSLR Camera': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop&crop=center',
            'Mechanical Gaming Keyboard': 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&h=600&fit=crop&crop=center',
            'Wireless Gaming Mouse': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop&crop=center',
            '4K Monitor 32inch': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop&crop=center',
            'Bluetooth Speaker': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop&crop=center',
            'Smart Home Assistant': 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&h=600&fit=crop&crop=center',
            'Fitness Tracker': 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&h=600&fit=crop&crop=center',
            'Wireless Earbuds Pro': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop&crop=center',
            'External Hard Drive 2TB': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&h=600&fit=crop&crop=center',
            'Graphics Card RTX': 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&h=600&fit=crop&crop=center',
            'Memory Foam Pillow': 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&h=600&fit=crop&crop=center',
            'Coffee Maker Premium': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop&crop=center',
            'Air Fryer Deluxe': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop&crop=center',
            'Electric Toothbrush': 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&h=600&fit=crop&crop=center',
            'Portable Charger 20000mAh': 'https://images.unsplash.com/photo-1609592082880-f8b1d9e97d72?w=600&h=600&fit=crop&crop=center',
        }

        def download_curated_image(url, filename):
            """Download specific curated image"""
            try:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
                
                response = requests.get(url, headers=headers, timeout=15)
                
                if response.status_code == 200:
                    if response.headers.get('content-type', '').startswith('image/'):
                        return ContentFile(response.content, name=f"{filename}.jpg")
                    else:
                        self.stdout.write(f"Warning: Response is not an image")
                        return None
                else:
                    self.stdout.write(f"Failed to download. Status: {response.status_code}")
                    return None
                    
            except Exception as e:
                self.stdout.write(f"Error downloading: {str(e)}")
                return None

        products = Product.objects.all()
        updated_count = 0
        failed_count = 0

        self.stdout.write(f"Updating {products.count()} products with curated real images...")

        for i, product in enumerate(products, 1):
            self.stdout.write(f"\n[{i}/{products.count()}] {product.title}")
            
            # Get the curated image URL
            image_url = product_image_urls.get(product.title)
            
            if not image_url:
                # For products not in our curated list, use a generic high-quality image
                if 'Electronics' in str(product.category):
                    image_url = 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&h=600&fit=crop&crop=center'
                elif 'Home' in str(product.category):
                    image_url = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop&crop=center'
                else:
                    image_url = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop&crop=center'
            
            safe_filename = product.title.lower().replace(' ', '_').replace('&', 'and')
            
            self.stdout.write(f"Downloading: {image_url}")
            image_content = download_curated_image(image_url, safe_filename)
            
            if image_content:
                try:
                    # Delete old image
                    if product.image:
                        try:
                            product.image.delete(save=False)
                        except:
                            pass
                    
                    # Save new image
                    product.image.save(f"{safe_filename}.jpg", image_content, save=True)
                    updated_count += 1
                    self.stdout.write(f"✓ Success!")
                    
                except Exception as e:
                    self.stdout.write(f"✗ Save failed: {str(e)}")
                    failed_count += 1
            else:
                failed_count += 1
            
            # Polite delay
            time.sleep(0.5)

        # Summary
        self.stdout.write(f"\n" + "="*60)
        self.stdout.write(self.style.SUCCESS(f'✓ Updated {updated_count} products with real images'))
        if failed_count > 0:
            self.stdout.write(f"✗ Failed: {failed_count} products")
        self.stdout.write("="*60)
