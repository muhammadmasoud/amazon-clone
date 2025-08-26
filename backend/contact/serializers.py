from rest_framework import serializers
from .models import ContactMessage

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = [
            'id', 'name', 'email', 'subject', 'category', 
            'message', 'order_number', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'created_at']

    def create(self, validated_data):
        # If user is authenticated, associate the message with the user
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
            # Pre-fill name and email from user if not provided
            if not validated_data.get('name'):
                validated_data['name'] = f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username
            if not validated_data.get('email'):
                validated_data['email'] = request.user.email
        
        return super().create(validated_data)

class ContactMessageListSerializer(serializers.ModelSerializer):
    """Serializer for listing contact messages (admin view)"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = ContactMessage
        fields = [
            'id', 'name', 'email', 'user_email', 'user_name',
            'subject', 'category', 'order_number', 'status', 
            'created_at', 'updated_at', 'response_sent'
        ]
