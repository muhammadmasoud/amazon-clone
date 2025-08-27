from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from products.models import Product
from PIL import Image, ImageDraw, ImageFont
import io
import hashlib

class Command(BaseCommand):
    help = 'Create and assign placeholder images to products'

    def handle(self, *args, **options):
        def create_placeholder_image(product_name, size=(600, 600)):
            """Create a placeholder image with product name"""
            # Generate a color based on product name hash
            hash_object = hashlib.md5(product_name.encode())
            hash_hex = hash_object.hexdigest()
            
            # Extract RGB values from hash
            r = int(hash_hex[0:2], 16)
            g = int(hash_hex[2:4], 16)
            b = int(hash_hex[4:6], 16)
            
            # Make colors more vibrant and pleasant
            r = min(255, r + 50)
            g = min(255, g + 50)
            b = min(255, b + 50)
            
            # Create image
            img = Image.new('RGB', size, color=(r, g, b))
            draw = ImageDraw.Draw(img)
            
            # Try to use a font, fallback to default if not available
            try:
                font = ImageFont.truetype("arial.ttf", 24)
            except:
                font = ImageFont.load_default()
            
            # Prepare text
            lines = product_name.split(' ')
            if len(lines) > 3:
                # Join words into max 3 lines
                text_lines = []
                current_line = ""
                for word in lines:
                    if len(current_line + " " + word) <= 15 and len(text_lines) < 2:
                        current_line += (" " + word) if current_line else word
                    else:
                        if current_line:
                            text_lines.append(current_line)
                        current_line = word
                if current_line:
                    text_lines.append(current_line)
                text = "\n".join(text_lines[:3])
            else:
                text = "\n".join(lines)
            
            # Calculate text position (center)
            text_lines = text.split('\n')
            total_height = len(text_lines) * 30
            y = (size[1] - total_height) // 2
            
            for line in text_lines:
                bbox = draw.textbbox((0, 0), line, font=font)
                text_width = bbox[2] - bbox[0]
                x = (size[0] - text_width) // 2
                draw.text((x, y), line, fill='white', font=font)
                y += 30
            
            # Save to bytes
            img_io = io.BytesIO()
            img.save(img_io, format='JPEG', quality=85)
            img_io.seek(0)
            
            return img_io.getvalue()

        products = Product.objects.all()
        updated_count = 0

        for product in products:
            if product.image:  # Skip if already has an image
                self.stdout.write(f"Skipping {product.title} - already has image")
                continue

            try:
                # Create placeholder image
                image_data = create_placeholder_image(product.title)
                
                # Create filename
                safe_filename = product.title.lower().replace(' ', '_').replace('&', 'and')
                
                # Save image to product
                image_content = ContentFile(image_data, name=f"{safe_filename}.jpg")
                product.image.save(f"{safe_filename}.jpg", image_content, save=True)
                
                updated_count += 1
                self.stdout.write(f"✓ Created placeholder image for {product.title}")
                
            except Exception as e:
                self.stdout.write(f"Error creating image for {product.title}: {str(e)}")

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created placeholder images for {updated_count} products')
        )
