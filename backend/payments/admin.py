from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'payment_id',
        'order',
        'user',
        'amount',
        'currency',
        'payment_method',
        'status',
        'created_at',
        'paid_at'
    ]
    list_filter = ['status', 'payment_method', 'currency', 'created_at']
    search_fields = ['payment_id', 'stripe_payment_intent_id', 'order__order_number', 'user__username']
    readonly_fields = ['payment_id', 'stripe_payment_intent_id', 'stripe_client_secret', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('payment_id', 'order', 'user', 'amount', 'currency')
        }),
        ('Payment Details', {
            'fields': ('payment_method', 'status', 'paid_at')
        }),
        ('Stripe Information', {
            'fields': ('stripe_payment_intent_id', 'stripe_client_secret', 'stripe_charge_id'),
            'classes': ('collapse',)
        }),
        ('Additional Information', {
            'fields': ('failure_reason', 'refund_reason'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
