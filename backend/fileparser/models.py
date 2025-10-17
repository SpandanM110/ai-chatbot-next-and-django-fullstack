from django.db import models
from django.contrib.auth.models import User


class ParsedFile(models.Model):
    """Model to store parsed file information"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    original_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    file_type = models.CharField(max_length=50)
    file_size = models.BigIntegerField()
    parsed_content = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.original_name} ({self.file_type})"
