from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.db import models
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from .models import ContactMessage
from .serializers import ContactMessageSerializer, ContactMessageListSerializer
import logging

logger = logging.getLogger(__name__)

class ContactMessageCreateView(generics.CreateAPIView):
    """
    Create a new contact message.
    Accessible by both authenticated and anonymous users.
    """
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        contact_message = serializer.save()
        
        # Send email notification to admin
        try:
            self.send_admin_notification(contact_message)
        except Exception as e:
            logger.error(f"Failed to send admin notification email: {str(e)}")
        
        # Send confirmation email to user
        try:
            self.send_user_confirmation(contact_message)
        except Exception as e:
            logger.error(f"Failed to send user confirmation email: {str(e)}")

    def send_admin_notification(self, contact_message):
        """Send email notification to admin about new contact message"""
        subject = f"New Contact Message: {contact_message.subject}"
        
        # Create the email content
        context = {
            'message': contact_message,
            'admin_url': f"{settings.FRONTEND_URL}/admin/contact/",  # Adjust as needed
        }
        
        html_message = f"""
        <h2>New Contact Message Received</h2>
        <p><strong>From:</strong> {contact_message.name} ({contact_message.email})</p>
        <p><strong>Category:</strong> {contact_message.get_category_display()}</p>
        <p><strong>Subject:</strong> {contact_message.subject}</p>
        {f'<p><strong>Order Number:</strong> {contact_message.order_number}</p>' if contact_message.order_number else ''}
        <p><strong>Message:</strong></p>
        <div style="border: 1px solid #ddd; padding: 10px; background-color: #f9f9f9;">
            {contact_message.message.replace('\n', '<br>')}
        </div>
        <p><strong>Received:</strong> {contact_message.created_at.strftime('%Y-%m-%d %H:%M:%S')}</p>
        """
        
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.EMAIL_HOST_USER],  # Send to admin email
            html_message=html_message,
            fail_silently=False,
        )

    def send_user_confirmation(self, contact_message):
        """Send confirmation email to user"""
        subject = f"We received your message: {contact_message.subject}"
        
        html_message = f"""
        <h2>Thank you for contacting us!</h2>
        <p>Dear {contact_message.name},</p>
        <p>We have received your message regarding "<strong>{contact_message.subject}</strong>" and will get back to you as soon as possible.</p>
        
        <h3>Your Message Details:</h3>
        <p><strong>Category:</strong> {contact_message.get_category_display()}</p>
        <p><strong>Subject:</strong> {contact_message.subject}</p>
        {f'<p><strong>Order Number:</strong> {contact_message.order_number}</p>' if contact_message.order_number else ''}
        <p><strong>Message:</strong></p>
        <div style="border: 1px solid #ddd; padding: 10px; background-color: #f9f9f9;">
            {contact_message.message.replace('\n', '<br>')}
        </div>
        
        <p><strong>Reference ID:</strong> {contact_message.id}</p>
        
        <p>Our support team typically responds within 24-48 hours. If your inquiry is urgent, please don't hesitate to contact us again.</p>
        
        <p>Best regards,<br>Amazon Clone Support Team</p>
        """
        
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[contact_message.email],
            html_message=html_message,
            fail_silently=False,
        )

class ContactMessageListView(generics.ListAPIView):
    """
    List all contact messages (Admin only)
    """
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageListSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        queryset = ContactMessage.objects.all()
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by category if provided
        category_filter = self.request.query_params.get('category')
        if category_filter:
            queryset = queryset.filter(category=category_filter)
        
        # Search in subject, message, or email
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(subject__icontains=search) |
                models.Q(message__icontains=search) |
                models.Q(email__icontains=search) |
                models.Q(name__icontains=search)
            )
        
        return queryset

@api_view(['GET'])
@permission_classes([AllowAny])
def contact_categories(request):
    """
    Get available contact categories
    """
    categories = [
        {'value': choice[0], 'label': choice[1]} 
        for choice in ContactMessage.CATEGORY_CHOICES
    ]
    return Response({'categories': categories})
