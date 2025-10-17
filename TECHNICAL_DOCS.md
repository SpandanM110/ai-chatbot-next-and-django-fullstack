# Technical Documentation

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                             │
├─────────────────────────────────────────────────────────────┤
│  Next.js Frontend (Port 3000)                              │
│  - React Components                                        │
│  - Zustand State Management                               │
│  - TailwindCSS Styling                                    │
│  - File Upload Handling                                   │
└─────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP/HTTPS
                                │
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                               │
├─────────────────────────────────────────────────────────────┤
│  Django REST Framework (Port 8000)                        │
│  - RESTful API Endpoints                                  │
│  - Authentication & Authorization                        │
│  - Request/Response Serialization                        │
│  - CORS Handling                                          │
└─────────────────────────────────────────────────────────────┘
                                │
                                │
┌─────────────────────────────────────────────────────────────┐
│                  Business Logic Layer                      │
├─────────────────────────────────────────────────────────────┤
│  Django Applications                                      │
│  - Chat Management (chat/)                                │
│  - File Processing (fileparser/)                         │
│  - Shared Sessions (shared_views.py)                     │
│  - PDF Generation (pdf_generator.py)                    │
└─────────────────────────────────────────────────────────────┘
                                │
                                │
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                              │
├─────────────────────────────────────────────────────────────┤
│  SQLite Database (Development)                            │
│  PostgreSQL (Production)                                  │
│  - Chat Sessions                                          │
│  - Messages                                               │
│  - File Metadata                                          │
│  - Shared Sessions                                        │
└─────────────────────────────────────────────────────────────┘
                                │
                                │
┌─────────────────────────────────────────────────────────────┐
│                  External Services                         │
├─────────────────────────────────────────────────────────────┤
│  Groq API (LLM Processing)                                │
│  UploadThing (File Sharing)                               │
│  Docker (Containerization)                                │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### ChatSession Model
```python
class ChatSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    session_id = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    title = models.CharField(max_length=200, blank=True)
```

### ChatMessage Model
```python
class ChatMessage(models.Model):
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
```

### SharedChatSession Model
```python
class SharedChatSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    original_session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='shared_sessions')
    share_token = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_synced = models.DateTimeField(auto_now=True)
    allow_editing = models.BooleanField(default=False)
    expires_at = models.DateTimeField(null=True, blank=True)
    access_count = models.IntegerField(default=0)
    pdf_url = models.URLField(blank=True, null=True)
    pdf_generated_at = models.DateTimeField(null=True, blank=True)
```

### ParsedFile Model
```python
class ParsedFile(models.Model):
    original_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    file_type = models.CharField(max_length=10)
    file_size = models.IntegerField()
    parsed_content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)
```

## API Endpoints

### Chat Endpoints

#### POST /api/chat/
Send a message to the AI chatbot.

**Request Body:**
```json
{
  "message": "Hello, how are you?",
  "session_id": "optional-session-id",
  "stream": true,
  "model": "llama-3.1-8b-instant",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Response:**
```json
{
  "response": "Hello! I'm doing well, thank you for asking.",
  "session_id": "generated-session-id",
  "message_id": "message-id",
  "timestamp": "2025-10-17T14:30:00Z"
}
```

#### GET /api/chat/sessions/
Retrieve all chat sessions.

**Response:**
```json
[
  {
    "session_id": "session-id",
    "title": "Chat Session",
    "created_at": "2025-10-17T14:30:00Z",
    "updated_at": "2025-10-17T14:30:00Z",
    "message_count": 5
  }
]
```

#### GET /api/chat/session/{session_id}/
Get a specific chat session with messages.

**Response:**
```json
{
  "session_id": "session-id",
  "title": "Chat Session",
  "messages": [
    {
      "id": "message-id",
      "role": "user",
      "content": "Hello",
      "timestamp": "2025-10-17T14:30:00Z"
    }
  ]
}
```

### File Endpoints

#### POST /api/file/upload/
Upload and parse a file.

**Request:** Multipart form data
- `file`: File data
- `description`: Optional description

**Response:**
```json
{
  "id": 1,
  "original_name": "document.pdf",
  "file_type": "pdf",
  "file_size": 1024,
  "parsed_content": "Extracted text content...",
  "created_at": "2025-10-17T14:30:00Z"
}
```

#### GET /api/file/
Get all uploaded files.

**Response:**
```json
[
  {
    "id": 1,
    "original_name": "document.pdf",
    "file_type": "pdf",
    "file_size": 1024,
    "created_at": "2025-10-17T14:30:00Z"
  }
]
```

### Shared Chat Endpoints

#### POST /api/chat/shared/create/
Create a shared chat session.

**Request Body:**
```json
{
  "session_id": "session-id",
  "title": "Shared Chat",
  "allow_editing": true,
  "expires_hours": 24
}
```

**Response:**
```json
{
  "success": true,
  "share_token": "abc123",
  "share_url": "http://localhost:3000/chat/shared/abc123/",
  "pdf_url": "/api/chat/shared/abc123/pdf/",
  "expires_at": "2025-10-18T14:30:00Z"
}
```

#### GET /api/chat/shared/{share_token}/
Access a shared chat session.

**Response:**
```json
{
  "session_id": "original-session-id",
  "title": "Shared Chat",
  "messages": [...],
  "is_editable": true,
  "last_synced": "2025-10-17T14:30:00Z",
  "access_count": 5,
  "pdf_url": "/api/chat/shared/abc123/pdf/"
}
```

## File Processing

### Supported File Types

#### PDF Processing
```python
def parse_pdf(file_path):
    """Parse PDF file and extract text using PyPDF2"""
    with open(file_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
    return text
```

#### DOCX Processing
```python
def parse_docx(file_path):
    """Parse DOCX file and extract text"""
    doc = Document(file_path)
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text
```

#### CSV Processing
```python
def parse_csv(file_path):
    """Parse CSV file and extract text"""
    text = ""
    with open(file_path, 'r', encoding='utf-8', newline='') as file:
        csv_reader = csv.reader(file)
        for row in csv_reader:
            text += ", ".join(row) + "\n"
    return text
```

### File Analysis
```python
def analyze_file_content(file_content, file_name, file_type):
    """Analyze file content and provide insights"""
    analysis = {
        'file_name': file_name,
        'file_type': file_type,
        'content_length': len(file_content),
        'insights': []
    }
    
    # Content analysis logic
    if 'resume' in file_name.lower():
        analysis['insights'].append("Appears to be a resume/CV document")
    
    return analysis
```

## PDF Generation

### PDF Structure
```python
def generate_chat_pdf(session_id, messages, title):
    """Generate a PDF of chat interactions"""
    doc = SimpleDocTemplate(
        temp_path,
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=18
    )
    
    # Create styles
    title_style = ParagraphStyle('CustomTitle', ...)
    user_style = ParagraphStyle('UserMessage', ...)
    assistant_style = ParagraphStyle('AssistantMessage', ...)
    
    # Build content
    story = []
    story.append(Paragraph(f"Chat Session: {title}", title_style))
    
    for i, message in enumerate(messages, 1):
        # Add message content with styling
        pass
    
    doc.build(story)
    return temp_path
```

## Real-Time Sync

### Sync Mechanism
```python
def sync_messages(self):
    """Sync messages from original session"""
    original_messages = self.original_session.messages.all().order_by('timestamp')
    self.last_synced = timezone.now()
    self.save(update_fields=['last_synced'])
    return original_messages
```

### Frontend Polling
```typescript
useEffect(() => {
  loadSharedSession();
  
  // Auto-refresh every 30 seconds
  const interval = setInterval(loadSharedSession, 30000);
  return () => clearInterval(interval);
}, [shareToken]);
```

## Security Considerations

### CORS Configuration
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True
```

### File Upload Security
- File type validation
- Size limits (4MB default)
- Content scanning
- Path traversal prevention

### Session Security
- UUID-based session IDs
- Token-based sharing
- Expiration handling
- Access logging

## Performance Optimization

### Database Optimization
- Indexed foreign keys
- Efficient queries
- Connection pooling
- Query optimization

### Frontend Optimization
- Code splitting
- Lazy loading
- Image optimization
- Bundle optimization

### Caching Strategy
- Static file caching
- API response caching
- Session caching
- File content caching

## Monitoring and Logging

### Health Checks
```python
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/api/chat/export-info/')" || exit 1
```

### Logging Configuration
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'chatbot.log',
        },
    },
    'loggers': {
        'chat': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

## Deployment Architecture

### Docker Compose Services
```yaml
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      - DEBUG=False
      - SECRET_KEY=production-secret
    volumes:
      - backend_media:/app/media
    networks:
      - ai-chatbot-network

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000/api
    depends_on:
      - backend
    networks:
      - ai-chatbot-network
```

### Production Considerations
- Environment variable management
- Secret key rotation
- Database migration strategy
- Static file serving
- SSL/TLS configuration
- Load balancing
- Monitoring and alerting

## Testing Strategy

### Unit Tests
- Model validation
- API endpoint testing
- File processing functions
- PDF generation

### Integration Tests
- End-to-end chat flow
- File upload and processing
- Shared session functionality
- PDF generation and download

### Performance Tests
- Load testing
- Memory usage monitoring
- Database query optimization
- File processing benchmarks

## Error Handling

### Backend Error Handling
```python
try:
    # Process request
    result = process_request()
    return Response(result)
except ValidationError as e:
    return Response({'error': str(e)}, status=400)
except Exception as e:
    logger.error(f"Unexpected error: {str(e)}")
    return Response({'error': 'Internal server error'}, status=500)
```

### Frontend Error Handling
```typescript
try {
  const response = await api.post('/chat/', data);
  return response.data;
} catch (error) {
  if (error.response?.status === 400) {
    throw new Error('Invalid request');
  } else if (error.response?.status === 500) {
    throw new Error('Server error');
  } else {
    throw new Error('Network error');
  }
}
```

## Future Enhancements

### Planned Features
- User authentication and authorization
- Advanced file processing (images, audio)
- Multi-language support
- Advanced analytics
- Mobile application
- Voice chat integration
- Real-time collaboration
- Advanced AI models integration

### Technical Improvements
- Microservices architecture
- Event-driven architecture
- Advanced caching strategies
- Database optimization
- Performance monitoring
- Security enhancements
- Scalability improvements
