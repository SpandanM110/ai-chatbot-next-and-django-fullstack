# AI Chatbot with File Processing and Real-Time Sharing

A full-stack AI chatbot application built with Next.js frontend and Django backend, featuring file upload processing, real-time chat sharing, PDF generation, and Docker containerization.

<img width="1919" height="935" alt="image" src="https://github.com/user-attachments/assets/d4be0d9c-bfa2-40fd-a835-3bbcfa795353" />


*Modern, professional interface with dark theme, gradient backgrounds, and intuitive user experience*

## Quick Start

### Docker (Recommended)
```bash
# Windows
docker-build.bat

# Linux/Mac
chmod +x docker-build.sh
./docker-build.sh
```

### Manual Setup
```bash
# Backend
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt && python manage.py migrate && python manage.py runserver

# Frontend
cd frontend && npm install && npm run dev
```

**Access**: Frontend at http://localhost:3000, Backend at http://localhost:8000

## Interface Overview

The application features a modern, professional interface with three main sections:

### 🎨 **Left Sidebar - Session Management**
- **Gradient Header**: Beautiful blue-to-purple gradient with AI Chatbot branding
- **New Chat Button**: Prominent glass-effect button to start conversations
- **Action Buttons**: Download (PDF export) and Import (chat restoration) functionality
- **Chat History**: Visual session list with timestamps and conversation titles
- **Status Footer**: Live system status with technology attribution

### 💬 **Center Area - Chat Interface**
- **Professional Header**: Clean branding with descriptive subtitle
- **Empty State**: Engaging welcome screen with feature highlights
- **Message Display**: Clean conversation bubbles with proper spacing
- **Input Area**: Modern textarea with gradient send button and helper text
- **Loading States**: Beautiful loading indicators with animations

### 📁 **Right Sidebar - File Management**
- **Upload Section**: Drag & drop interface with white text for visibility
- **File Support**: PDF, DOCX, CSV, TXT files up to 10MB
- **File List**: Organized display of uploaded files with metadata
- **Status Indicators**: Color-coded upload progress and results

### 🦶 **Footer - Application Info**
- **Brand Section**: Logo, version, and system status
- **Feature Highlights**: Core capabilities and functionality
- **Technology Stack**: Modern tech stack with color-coded indicators
- **Attribution**: Copyright and technology credits

## Visual Design

### 🎨 **Modern UI/UX**
- **Dark Theme**: Professional dark interface with gradient backgrounds
- **Glass Morphism**: Backdrop blur effects for modern depth
- **Gradient Accents**: Blue-to-purple gradients throughout the interface
- **White Text**: High contrast white text for excellent readability
- **Smooth Animations**: Hover effects and loading states with smooth transitions

### 🎯 **User Experience**
- **Intuitive Navigation**: Clear visual hierarchy and logical flow
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Accessibility**: High contrast colors and proper focus states
- **Professional Polish**: Enterprise-grade design quality

## Features

### Core Functionality
- **AI-Powered Chat**: Integration with Groq LLM for intelligent conversations
- **File Processing**: Upload and parse PDF, DOCX, CSV, and TXT files
- **Real-Time Streaming**: Live chat responses with streaming support
- **Session Management**: Persistent chat sessions with history
- **File Context**: AI can analyze and discuss uploaded file contents

### Sharing & Collaboration
- **Real-Time Sharing**: Create shareable chat links that sync automatically
- **PDF Generation**: Export chat conversations as professional PDFs
- **Collaborative Editing**: Allow others to contribute to shared chats
- **Access Tracking**: Monitor who views your shared sessions
- **Session Expiration**: Configurable expiration times for shared chats

### Advanced Features
- **Chat Compression**: Real-time compression for efficient sharing
- **Cross-Platform**: Works on desktop, mobile, and tablet devices
- **Docker Support**: Complete containerization for easy deployment
- **Production Ready**: Optimized for production environments

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: TailwindCSS with custom components
- **State Management**: Zustand for global state
- **File Handling**: Custom drag-and-drop with FilePond
- **Markdown**: React Markdown for rich text rendering
- **API Client**: Axios for HTTP requests

### Backend
- **Framework**: Django 5 with Django REST Framework
- **Database**: SQLite (development) / PostgreSQL (production)
- **File Processing**: PyPDF2, python-docx, csv module
- **PDF Generation**: ReportLab for PDF creation
- **AI Integration**: Groq API for LLM responses
- **CORS**: django-cors-headers for cross-origin requests

### Infrastructure
- **Containerization**: Docker and Docker Compose
- **Web Server**: Gunicorn (production)
- **Static Files**: Django static file handling
- **Health Checks**: Built-in monitoring

## Project Structure

```
AI Chatbot/
├── backend/                    # Django backend
│   ├── core/                   # Django project settings
│   ├── chat/                   # Chat application
│   │   ├── models.py          # Chat and shared session models
│   │   ├── views.py           # Chat API endpoints
│   │   ├── serializers.py     # Data serialization
│   │   ├── shared_views.py    # Shared chat functionality
│   │   ├── pdf_generator.py   # PDF generation utilities
│   │   └── urls.py            # URL routing
│   ├── fileparser/            # File processing application
│   │   ├── models.py          # File storage models
│   │   ├── views.py           # File upload endpoints
│   │   ├── utils.py           # File parsing utilities
│   │   └── analysis.py        # File content analysis
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile            # Backend container
│   └── manage.py             # Django management
├── frontend/                  # Next.js frontend
│   ├── app/                   # Next.js app directory
│   │   ├── page.tsx          # Main application page
│   │   ├── chat/             # Chat routing
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ChatInterface.tsx  # Main chat component
│   │   ├── SessionManager.tsx # Session management
│   │   ├── FileUploader.tsx   # File upload component
│   │   ├── SharedChatSharing.tsx # Sharing functionality
│   │   └── SharedChatViewer.tsx # Shared chat viewer
│   ├── lib/                   # Utility libraries
│   │   ├── api.ts            # API client
│   │   ├── store.ts          # Zustand store
│   │   ├── chatCompression.ts # Compression utilities
│   │   └── uploadthing.ts    # File upload integration
│   ├── package.json          # Node.js dependencies
│   ├── Dockerfile           # Frontend container
│   └── next.config.js       # Next.js configuration
├── docker-compose.yml        # Docker orchestration
├── docker-build.bat         # Windows build script
├── docker-build.sh          # Linux/Mac build script
└── README.md               # This file
```

## Prerequisites

### System Requirements
- **Node.js**: Version 18 or higher
- **Python**: Version 3.11 or higher
- **Docker**: Version 20.10 or higher (optional)
- **Git**: For version control

### API Keys Required
- **Groq API Key**: Get from [Groq Console](https://console.groq.com/)
- **UploadThing Keys**: For file sharing (optional)

## Installation

### Option 1: Docker (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd AI-Chatbot
   ```

2. **Start Docker Desktop**

3. **Run the application**:
   ```bash
   # Windows
   docker-build.bat
   
   # Linux/Mac
   chmod +x docker-build.sh
   ./docker-build.sh
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

### Option 2: Manual Installation

#### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # or
   venv\Scripts\activate     # Windows
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Start the server**:
   ```bash
   python manage.py runserver
   ```

#### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Groq API
GROQ_API_KEY=your-groq-api-key

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Create a `.env.local` file in the frontend directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# UploadThing (Optional)
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id
```

### Groq API Setup

1. **Get API Key**: Visit [Groq Console](https://console.groq.com/)
2. **Create Account**: Sign up for a free account
3. **Generate Key**: Create a new API key
4. **Add to Environment**: Update your `.env` file

## Usage

### Basic Chat

1. **Start a conversation**: Type your message in the chat input
2. **Upload files**: Drag and drop files to analyze with AI
3. **View history**: Access previous conversations in the sidebar

### File Processing

Supported file types:
- **PDF**: Text extraction and analysis
- **DOCX**: Word document processing
- **CSV**: Spreadsheet data analysis
- **TXT**: Plain text files

### Sharing Chats

1. **Create shared session**: Click "Share" in the sidebar
2. **Configure settings**: Set title, expiration, and permissions
3. **Get shareable link**: Copy the generated URL
4. **Share with others**: Send the link to collaborators

### PDF Export

1. **Generate PDF**: Click "Download PDF" in shared chats
2. **Professional formatting**: Includes timestamps and styling
3. **Complete history**: All messages and file attachments

## API Documentation

### Chat Endpoints

#### Send Message
```
POST /api/chat/
Content-Type: application/json

{
  "message": "Hello, how are you?",
  "session_id": "optional-session-id",
  "stream": true
}
```

#### Get Sessions
```
GET /api/chat/sessions/
```

#### Get Session
```
GET /api/chat/session/{session_id}/
```

### File Endpoints

#### Upload File
```
POST /api/file/upload/
Content-Type: multipart/form-data

file: [file data]
description: "Optional description"
```

#### Get Files
```
GET /api/file/
```

### Shared Chat Endpoints

#### Create Shared Session
```
POST /api/chat/shared/create/
Content-Type: application/json

{
  "session_id": "session-id",
  "title": "Shared Chat Title",
  "allow_editing": true,
  "expires_hours": 24
}
```

#### Access Shared Session
```
GET /api/chat/shared/{share_token}/
```

#### Get Shared PDF
```
GET /api/chat/shared/{share_token}/pdf/
```

## Docker Deployment

### Local Development

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment

1. **Update environment variables** in `docker-compose.yml`
2. **Change secret keys** for security
3. **Use PostgreSQL** for production database
4. **Configure reverse proxy** (nginx/traefik)
5. **Set up SSL certificates**

### Cloud Deployment

The application is ready for deployment on:
- **AWS**: ECS, EKS, or EC2
- **Google Cloud**: Cloud Run or GKE
- **Azure**: Container Instances or AKS
- **Railway**: Direct deployment
- **Fly.io**: Global deployment

## Development

### Backend Development

```bash
# Run Django shell
python manage.py shell

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Collect static files
python manage.py collectstatic
```

### Frontend Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Code Structure

- **Backend**: Follows Django best practices with apps separation
- **Frontend**: Component-based architecture with TypeScript
- **API**: RESTful design with proper HTTP status codes
- **Database**: Normalized schema with proper relationships

## Testing

### Backend Tests

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test chat
python manage.py test fileparser

# Run with coverage
coverage run --source='.' manage.py test
coverage report
```

### Frontend Tests

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Integration Tests

```bash
# Test chat functionality
python test_chat.py

# Test file processing
python test_file_access.py

# Test shared chat
python test_shared_chat.py

# Test Docker setup
python test_docker.py
```

## Troubleshooting

### Common Issues

#### Backend Issues

**Database errors**:
```bash
# Reset database
python manage.py flush
python manage.py migrate
```

**Import errors**:
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

**CORS errors**:
- Check `CORS_ALLOWED_ORIGINS` in settings
- Verify frontend URL is included

#### Frontend Issues

**Build errors**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API connection errors**:
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check if backend is running

#### Docker Issues

**Container won't start**:
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Port conflicts**:
- Change ports in `docker-compose.yml`
- Check if ports are already in use

### Performance Optimization

#### Backend Optimization
- Use database connection pooling
- Implement caching with Redis
- Optimize database queries
- Use CDN for static files

#### Frontend Optimization
- Implement code splitting
- Use image optimization
- Enable compression
- Implement service workers

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/new-feature`
3. **Make changes**: Follow coding standards
4. **Run tests**: Ensure all tests pass
5. **Commit changes**: Use conventional commits
6. **Push branch**: `git push origin feature/new-feature`
7. **Create pull request**: Describe changes clearly

### Coding Standards

- **Python**: Follow PEP 8 guidelines
- **JavaScript/TypeScript**: Use ESLint configuration
- **Commits**: Use conventional commit format
- **Documentation**: Update README for new features

### Testing Requirements

- **Unit tests**: For all new functions
- **Integration tests**: For API endpoints
- **E2E tests**: For user workflows
- **Performance tests**: For critical paths

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:

1. **Check documentation**: Review this README thoroughly
2. **Search issues**: Look for similar problems in GitHub issues
3. **Create issue**: Provide detailed information about the problem
4. **Community**: Join discussions in the project repository

## Changelog

### Version 1.0.0
- Initial release with core chat functionality
- File upload and processing capabilities
- Real-time chat sharing with PDF export
- Docker containerization support
- Production-ready deployment configuration

---

**Built with Django, Next.js, and modern web technologies for a seamless AI chatbot experience.**
