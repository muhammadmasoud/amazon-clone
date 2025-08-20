from rest_framework import serializers
from ..models import Product,Category,Review

class CategorySerializer(serializers.ModelSerializer):
    """
    Simple Category serializer that returns only id and name.
    No products list included - keeps response lightweight.
    """
    class Meta:
        model = Category
        fields = ['id', 'name']

class ProductSerializer(serializers.ModelSerializer):
    """
    Product serializer with smart category handling:
    - On GET requests: Returns category name (user-friendly)
    - On POST/PUT/PATCH requests: Accepts category ID (DRF handles this automatically)
    """
    average_rating = serializers.FloatField(read_only=True)
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
        read_only_fields = ['date_added']
    
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
    rating = serializers.IntegerField(min_value=1, max_value=5)

    class Meta:
        model = Review
        fields = ['id', 'title', 'content', 'rating', 'created_at']
        read_only_fields = ['id', 'created_at']

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
                # If no name, fall back to their email
                full_name = instance.user.email
        else:
            # This should not happen if permissions are correct, but it's safe to handle
            full_name = "Anonymous User"
            
        representation['user'] = full_name
        return representation