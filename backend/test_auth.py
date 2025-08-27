from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def auth_test(request):
    """Simple endpoint to test authentication"""
    return Response({
        'authenticated': True,
        'user': {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email
        }
    })

# Add this to your urls.py
# path('test-auth/', auth_test, name='test-auth'),
