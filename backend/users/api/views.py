from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer, UserProfileSerializer, PasswordResetSerializer, PasswordResetConfirmSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .backends import CustomAuthBackend
from .utils import send_verification_email, send_password_reset_email
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Send verification email
        email_sent = send_verification_email(user)
        
        response_data = {
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.first_name
            },
            'message': 'User created successfully. Please check your email to verify your account.',
            'email_sent': email_sent
        }
        
        if not email_sent:
            response_data['warning'] = 'Account created but verification email could not be sent. Please try resending verification email.'
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request, token):
    """Verify user email with the provided token"""
    try:
        user = get_object_or_404(User, email_verification_token=token)
        
        if user.is_email_verified:
            return Response({
                'message': 'Email already verified',
                'verified': True
            }, status=status.HTTP_200_OK)
        
        user.is_email_verified = True
        user.save()
        
        return Response({
            'message': 'Email verified successfully! You can now log in.',
            'verified': True
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({
            'message': 'Invalid verification token',
            'verified': False
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification_email(request):
    """Resend verification email to user"""
    email = request.data.get('email')
    
    if not email:
        return Response({
            'message': 'Email is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        
        if user.is_email_verified:
            return Response({
                'message': 'Email is already verified'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate new verification token
        user.generate_verification_token()
        
        # Send verification email
        email_sent = send_verification_email(user)
        
        if email_sent:
            return Response({
                'message': 'Verification email sent successfully'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'message': 'Failed to send verification email'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except User.DoesNotExist:
        return Response({
            'message': 'User with this email does not exist'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """Send password reset email to user"""
    serializer = PasswordResetSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            
            # Generate password reset token
            user.generate_password_reset_token()
            
            # Send password reset email
            email_sent = send_password_reset_email(user)
            
            if email_sent:
                return Response({
                    'message': 'Password reset email sent successfully. Please check your inbox.'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'Failed to send password reset email'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except User.DoesNotExist:
            # Return success message even if user doesn't exist for security
            return Response({
                'message': 'Password reset email sent successfully. Please check your inbox.'
            }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request, token):
    """Reset user password with the provided token"""
    try:
        user = get_object_or_404(User, password_reset_token=token)
        
        if not user.is_password_reset_token_valid():
            return Response({
                'message': 'Password reset token has expired',
                'valid': False
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            # Update password
            user.set_password(serializer.validated_data['password'])
            user.password_reset_token = None
            user.password_reset_token_created = None
            user.save()
            
            return Response({
                'message': 'Password reset successfully. You can now log in with your new password.',
                'success': True
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except User.DoesNotExist:
        return Response({
            'message': 'Invalid password reset token',
            'valid': False
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def validate_reset_token(request, token):
    """Validate if password reset token is still valid"""
    try:
        user = get_object_or_404(User, password_reset_token=token)
        
        if user.is_password_reset_token_valid():
            return Response({
                'message': 'Token is valid',
                'valid': True
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'message': 'Token has expired',
                'valid': False
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except User.DoesNotExist:
        return Response({
            'message': 'Invalid token',
            'valid': False
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"message": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile(request):
    """
    Get or update user profile
    """
    if request.method == 'GET':
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        
        auth_backend = CustomAuthBackend()
        user = auth_backend.authenticate(request, username=email, password=password)
        
        if user is None:
            return Response(
                {"error": "email", "message": "Email does not exist"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        elif user == "unverified":
            return Response(
                {"error": "unverified", "message": "Please verify your email before logging in"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        elif user is False:
            return Response(
                {"error": "password", "message": "Incorrect password"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # If we get here, authentication succeeded
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)