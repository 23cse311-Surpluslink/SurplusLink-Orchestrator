# Docker Setup for SurplusLink

This guide explains how to run the SurplusLink application using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

1. **Make sure you have a `.env` file in the `backend` folder** with all required environment variables (MongoDB URI,JWT secrets, Cloudinary credentials, etc.)

2. **Start the application:**
   ```bash
   docker-compose up
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## Docker Commands

### Start services (detached mode)
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Rebuild and start services
```bash
docker-compose up --build
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Execute commands in running containers
```bash
# Backend shell
docker-compose exec backend sh

# Frontend shell
docker-compose exec frontend sh
```

## Development Mode

The `docker-compose.yml` is configured for development:
- **Backend**: Uses `npm run dev` with nodemon for hot-reloading
- **Frontend**: Built and served with nginx (production mode)
- **Volumes**: Backend source code is mounted for live updates

## Production Deployment

For production, you may want to:
1. Remove volume mounts from backend service
2. Use `npm start` instead of `npm run dev` for backend
3. Set appropriate environment variables
4. Use a reverse proxy (nginx/traefik) in front of services

## Troubleshooting

### Port already in use
If ports 5173 or 8000 are already in use, modify the port mappings in `docker-compose.yml`:
```yaml
ports:
  - "3000:80"  # Change 5173 to 3000 for frontend
  - "9000:8000"  # Change 8000 to 9000 for backend
```

### Backend can't connect to MongoDB
Make sure your `.env` file has the correct MongoDB connection string. If using MongoDB locally (not in Docker), use `host.docker.internal` instead of `localhost`:
```
MONGODB_URI=mongodb://host.docker.internal:27017/surpluslink
```

### Changes not reflecting
- For backend: Changes should auto-reload with nodemon
- For frontend: Rebuild the container with `docker-compose up --build frontend`

## File Structure

```
.
├── docker-compose.yml          # Orchestrates both services
├── backend/
│   ├── Dockerfile              # Backend container definition
│   ├── .dockerignore           # Files to exclude from build
│   └── .env                    # Environment variables (required)
└── frontend/
    ├── Dockerfile              # Multi-stage frontend build
    ├── nginx.conf              # Nginx configuration for SPA
    └── .dockerignore           # Files to exclude from build
```

## Notes

- The backend service must have a `.env` file to run properly
- Frontend is built in production mode and served via nginx
- Both services are connected via a Docker network for inter-service communication
- Hot-reloading is enabled for backend development
