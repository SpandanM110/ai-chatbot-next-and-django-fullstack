import json
import requests
import uuid
from django.conf import settings
from django.http import StreamingHttpResponse, JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import ChatSession, ChatMessage
from .serializers import ChatRequestSerializer, ChatSessionSerializer, ChatMessageSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def chat(request):
    """Handle chat messages and return AI responses"""
    serializer = ChatRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    message = serializer.validated_data['message']
    session_id = serializer.validated_data.get('session_id')
    stream = serializer.validated_data.get('stream', False)
    model = serializer.validated_data.get('model', 'llama-3.1-8b-instant')
    temperature = serializer.validated_data.get('temperature', 0.7)
    max_tokens = serializer.validated_data.get('max_tokens', 1000)

    # Get or create session
    if session_id:
        try:
            session = ChatSession.objects.get(session_id=session_id)
        except ChatSession.DoesNotExist:
            session = ChatSession.objects.create(
                session_id=session_id,
                title=message[:50] + "..." if len(message) > 50 else message
            )
    else:
        session = ChatSession.objects.create(
            session_id=str(uuid.uuid4()),
            title=message[:50] + "..." if len(message) > 50 else message
        )

    # Save user message
    user_message = ChatMessage.objects.create(
        session=session,
        role='user',
        content=message
    )

    # Get conversation history
    messages = session.messages.all().order_by('timestamp')
    conversation_history = []
    for msg in messages:
        conversation_history.append({
            'role': msg.role,
            'content': msg.content
        })

    # Get uploaded files context for the LLM
    from fileparser.models import ParsedFile
    uploaded_files = ParsedFile.objects.all().order_by('-created_at')[:5]  # Get 5 most recent files
    
    # Add file context to the conversation if files exist
    if uploaded_files:
        file_context = "Here are the uploaded files that the user can ask about:\n\n"
        for file in uploaded_files:
            file_context += f"📄 File: {file.original_name} ({file.file_type.upper()})\n"
            
            # Add insights if available
            insights = file.metadata.get('insights', [])
            if insights:
                file_context += f"   Insights: {', '.join(insights)}\n"
            
            # Add content preview
            content_preview = file.parsed_content[:800]  # First 800 chars
            file_context += f"   Content Preview: {content_preview}...\n\n"
        
        # Add file context as a system message
        conversation_history.insert(0, {
            'role': 'system',
            'content': f"""You are an AI assistant with access to the user's uploaded files. 

{file_context}

You can:
- Answer questions about the content of these files
- Summarize any of the files
- Extract specific information from them
- Compare information across files
- Help analyze or interpret the content
- Provide insights based on the file content

When the user asks about files, be specific about which file you're referencing and provide detailed, helpful responses based on the actual content."""
        })

    # Prepare Groq API request
    groq_payload = {
        'model': model,
        'messages': conversation_history,
        'temperature': temperature,
        'max_tokens': max_tokens,
        'stream': stream
    }

    headers = {
        'Authorization': f'Bearer {settings.GROQ_API_KEY}',
        'Content-Type': 'application/json'
    }

    try:
        if stream:
            return _stream_response(groq_payload, headers, session)
        else:
            return _handle_non_streaming_response(groq_payload, headers, session)
    except Exception as e:
        return Response(
            {'error': f'Failed to get AI response: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def _stream_response(payload, headers, session):
    """Handle streaming response from Groq API"""
    def generate():
        try:
            response = requests.post(
                settings.GROQ_API_URL,
                json=payload,
                headers=headers,
                stream=True
            )
            response.raise_for_status()

            assistant_content = ""
            for line in response.iter_lines():
                if line:
                    line = line.decode('utf-8')
                    if line.startswith('data: '):
                        data = line[6:]  # Remove 'data: ' prefix
                        if data.strip() == '[DONE]':
                            break
                        try:
                            chunk = json.loads(data)
                            if 'choices' in chunk and len(chunk['choices']) > 0:
                                delta = chunk['choices'][0].get('delta', {})
                                if 'content' in delta:
                                    content = delta['content']
                                    assistant_content += content
                                    yield f"data: {json.dumps({'content': content})}\n\n"
                        except json.JSONDecodeError:
                            continue

            # Save assistant message
            if assistant_content:
                ChatMessage.objects.create(
                    session=session,
                    role='assistant',
                    content=assistant_content
                )

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingHttpResponse(
        generate(),
        content_type='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no'
        }
    )


def _handle_non_streaming_response(payload, headers, session):
    """Handle non-streaming response from Groq API"""
    response = requests.post(
        settings.GROQ_API_URL,
        json=payload,
        headers=headers
    )
    response.raise_for_status()

    data = response.json()
    assistant_content = data['choices'][0]['message']['content']

    # Save assistant message
    ChatMessage.objects.create(
        session=session,
        role='assistant',
        content=assistant_content
    )

    return Response({
        'response': assistant_content,
        'session_id': session.session_id,
        'message_id': ChatMessage.objects.filter(session=session).last().id
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def get_session(request, session_id):
    """Get chat session with messages"""
    try:
        session = ChatSession.objects.get(session_id=session_id)
        serializer = ChatSessionSerializer(session)
        return Response(serializer.data)
    except ChatSession.DoesNotExist:
        return Response(
            {'error': 'Session not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_sessions(request):
    """Get all chat sessions"""
    sessions = ChatSession.objects.all()
    serializer = ChatSessionSerializer(sessions, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_session(request, session_id):
    """Delete a chat session"""
    try:
        session = ChatSession.objects.get(session_id=session_id)
        session.delete()
        return Response({'message': 'Session deleted successfully'})
    except ChatSession.DoesNotExist:
        return Response(
            {'error': 'Session not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
