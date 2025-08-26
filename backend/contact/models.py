from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class ContactMessage(models.Model):
    CATEGORY_CHOICES = [
        ('order_issue', 'Order Issue'),
        ('delivery_problem', 'Delivery Problem'),
        ('product_question', 'Product Question'),
        ('payment_issue', 'Payment Issue'),
        ('account_help', 'Account Help'),
        ('technical_support', 'Technical Support'),
        ('general_inquiry', 'General Inquiry'),
        ('complaint', 'Complaint'),
        ('suggestion', 'Suggestion'),
    ]
    
    STATUS_CHOICES = [
        ('new', 'New'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # User information (optional for anonymous users)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    
    # Message details
    subject = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general_inquiry')
    message = models.TextField()
    
    # Optional order reference
    order_number = models.CharField(max_length=50, blank=True, null=True)
    
    # Status and timestamps
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Response tracking
    response_sent = models.BooleanField(default=False)
    response_sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Contact Message'
        verbose_name_plural = 'Contact Messages'

    def __str__(self):
        return f"{self.subject} - {self.email} ({self.get_status_display()})"

    @property
    def is_resolved(self):
        return self.status in ['resolved', 'closed']
