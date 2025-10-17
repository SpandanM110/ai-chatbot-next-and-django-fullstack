from rest_framework import serializers
from .models import ParsedFile


class ParsedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParsedFile
        fields = [
            'id', 'original_name', 'file_type', 'file_size', 
            'parsed_content', 'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    description = serializers.CharField(required=False, allow_blank=True)
