"""
Chat export and import functionality
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from .models import ChatSession, ChatMessage
from fileparser.models import ParsedFile
import json
import uuid
from datetime import datetime


@api_view(['POST'])
@permission_classes([AllowAny])
def export_chat_session(request):
    """Export a chat session with all messages and files"""
    session_id = request.data.get('session_id')
    if not session_id:
        return Response(
            {'error': 'Session ID is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Get the session
        session = ChatSession.objects.get(session_id=session_id)
        
        # Get all messages
        messages = session.messages.all().order_by('timestamp')
        message_data = []
        for msg in messages:
            message_data.append({
                'id': str(msg.id),
                'role': msg.role,
                'content': msg.content,
                'timestamp': msg.timestamp.isoformat(),
                'metadata': msg.metadata or {}
            })

        # Get associated files (if any)
        files_data = []
        # Note: In a real implementation, you might want to link files to sessions
        # For now, we'll get all recent files
        recent_files = ParsedFile.objects.all().order_by('-created_at')[:5]
        for file in recent_files:
            files_data.append({
                'id': file.id,
                'name': file.original_name,
                'type': file.file_type,
                'content': file.parsed_content[:2000],  # Limit content for export
                'metadata': file.metadata or {}
            })

        # Create export data
        export_data = {
            'sessionId': session.session_id,
            'title': session.title or f"Chat Session {session.created_at.strftime('%Y-%m-%d')}",
            'messages': message_data,
            'files': files_data,
            'metadata': {
                'exportedAt': datetime.now().isoformat(),
                'version': '1.0',
                'originalSessionId': session.session_id,
                'messageCount': len(message_data),
                'fileCount': len(files_data)
            }
        }

        return Response(export_data)

    except ChatSession.DoesNotExist:
        return Response(
            {'error': 'Session not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Export failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def import_chat_session(request):
    """Import a chat session from exported data"""
    try:
        session_data = request.data
        
        # Validate required fields
        if not session_data.get('sessionId') or not session_data.get('messages'):
            return Response(
                {'error': 'Invalid session data'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create or get session
        session_id = session_data['sessionId']
        title = session_data.get('title', 'Imported Chat')
        
        session, created = ChatSession.objects.get_or_create(
            session_id=session_id,
            defaults={
                'title': title,
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }
        )

        # Clear existing messages if importing to existing session
        if not created:
            session.messages.all().delete()
            session.title = title
            session.updated_at = datetime.now()
            session.save()

        # Import messages
        imported_count = 0
        for msg_data in session_data['messages']:
            ChatMessage.objects.create(
                session=session,
                role=msg_data['role'],
                content=msg_data['content'],
                metadata=msg_data.get('metadata', {})
            )
            imported_count += 1

        # Import files (optional)
        files_data = session_data.get('files', [])
        imported_files = 0
        for file_data in files_data:
            # Create a new file entry for the imported session
            ParsedFile.objects.create(
                original_name=file_data['name'],
                file_type=file_data['type'],
                file_size=len(file_data['content']),
                parsed_content=file_data['content'],
                metadata={
                    'imported': True,
                    'original_metadata': file_data.get('metadata', {}),
                    'imported_at': datetime.now().isoformat()
                }
            )
            imported_files += 1

        return Response({
            'success': True,
            'sessionId': session.session_id,
            'title': session.title,
            'importedMessages': imported_count,
            'importedFiles': imported_files,
            'message': f'Successfully imported {imported_count} messages and {imported_files} files'
        })

    except Exception as e:
        return Response(
            {'error': f'Import failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_export_info(request):
    """Get information about export capabilities"""
    return Response({
        'supportedFormats': ['json'],
        'maxFileSize': '4MB',
        'compressionEnabled': True,
        'features': [
            'Real-time compression',
            'File attachment support',
            'Session metadata',
            'Cross-platform compatibility'
        ]
    })
