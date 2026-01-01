# Environment Variables

## Required
- DATABASE_URL
- JWT_SECRET
- JWT_REFRESH_SECRET
- ENCRYPTION_KEY
- LITELLM_PROXY_URL
- REDIS_HOST
- REDIS_PORT
- DOCKER_SOCKET_PATH
- STORAGE_PATH

## Notes
If DATABASE_URL or JWT secrets are missing, auth and API routes will fail to start.
