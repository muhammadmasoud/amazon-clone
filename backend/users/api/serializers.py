from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.validators import EmailValidator
import re

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password_confirm = serializers.CharField(write_only=True)
    
    # Enhanced field validation
    first_name = serializers.CharField(
        max_length=30,
        trim_whitespace=True,
        error_messages={
            'blank': 'First name cannot be empty.',
            'max_length': 'First name cannot exceed 30 characters.'
        }
    )
    
    last_name = serializers.CharField(
        max_length=30,
        trim_whitespace=True,
        error_messages={
            'blank': 'Last name cannot be empty.',
            'max_length': 'Last name cannot exceed 30 characters.'
        }
    )
    
    email = serializers.EmailField(
        validators=[EmailValidator()],
        error_messages={
            'invalid': 'Enter a valid email address.',
            'blank': 'Email cannot be empty.'
        }
    )
    
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        error_messages={
            'blank': 'Password cannot be empty.',
            'min_length': 'Password must be at least 8 characters long.'
        }
    )

    class Meta:
        model = User
        fields = ['first_name','last_name', 'email', 'password', 'password_confirm']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate_first_name(self, value):
        """Validate first name format."""
        if not value.strip():
            raise serializers.ValidationError("First name cannot be empty.")
        
        if not re.match(r'^[a-zA-Z\s]+$', value.strip()):
            raise serializers.ValidationError("First name can only contain letters and spaces.")
        
        return value.strip().title()

    def validate_last_name(self, value):
        """Validate last name format."""
        if not value.strip():
            raise serializers.ValidationError("Last name cannot be empty.")
        
        if not re.match(r'^[a-zA-Z\s]+$', value.strip()):
            raise serializers.ValidationError("Last name can only contain letters and spaces.")
        
        return value.strip().title()

    def validate_email(self, value):
        """Validate email uniqueness and format."""
        if not value:
            raise serializers.ValidationError("Email is required.")
        
        # Normalize email
        value = value.lower().strip()
        
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists.")
        
        return value

    def validate_password(self, value):
        """Validate password strength using Django's built-in validators."""
        if not value:
            raise serializers.ValidationError("Password is required.")
        
        # Use Django's password validation
        try:
            validate_password(value)
        except serializers.ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        
        return value

    def validate(self, data):
        """Object-level validation."""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                "password_confirm": "Passwords do not match."
            })
        return data

    def create(self, validated_data):
        """Create user with validated data."""
        validated_data.pop('password_confirm')
        
        # Generate username from email
        email = validated_data['email']
        username = email.split('@')[0]
        
        # Ensure username is unique
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        user = User(
            username=username,
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    # Enhanced field validation for profile updates
    first_name = serializers.CharField(
        max_length=30,
        required=False,
        trim_whitespace=True,
        allow_blank=False,
        error_messages={
            'max_length': 'First name cannot exceed 30 characters.'
        }
    )
    
    last_name = serializers.CharField(
        max_length=30,
        required=False,
        trim_whitespace=True,
        allow_blank=False,
        error_messages={
            'max_length': 'Last name cannot exceed 30 characters.'
        }
    )
    
    mobile = serializers.CharField(
        max_length=50,
        required=False,
        allow_blank=True,
        trim_whitespace=True,
        error_messages={
            'max_length': 'Mobile number cannot exceed 50 characters.'
        }
    )
    
    address = serializers.CharField(
        required=False,
        allow_blank=True,
        trim_whitespace=True,
        error_messages={
            'max_length': 'Address is too long.'
        }
    )
    
    email_verified = serializers.BooleanField(source='is_email_verified', read_only=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'mobile', 'address', 'email_verified']
        read_only_fields = ['email']  # Email cannot be changed in profile

    def validate_first_name(self, value):
        """Validate first name format."""
        if value and not re.match(r'^[a-zA-Z\s]+$', value.strip()):
            raise serializers.ValidationError("First name can only contain letters and spaces.")
        
        return value.strip().title() if value else value

    def validate_last_name(self, value):
        """Validate last name format."""
        if value and not re.match(r'^[a-zA-Z\s]+$', value.strip()):
            raise serializers.ValidationError("Last name can only contain letters and spaces.")
        
        return value.strip().title() if value else value

    def validate_mobile(self, value):
        """Validate mobile number format."""
        if value:
            # Remove spaces and hyphens for validation
            clean_mobile = re.sub(r'[\s\-\(\)]', '', value)
            
            # Check if it contains only digits and plus sign
            if not re.match(r'^\+?[0-9]+$', clean_mobile):
                raise serializers.ValidationError("Mobile number can only contain digits, spaces, hyphens, parentheses, and plus sign.")
            
            # Check length (international format can be up to 15 digits)
            if len(clean_mobile.replace('+', '')) > 15:
                raise serializers.ValidationError("Mobile number is too long.")
            
            # Check minimum length
            if len(clean_mobile.replace('+', '')) < 7:
                raise serializers.ValidationError("Mobile number is too short.")
        
        return value.strip() if value else value

class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for changing user password."""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        """Validate that old password is correct."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate_new_password(self, value):
        """Validate new password strength."""
        try:
            validate_password(value)
        except serializers.ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, data):
        """Object-level validation."""
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "New passwords do not match."
            })
        
        if data['old_password'] == data['new_password']:
            raise serializers.ValidationError({
                "new_password": "New password must be different from the old password."
            })
        
        return data

    def save(self):
        """Change user password."""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
