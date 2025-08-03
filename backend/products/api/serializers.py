from rest_framework import serializers
from ..models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id',
            'title', 
            'description',
            'unit_price',
            'image',
            'stock',
            'date_added'
        ]
        read_only_fields = ['date_added']
