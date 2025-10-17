from django.db import models
from django.contrib.auth.models import User
import uuid


class ChatSession(models.Model):
    """Model to store chat sessions"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    session_id = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    title = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Session {self.session_id} - {self.title}"


class ChatMessage(models.Model):
    """Model to store individual chat messages"""
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    ]

    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."


class SharedChatSession(models.Model):
    """
    Model for shared chat sessions with real-time sync
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    original_session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='shared_sessions')
    share_token = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_synced = models.DateTimeField(auto_now=True)
    
    # Sharing settings
    allow_editing = models.BooleanField(default=False)
    expires_at = models.DateTimeField(null=True, blank=True)
    access_count = models.IntegerField(default=0)
    
    # PDF generation
    pdf_url = models.URLField(blank=True, null=True)
    pdf_generated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Shared: {self.title} ({self.share_token})"
    
    def get_share_url(self, request=None):
        """Get the shareable URL for this session"""
        # Always return frontend URL for sharing
        return f"http://localhost:3000/chat/shared/{self.share_token}/"
    
    def sync_messages(self):
        """Sync messages from original session"""
        original_messages = self.original_session.messages.all().order_by('timestamp')
        self.last_synced = models.DateTimeField(auto_now=True)
        self.save(update_fields=['last_synced'])
        return original_messages
    
    def increment_access(self):
        """Increment access count"""
        self.access_count += 1
        self.save(update_fields=['access_count'])


class SharedChatAccess(models.Model):
    """
    Track access to shared chat sessions
    """
    shared_session = models.ForeignKey(SharedChatSession, on_delete=models.CASCADE, related_name='access_logs')
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    accessed_at = models.DateTimeField(auto_now_add=True)
    session_data = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-accessed_at']
    
    def __str__(self):
        return f"Access to {self.shared_session.title} from {self.ip_address}"
