from rest_framework import serializers
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from ..models import Product,Category,Review

class CategorySerializer(serializers.ModelSerializer):
    """
    Simple Category serializer that returns only id and name.
    No products list included - keeps response lightweight.
    """
    name = serializers.CharField(max_length=255, trim_whitespace=True)
    description = serializers.CharField(required=False, allow_blank=True, trim_whitespace=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']
    
    def validate_name(self, value):
        """
        Validate that category name is unique (case-insensitive).
        """
        if not value.strip():
            raise serializers.ValidationError("Category name cannot be empty.")
        
        # Check for uniqueness (case-insensitive)
        if Category.objects.filter(name__iexact=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("A category with this name already exists.")
        
        return value.strip().title()  # Capitalize each word

class ProductSerializer(serializers.ModelSerializer):
    """
    Product serializer with comprehensive validation and smart category handling:
    - On GET requests: Returns category name (user-friendly)
    - On POST/PUT/PATCH requests: Accepts category ID (DRF handles this automatically)
    """
    average_rating = serializers.FloatField(read_only=True)
    
    # Add custom validation fields
    title = serializers.CharField(
        max_length=255, 
        trim_whitespace=True,
        error_messages={
            'blank': 'Product title cannot be empty.',
            'max_length': 'Product title cannot exceed 255 characters.'
        }
    )
    
    description = serializers.CharField(
        max_length=1000,
        trim_whitespace=True,
        error_messages={
            'blank': 'Product description cannot be empty.',
            'max_length': 'Product description cannot exceed 1000 characters.'
        }
    )
    
    unit_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        error_messages={
            'invalid': 'Enter a valid price.',
            'min_value': 'Price must be greater than 0.',
            'max_digits': 'Price cannot have more than 8 digits before the decimal point.',
            'max_decimal_places': 'Price cannot have more than 2 decimal places.'
        }
    )
    
    stock = serializers.IntegerField(
        validators=[MinValueValidator(0)],
        error_messages={
            'invalid': 'Enter a valid stock number.',
            'min_value': 'Stock cannot be negative.'
        }
    )
    
    class Meta:
        model = Product
        fields = [
            'id',
            'title', 
            'description',
            'unit_price',
            'image',
            'stock',
            'date_added',
            'category',
            'average_rating'
        ]
        read_only_fields = ['date_added', 'average_rating']
    
    def validate_title(self, value):
        """
        Validate product title for uniqueness and content.
        """
        if not value.strip():
            raise serializers.ValidationError("Product title cannot be empty.")
        
        # Check for uniqueness (case-insensitive)
        if Product.objects.filter(title__iexact=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("A product with this title already exists.")
        
        return value.strip()
    
    def validate_category(self, value):
        """
        Validate that the category exists and is active.
        """
        if value is None:
            raise serializers.ValidationError("Category is required.")
        
        if not Category.objects.filter(pk=value.pk).exists():
            raise serializers.ValidationError("Selected category does not exist.")
        
        return value
    
    def validate(self, data):
        """
        Object-level validation for the entire product.
        """
        # Check if trying to set stock to 0 for a product that has pending orders
        if 'stock' in data and data['stock'] == 0 and self.instance:
            # You could add logic here to check for pending orders
            pass
        
        return data
    
    def to_representation(self, instance):
        """
        Customize the output representation for GET requests.
        Converts category ID to category name for user-friendly responses.
        Example: Instead of "category": 1, returns "category": "Electronics"
        DRF automatically handles category ID input for POST/PUT/PATCH requests.
        """
        representation = super().to_representation(instance)
        if instance.category:
            representation['category'] = instance.category.name
        return representation

class ReviewSerializer(serializers.ModelSerializer):
    # Enhanced validation for rating
    rating = serializers.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        error_messages={
            'invalid': 'Rating must be a number.',
            'min_value': 'Rating must be at least 1.',
            'max_value': 'Rating cannot be more than 5.'
        }
    )
    
    # Enhanced validation for title and content
    title = serializers.CharField(
        max_length=255,
        trim_whitespace=True,
        error_messages={
            'blank': 'Review title cannot be empty.',
            'max_length': 'Review title cannot exceed 255 characters.'
        }
    )
    
    content = serializers.CharField(
        trim_whitespace=True,
        error_messages={
            'blank': 'Review content cannot be empty.'
        }
    )
    
    # Display user information in response
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'title', 'content', 'rating', 'created_at', 'user_name']
        read_only_fields = ['id', 'created_at', 'user_name']
    
    def get_user_name(self, obj):
        """
        Return a user-friendly name for the reviewer.
        """
        if obj.user:
            if obj.user.first_name or obj.user.last_name:
                return f"{obj.user.first_name} {obj.user.last_name}".strip()
            return obj.user.username or obj.user.email
        return "Anonymous User"
    
    def validate_title(self, value):
        """
        Validate review title.
        """
        if not value.strip():
            raise serializers.ValidationError("Review title cannot be empty.")
        
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Review title must be at least 3 characters long.")
        
        return value.strip()
    
    def validate_content(self, value):
        """
        Validate review content.
        """
        if not value.strip():
            raise serializers.ValidationError("Review content cannot be empty.")
        
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Review content must be at least 10 characters long.")
        
        return value.strip()
    
    def validate(self, data):
        """
        Object-level validation to check for duplicate reviews.
        """
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Get the product from the view context
            product = self.context.get('product')
            if not product:
                # If product not in context, try to get it from the view
                view = self.context.get('view')
                if view and hasattr(view, 'kwargs'):
                    product_id = view.kwargs.get('product_id')
                    if product_id:
                        from ..models import Product
                        try:
                            product = Product.objects.get(pk=product_id)
                        except Product.DoesNotExist:
                            raise serializers.ValidationError("Product not found.")
            
            if product:
                # Check if user already reviewed this product
                existing_review = Review.objects.filter(
                    user=request.user, 
                    product=product
                ).exclude(pk=self.instance.pk if self.instance else None)
                
                if existing_review.exists():
                    raise serializers.ValidationError("You have already reviewed this product.")
        
        return data

    def create(self, validated_data):
        """
        This method is automatically called by DRF when serializer.save() is called.
        The 'validated_data' argument is a dict of the user's input AFTER it has been
        cleaned and validated by the serializer. It contains only 'title', 'content', 'rating'.
        """
        request = self.context['request']
        product = validated_data.pop('product')

        review = Review.objects.create(
            user=request.user,
            product=product,
            **validated_data
        )
        return review

    def to_representation(self, instance):
        """
        Customizes the data we send back in the response.
        Handles the user display name safely, even if user is None.
        """
        representation = super().to_representation(instance)
        
        # Safely get a display name for the user
        if instance.user:
            # Check if the user has a first or last name
            if instance.user.first_name or instance.user.last_name:
                full_name = f"{instance.user.first_name} {instance.user.last_name}".strip()
            else:
                # If no name, fall back to their username or email
                full_name = instance.user.username or instance.user.email
        else:
            # This should not happen if permissions are correct, but it's safe to handle
            full_name = "Anonymous User"
            
        representation['user'] = full_name
        return representation