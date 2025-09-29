# WRASCAL Backend Deployment Guide for Render

## Prerequisites
- Render account with database credentials
- Git repository (GitHub/GitLab/Bitbucket)

## Step 1: Environment Variables
You'll need to set these environment variables in your Render service:

```
DB_HOST=your-render-db-host
DB_PORT=5432
DB_USERNAME=your-render-db-username
DB_PASSWORD=your-render-db-password
DB_NAME=your-render-db-name
DB_SCHEMA=public
DB_SSL=true
NODE_ENV=production
PORT=8081
TYPEORM_SYNC=false
```

## Step 2: Render Service Configuration
- **Build Command**: `yarn build`
- **Start Command**: `yarn start:prod`
- **Node Version**: 18.20.2 (as specified in Dockerfile)

## Step 3: Database Setup
1. Create a PostgreSQL database on Render
2. Note down the connection details
3. Set the environment variables in your service

## Step 4: Deployment Steps
1. Push your code to Git repository
2. Connect repository to Render
3. Set environment variables
4. Deploy!

## Important Notes
- The backend runs on port 8081 by default
- Make sure to enable SSL for database connections
- The app will automatically create tables on first run (TYPEORM_SYNC=false in production)
