# 🐳 AI Chatbot - Docker Deployment

This guide explains how to run the AI Chatbot using Docker containers for easy deployment and sharing.

## 📋 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)
- At least 2GB RAM available for containers

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
docker-build.bat
```

**Linux/Mac:**
```bash
chmod +x docker-build.sh
./docker-build.sh
```

### Option 2: Manual Setup

1. **Build the containers:**
   ```bash
   docker-compose build
   ```

2. **Start the services:**
   ```bash
   docker-compose up -d
   ```

3. **Check status:**
   ```bash
   docker-compose ps
   ```

## 🌐 Access Your Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Shared Chat Example:** http://localhost:3000/chat/shared/YOUR_TOKEN/

## 📊 Service Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │
│   (Next.js)     │◄──►│   (Django)      │
│   Port: 3000    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
              Docker Network
```

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables:

**Backend (Django):**
- `DEBUG`: Set to `False` for production
- `SECRET_KEY`: Django secret key (change in production)
- `GROQ_API_KEY`: Your Groq API key
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `CORS_ALLOWED_ORIGINS`: Frontend URLs allowed for CORS

**Frontend (Next.js):**
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `UPLOADTHING_SECRET`: UploadThing secret key
- `UPLOADTHING_APP_ID`: UploadThing app ID

### Custom Configuration

Edit `docker-compose.yml` to modify:
- Port mappings
- Environment variables
- Volume mounts
- Resource limits

## 📁 Volumes

The following volumes are created:
- `backend_media`: User uploaded files
- `backend_static`: Django static files

## 🔍 Monitoring & Logs

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Health Checks
Both services include health checks:
- **Backend:** Checks API endpoint availability
- **Frontend:** Checks web server availability

### Monitor Resources
```bash
# Container stats
docker stats

# Service status
docker-compose ps
```

## 🛠️ Development

### Rebuild After Changes
```bash
# Rebuild and restart
docker-compose up --build -d

# Rebuild specific service
docker-compose up --build -d backend
```

### Access Container Shell
```bash
# Backend container
docker-compose exec backend bash

# Frontend container
docker-compose exec frontend sh
```

### Run Django Commands
```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic
```

## 🚀 Production Deployment

### For Cloud Platforms

1. **Update environment variables** in `docker-compose.yml`
2. **Change secret keys** for production
3. **Use PostgreSQL** instead of SQLite
4. **Set up reverse proxy** (nginx/traefik)
5. **Configure SSL certificates**

### Example Production docker-compose.yml
```yaml
version: '3.8'
services:
  backend:
    environment:
      - DEBUG=False
      - SECRET_KEY=your-production-secret-key
      - DATABASE_URL=postgresql://user:pass@db:5432/chatbot
    # ... rest of configuration
```

## 🔒 Security Considerations

1. **Change default secret keys**
2. **Use environment files** for sensitive data
3. **Enable HTTPS** in production
4. **Restrict CORS origins**
5. **Use non-root users** (already configured)
6. **Regular security updates**

## 📦 Sharing Your Application

### Export Docker Images
```bash
# Save images
docker save ai-chatbot-backend > backend.tar
docker save ai-chatbot-frontend > frontend.tar

# Load images on another machine
docker load < backend.tar
docker load < frontend.tar
```

### Share with Docker Hub
```bash
# Tag images
docker tag ai-chatbot-backend your-username/ai-chatbot-backend
docker tag ai-chatbot-frontend your-username/ai-chatbot-frontend

# Push to Docker Hub
docker push your-username/ai-chatbot-backend
docker push your-username/ai-chatbot-frontend
```

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Check what's using the port
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000

# Kill the process or change ports in docker-compose.yml
```

**Container won't start:**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Database issues:**
```bash
# Reset database
docker-compose exec backend python manage.py flush
docker-compose exec backend python manage.py migrate
```

### Clean Up
```bash
# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## 📈 Performance Optimization

### Resource Limits
Add to `docker-compose.yml`:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

### Caching
- Frontend uses Next.js built-in caching
- Backend uses Django's caching framework
- Static files are served efficiently

## 🎯 Next Steps

1. **Test the application** thoroughly
2. **Configure production environment**
3. **Set up monitoring** (Prometheus/Grafana)
4. **Implement CI/CD** pipeline
5. **Add backup strategies**

## 📞 Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify all services are running: `docker-compose ps`
3. Test individual components
4. Check environment variables

---

**🎉 Your AI Chatbot is now containerized and ready for deployment anywhere!**
