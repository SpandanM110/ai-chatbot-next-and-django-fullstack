from rest_framework import serializers
from .models import ChatSession, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'timestamp', 'metadata']


class ChatSessionSerializer(serializers.ModelSerializer):
    messages = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = ['id', 'session_id', 'title', 'created_at', 'updated_at', 'messages']
    
    def get_messages(self, obj):
        messages = obj.messages.all().order_by('timestamp')
        return ChatMessageSerializer(messages, many=True).data


class ChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField()
    session_id = serializers.CharField(required=False)
    stream = serializers.BooleanField(default=False)
    model = serializers.CharField(default='llama-3.1-8b-instant')
    temperature = serializers.FloatField(default=0.7)
    max_tokens = serializers.IntegerField(default=1000)
