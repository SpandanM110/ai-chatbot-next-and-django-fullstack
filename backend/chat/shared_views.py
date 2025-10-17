"""
Views for shared chat sessions with real-time sync
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import ChatSession, ChatMessage
from .models import SharedChatSession, SharedChatAccess
from .pdf_generator import generate_chat_pdf, generate_chat_html
from .serializers import ChatMessageSerializer
import os
import tempfile
import uuid
from datetime import datetime, timedelta


@api_view(['POST'])
@permission_classes([AllowAny])
def create_shared_session(request):
    """Create a shared chat session"""
    session_id = request.data.get('session_id')
    title = request.data.get('title', 'Shared Chat')
    allow_editing = request.data.get('allow_editing', False)
    expires_hours = request.data.get('expires_hours', 24)  # Default 24 hours
    
    if not session_id:
        return Response(
            {'error': 'Session ID is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Get original session
        original_session = ChatSession.objects.get(session_id=session_id)
        
        # Create shared session
        share_token = str(uuid.uuid4())[:8]  # Short token for easy sharing
        expires_at = timezone.now() + timedelta(hours=expires_hours) if expires_hours > 0 else None
        
        shared_session = SharedChatSession.objects.create(
            original_session=original_session,
            share_token=share_token,
            title=title,
            allow_editing=allow_editing,
            expires_at=expires_at
        )
        
        # Generate PDF
        messages = original_session.messages.all().order_by('timestamp')
        pdf_path = generate_chat_pdf(
            session_id, 
            [{'role': msg.role, 'content': msg.content, 'timestamp': msg.timestamp} for msg in messages],
            title
        )
        
        # For now, we'll store the PDF path locally
        # In production, you'd upload to UploadThing or similar
        shared_session.pdf_url = f"/api/chat/shared/{share_token}/pdf/"
        shared_session.pdf_generated_at = timezone.now()
        shared_session.save()
        
        return Response({
            'success': True,
            'share_token': share_token,
            'share_url': shared_session.get_share_url(request),
            'pdf_url': shared_session.pdf_url,
            'expires_at': shared_session.expires_at.isoformat() if shared_session.expires_at else None,
            'message': 'Shared session created successfully'
        })
        
    except ChatSession.DoesNotExist:
        return Response(
            {'error': 'Original session not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to create shared session: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_shared_session(request, share_token):
    """Get shared chat session with real-time sync"""
    try:
        shared_session = get_object_or_404(SharedChatSession, share_token=share_token)
        
        # Check if session is expired
        if shared_session.expires_at and timezone.now() > shared_session.expires_at:
            return Response(
                {'error': 'Shared session has expired'}, 
                status=status.HTTP_410_GONE
            )
        
        # Check if session is active
        if not shared_session.is_active:
            return Response(
                {'error': 'Shared session is no longer active'}, 
                status=status.HTTP_410_GONE
            )
        
        # Track access
        SharedChatAccess.objects.create(
            shared_session=shared_session,
            ip_address=request.META.get('REMOTE_ADDR', ''),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            session_data={'accessed_at': timezone.now().isoformat()}
        )
        
        # Increment access count
        shared_session.increment_access()
        
        # Get latest messages (real-time sync)
        messages = shared_session.sync_messages()
        message_data = []
        for msg in messages:
            message_data.append({
                'id': str(msg.id),
                'role': msg.role,
                'content': msg.content,
                'timestamp': msg.timestamp.isoformat(),
                'metadata': msg.metadata or {}
            })
        
        return Response({
            'session_id': shared_session.original_session.session_id,
            'title': shared_session.title,
            'messages': message_data,
            'is_editable': shared_session.allow_editing,
            'last_synced': shared_session.last_synced.isoformat(),
            'access_count': shared_session.access_count,
            'pdf_url': shared_session.pdf_url,
            'expires_at': shared_session.expires_at.isoformat() if shared_session.expires_at else None
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to get shared session: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_shared_pdf(request, share_token):
    """Get PDF of shared chat session"""
    try:
        shared_session = get_object_or_404(SharedChatSession, share_token=share_token)
        
        # Check if session is expired
        if shared_session.expires_at and timezone.now() > shared_session.expires_at:
            return Response(
                {'error': 'Shared session has expired'}, 
                status=status.HTTP_410_GONE
            )
        
        # Generate fresh PDF
        messages = shared_session.original_session.messages.all().order_by('timestamp')
        pdf_path = generate_chat_pdf(
            shared_session.original_session.session_id,
            [{'role': msg.role, 'content': msg.content, 'timestamp': msg.timestamp} for msg in messages],
            shared_session.title
        )
        
        # Read PDF content
        with open(pdf_path, 'rb') as pdf_file:
            pdf_content = pdf_file.read()
        
        # Clean up temporary file
        os.unlink(pdf_path)
        
        # Return PDF response
        response = HttpResponse(pdf_content, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="chat_session_{share_token}.pdf"'
        return response
        
    except Exception as e:
        return Response(
            {'error': f'Failed to generate PDF: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def add_message_to_shared(request, share_token):
    """Add a message to shared session (if editing is allowed)"""
    try:
        shared_session = get_object_or_404(SharedChatSession, share_token=share_token)
        
        # Check if editing is allowed
        if not shared_session.allow_editing:
            return Response(
                {'error': 'Editing is not allowed for this shared session'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if session is expired
        if shared_session.expires_at and timezone.now() > shared_session.expires_at:
            return Response(
                {'error': 'Shared session has expired'}, 
                status=status.HTTP_410_GONE
            )
        
        message_content = request.data.get('content', '')
        role = request.data.get('role', 'user')
        
        if not message_content:
            return Response(
                {'error': 'Message content is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add message to original session
        new_message = ChatMessage.objects.create(
            session=shared_session.original_session,
            role=role,
            content=message_content
        )
        
        # Update shared session
        shared_session.last_synced = timezone.now()
        shared_session.save()
        
        return Response({
            'success': True,
            'message_id': str(new_message.id),
            'timestamp': new_message.timestamp.isoformat(),
            'message': 'Message added successfully'
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to add message: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_shared_session_info(request, share_token):
    """Get information about shared session"""
    try:
        shared_session = get_object_or_404(SharedChatSession, share_token=share_token)
        
        return Response({
            'title': shared_session.title,
            'is_active': shared_session.is_active,
            'allow_editing': shared_session.allow_editing,
            'access_count': shared_session.access_count,
            'created_at': shared_session.created_at.isoformat(),
            'last_synced': shared_session.last_synced.isoformat(),
            'expires_at': shared_session.expires_at.isoformat() if shared_session.expires_at else None,
            'pdf_url': shared_session.pdf_url
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to get session info: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
