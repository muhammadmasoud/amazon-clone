from django.contrib import admin
from django.utils.html import format_html
from .models import ContactMessage

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = [
        'subject', 'name', 'email', 'category', 'status', 
        'order_number', 'created_at', 'response_sent'
    ]
    list_filter = [
        'status', 'category', 'response_sent', 'created_at'
    ]
    search_fields = [
        'subject', 'name', 'email', 'message', 'order_number'
    ]
    readonly_fields = [
        'id', 'created_at', 'updated_at'
    ]
    list_per_page = 25
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('user', 'name', 'email')
        }),
        ('Message Details', {
            'fields': ('subject', 'category', 'message', 'order_number')
        }),
        ('Status', {
            'fields': ('status', 'response_sent', 'response_sent_at')
        }),
        ('Timestamps', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
    
    actions = ['mark_as_resolved', 'mark_as_in_progress']
    
    def mark_as_resolved(self, request, queryset):
        queryset.update(status='resolved')
        self.message_user(request, f"{queryset.count()} messages marked as resolved.")
    mark_as_resolved.short_description = "Mark selected messages as resolved"
    
    def mark_as_in_progress(self, request, queryset):
        queryset.update(status='in_progress')
        self.message_user(request, f"{queryset.count()} messages marked as in progress.")
    mark_as_in_progress.short_description = "Mark selected messages as in progress"
