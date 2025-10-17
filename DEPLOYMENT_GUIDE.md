# Deployment Guide

## Overview

This guide covers deploying the AI Chatbot application to various platforms and environments, from local development to production cloud deployment.

## Table of Contents

- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Production Configuration](#production-configuration)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- Git

### Setup Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd AI-Chatbot
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access Application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

## Docker Deployment

### Quick Start

1. **Start Docker Desktop**

2. **Run Application**
   ```bash
   # Windows
   docker-build.bat
   
   # Linux/Mac
   chmod +x docker-build.sh
   ./docker-build.sh
   ```

3. **Access Application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

### Manual Docker Commands

```bash
# Build containers
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build -d
```

### Docker Configuration

#### Environment Variables
Create a `.env` file:
```env
DEBUG=False
SECRET_KEY=your-production-secret-key
GROQ_API_KEY=your-groq-api-key
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

#### Volume Management
```bash
# View volumes
docker volume ls

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Backup volumes
docker run --rm -v ai-chatbot_backend_media:/data -v $(pwd):/backup alpine tar czf /backup/backend_media.tar.gz -C /data .
```

## Cloud Deployment

### Railway Deployment

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   railway init
   railway up
   ```

3. **Deploy Frontend**
   ```bash
   cd frontend
   railway init
   railway up
   ```

4. **Configure Environment Variables**
   - Set `GROQ_API_KEY` in Railway dashboard
   - Set `SECRET_KEY` for production
   - Configure `ALLOWED_HOSTS` with Railway domain

### Fly.io Deployment

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   fly auth login
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   fly launch
   fly deploy
   ```

3. **Deploy Frontend**
   ```bash
   cd frontend
   fly launch
   fly deploy
   ```

### AWS Deployment

#### Using ECS

1. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name ai-chatbot-backend
   aws ecr create-repository --repository-name ai-chatbot-frontend
   ```

2. **Build and Push Images**
   ```bash
   # Backend
   docker build -t ai-chatbot-backend ./backend
   docker tag ai-chatbot-backend:latest <account>.dkr.ecr.<region>.amazonaws.com/ai-chatbot-backend:latest
   docker push <account>.dkr.ecr.<region>.amazonaws.com/ai-chatbot-backend:latest

   # Frontend
   docker build -t ai-chatbot-frontend ./frontend
   docker tag ai-chatbot-frontend:latest <account>.dkr.ecr.<region>.amazonaws.com/ai-chatbot-frontend:latest
   docker push <account>.dkr.ecr.<region>.amazonaws.com/ai-chatbot-frontend:latest
   ```

3. **Create ECS Task Definition**
   ```json
   {
     "family": "ai-chatbot",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "containerDefinitions": [
       {
         "name": "backend",
         "image": "<account>.dkr.ecr.<region>.amazonaws.com/ai-chatbot-backend:latest",
         "portMappings": [
           {
             "containerPort": 8000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "DEBUG",
             "value": "False"
           }
         ]
       }
     ]
   }
   ```

### Google Cloud Deployment

#### Using Cloud Run

1. **Enable APIs**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   gcloud run deploy ai-chatbot-backend --source . --platform managed --region us-central1
   ```

3. **Deploy Frontend**
   ```bash
   cd frontend
   gcloud run deploy ai-chatbot-frontend --source . --platform managed --region us-central1
   ```

### Azure Deployment

#### Using Container Instances

1. **Create Resource Group**
   ```bash
   az group create --name ai-chatbot-rg --location eastus
   ```

2. **Deploy Backend**
   ```bash
   az container create \
     --resource-group ai-chatbot-rg \
     --name ai-chatbot-backend \
     --image your-registry/ai-chatbot-backend:latest \
     --ports 8000 \
     --environment-variables DEBUG=False
   ```

3. **Deploy Frontend**
   ```bash
   az container create \
     --resource-group ai-chatbot-rg \
     --name ai-chatbot-frontend \
     --image your-registry/ai-chatbot-frontend:latest \
     --ports 3000 \
     --environment-variables NODE_ENV=production
   ```

## Production Configuration

### Environment Variables

#### Backend Production Settings
```env
DEBUG=False
SECRET_KEY=your-super-secret-production-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
GROQ_API_KEY=your-groq-api-key
DATABASE_URL=postgresql://user:password@host:port/database
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

#### Frontend Production Settings
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id
```

### Database Configuration

#### PostgreSQL Setup
```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'chatbot'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}
```

#### Database Migration
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
```

### Security Configuration

#### HTTPS Setup
```python
# settings.py
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'
```

#### CORS Configuration
```python
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]
CORS_ALLOW_CREDENTIALS = True
```

### Static Files Configuration

#### AWS S3 Setup
```python
# settings.py
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
AWS_DEFAULT_ACL = 'public-read'
AWS_S3_OBJECT_PARAMETERS = {
    'CacheControl': 'max-age=86400',
}
```

#### CDN Configuration
```python
STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/static/'
MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'
```

## Monitoring and Maintenance

### Health Checks

#### Application Health
```python
# health_check.py
def check_database():
    from django.db import connection
    cursor = connection.cursor()
    cursor.execute("SELECT 1")
    return True

def check_groq_api():
    import requests
    response = requests.get('https://api.groq.com/openai/v1/models')
    return response.status_code == 200
```

#### Docker Health Checks
```dockerfile
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health/')" || exit 1
```

### Logging Configuration

#### Django Logging
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/chatbot/django.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'chat': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### Performance Monitoring

#### Database Monitoring
```python
# settings.py
DATABASES = {
    'default': {
        # ... database config
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}

# Add database query logging
LOGGING['loggers']['django.db.backends'] = {
    'level': 'DEBUG',
    'handlers': ['console'],
}
```

#### Application Performance
```python
# Install django-debug-toolbar for development
INSTALLED_APPS += ['debug_toolbar']
MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
```

### Backup Strategy

#### Database Backup
```bash
# PostgreSQL backup
pg_dump -h localhost -U postgres chatbot > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql -h localhost -U postgres chatbot < backup_file.sql
```

#### File Backup
```bash
# Backup media files
tar -czf media_backup_$(date +%Y%m%d_%H%M%S).tar.gz /path/to/media/

# Backup static files
tar -czf static_backup_$(date +%Y%m%d_%H%M%S).tar.gz /path/to/static/
```

### Automated Deployment

#### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          railway login --token ${{ secrets.RAILWAY_TOKEN }}
          railway up
```

#### Docker Hub Integration
```yaml
# .github/workflows/docker.yml
name: Build and Push Docker Images

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and push backend
        run: |
          docker build -t ai-chatbot-backend ./backend
          docker tag ai-chatbot-backend:latest your-registry/ai-chatbot-backend:latest
          docker push your-registry/ai-chatbot-backend:latest
```

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database connectivity
python manage.py dbshell

# Reset database
python manage.py flush
python manage.py migrate
```

#### Static Files Issues
```bash
# Collect static files
python manage.py collectstatic --noinput

# Check static file configuration
python manage.py findstatic admin/css/base.css
```

#### CORS Issues
```python
# Check CORS configuration
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]
CORS_ALLOW_CREDENTIALS = True
```

#### File Upload Issues
```python
# Check file size limits
FILE_UPLOAD_MAX_MEMORY_SIZE = 4 * 1024 * 1024  # 4MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 4 * 1024 * 1024  # 4MB
```

### Performance Issues

#### Database Optimization
```python
# Add database indexes
class ChatMessage(models.Model):
    # ... fields
    class Meta:
        indexes = [
            models.Index(fields=['session', 'timestamp']),
            models.Index(fields=['role']),
        ]
```

#### Caching Configuration
```python
# Redis caching
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}
```

### Security Issues

#### Secret Key Management
```python
# Generate new secret key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

#### Environment Variable Security
```bash
# Use environment files
echo "SECRET_KEY=your-secret-key" > .env
echo "GROQ_API_KEY=your-api-key" >> .env
```

### Monitoring Issues

#### Health Check Failures
```bash
# Check application logs
docker-compose logs backend
docker-compose logs frontend

# Check container status
docker-compose ps
```

#### Performance Monitoring
```bash
# Monitor resource usage
docker stats

# Check database performance
python manage.py shell
>>> from django.db import connection
>>> connection.queries
```

## Maintenance Tasks

### Regular Maintenance

#### Daily Tasks
- Monitor application logs
- Check database performance
- Verify backup completion
- Monitor resource usage

#### Weekly Tasks
- Review security logs
- Update dependencies
- Clean up old files
- Performance analysis

#### Monthly Tasks
- Security audit
- Dependency updates
- Database optimization
- Backup testing

### Scaling Considerations

#### Horizontal Scaling
- Load balancer configuration
- Database replication
- Session management
- File storage distribution

#### Vertical Scaling
- Resource monitoring
- Performance optimization
- Database tuning
- Caching strategies

This deployment guide provides comprehensive instructions for deploying the AI Chatbot application across various platforms and environments, ensuring reliable and scalable deployment.
