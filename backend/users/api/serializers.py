from rest_framework import serializers
from django.contrib.auth import get_user_model
import re
import time
import random

User = get_user_model()

def generate_unique_username(email):
    """
    Generate a unique username from email address.
    This function ensures uniqueness across different databases and team members.
    """
    # Extract base username from email
    base_username = email.split('@')[0]
    
    # Clean the base username (remove special characters, limit length)
    base_username = re.sub(r'[^a-zA-Z0-9_]', '', base_username)[:15]
    
    # If base_username is empty after cleaning, use a default
    if not base_username:
        base_username = "user"
    
    # Add timestamp and random suffix for guaranteed uniqueness
    timestamp = str(int(time.time()))[-6:]  # Last 6 digits of timestamp
    random_suffix = str(random.randint(100, 999))  # Random 3-digit number
    
    username = f"{base_username}_{timestamp}_{random_suffix}"
    
    # Double-check uniqueness (shouldn't be needed with timestamp, but safety first)
    max_attempts = 10
    attempts = 0
    
    while User.objects.filter(username=username).exists() and attempts < max_attempts:
        random_suffix = str(random.randint(100, 999))
        username = f"{base_username}_{timestamp}_{random_suffix}"
        attempts += 1
    
    # If we still have conflicts after max attempts, add more randomness
    if attempts >= max_attempts:
        extra_random = str(random.randint(1000, 9999))
        username = f"{base_username}_{timestamp}_{random_suffix}_{extra_random}"
    
    return username

class UserSerializer(serializers.ModelSerializer):
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['first_name','last_name', 'email', 'password', 'password_confirm']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists")
        return value

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                "password_confirm": "Passwords do not match"
            })
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        
        try:
            # Generate a unique username from email
            username = generate_unique_username(validated_data['email'])
            
            # Final uniqueness check before creating user
            if User.objects.filter(username=username).exists():
                # This should never happen, but if it does, regenerate
                username = generate_unique_username(validated_data['email'])
            
            user = User(
                email=validated_data['email'],
                username=username  # Set the generated username
            )
            # Set the name as first_name
            user.first_name = validated_data['first_name']
            user.last_name = validated_data['last_name']
            user.set_password(validated_data['password'])
            user.save()
            return user
            
        except Exception as e:
            # Log the error for debugging (in production, you'd want proper logging)
            print(f"Error creating user: {e}")
            # Fallback: try one more time with a completely random username
            fallback_username = f"user_{int(time.time())}_{random.randint(10000, 99999)}"
            user = User(
                email=validated_data['email'],
                username=fallback_username
            )
            user.first_name = validated_data['first_name']
            user.last_name = validated_data['last_name']
            user.set_password(validated_data['password'])
            user.save()
            return user

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [ 'email', 'first_name','last_name', 'mobile', 'address']

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        # Basic email validation (the serializer already validates email format)
        return value

class PasswordResetConfirmSerializer(serializers.Serializer):
    password = serializers.CharField(min_length=8, write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    
    def validate_password(self, value):
        # Check if password contains at least one special character
        special_char_pattern = r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]'
        if not re.search(special_char_pattern, value):
            raise serializers.ValidationError("Password must contain at least one special character")
        return value
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                "password_confirm": "Passwords do not match"
            })
        return data