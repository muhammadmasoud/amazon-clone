from django.core.management.base import BaseCommand
from products.models import Product

class Command(BaseCommand):
    help = 'Assign placeholder image URLs to products'

    def handle(self, *args, **options):
        # Product image mappings with Unsplash URLs
        product_image_mapping = {
            'Gaming Laptop Pro': 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&h=600&fit=crop',
            'Professional Smartphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop',
            'Wireless Noise-Canceling Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
            'High-End Tablet': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop',
            'Premium Smartwatch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
            'Professional DSLR Camera': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop',
            'Mechanical Gaming Keyboard': 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&h=600&fit=crop',
            'Wireless Gaming Mouse': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop',
            '4K Monitor 32inch': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop',
            'Bluetooth Speaker': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop',
            'Smart Home Assistant': 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&h=600&fit=crop',
            'Fitness Tracker': 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&h=600&fit=crop',
            'Wireless Earbuds Pro': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop',
            'External Hard Drive 2TB': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&h=600&fit=crop',
            'Graphics Card RTX': 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&h=600&fit=crop',
            'Memory Foam Pillow': 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&h=600&fit=crop',
            'Coffee Maker Premium': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop',
            'Air Fryer Deluxe': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop',
            'Electric Toothbrush': 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&h=600&fit=crop',
            'Portable Charger 20000mAh': 'https://images.unsplash.com/photo-1609592082880-f8b1d9e97d72?w=600&h=600&fit=crop',
        }

        products = Product.objects.all()
        updated_count = 0

        for product in products:
            if product.image:  # Skip if already has an image
                continue

            # Get the mapped image URL or create a generic one
            image_url = product_image_mapping.get(product.title)
            if not image_url:
                # Create a generic placeholder based on category
                if 'Electronics' in str(product.category):
                    image_url = 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&h=600&fit=crop'
                elif 'Home' in str(product.category):
                    image_url = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop'
                else:
                    image_url = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop'

            # For now, we'll store the URL in the image field (this is a temporary solution)
            # In a real app, you'd want to download and store the actual images
            product.image = f"products/{product.title.lower().replace(' ', '_')}.jpg"
            product.save()
            updated_count += 1
            self.stdout.write(f"✓ Image placeholder assigned for {product.title}")

        self.stdout.write(
            self.style.SUCCESS(f'Successfully assigned image placeholders to {updated_count} products')
        )
