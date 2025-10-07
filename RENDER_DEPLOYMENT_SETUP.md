# 🚀 WRASCAL RENDER DEPLOYMENT SETUP

## 📋 CURRENT STATUS
- ✅ Frontend: Ready (Vue 3 + Vite)
- ✅ Backend: Ready (TsED + TypeORM)
- ✅ Docker: Ready (Multi-stage build)
- ❌ Database: Professor's DB not accessible

## 🎯 DEPLOYMENT OPTIONS

### Option 1: Use Professor's Database (Recommended)
If the professor's database is accessible, you'll need:

**Environment Variables for Render:**
```
DB_HOST=dpg-coa67df79t8c73ed886g-9.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=wrascal_db
DB_USERNAME=wrascal_db_user
DB_PASSWORD=[password from professor]
DB_SCHEMA=public
DB_SSL=true
NODE_ENV=production
TYPEORM_SYNC=false
```

### Option 2: Create Your Own Database
If professor's DB is not accessible:

1. Go to Render.com → New → PostgreSQL
2. Create database with these settings:
   - Name: `wrascal-production`
   - Database: `wrascal_db`
   - User: `wrascal_user`
   - Region: Choose closest

## 🐳 RENDER DEPLOYMENT STEPS

### Step 1: Create Backend Service
1. Go to Render.com → New → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Name**: `wrascal-api`
   - **Runtime**: `Docker`
   - **Root Directory**: `wrascal-ts-2024-master`
   - **Dockerfile Path**: `wrascal-ts-2024-master/Dockerfile`
   - **Build Command**: `yarn build`
   - **Start Command**: `yarn start`

### Step 2: Create Frontend Service
1. Go to Render.com → New → Static Site
2. Connect your GitHub repository
3. Configure:
   - **Name**: `wrascal-frontend`
   - **Root Directory**: `WRASCAL-staging`
   - **Build Command**: `yarn build`
   - **Publish Directory**: `dist`

### Step 3: Set Environment Variables
For the backend service, add these environment variables:

```
DB_HOST=[your database host]
DB_PORT=5432
DB_NAME=[your database name]
DB_USERNAME=[your database username]
DB_PASSWORD=[your database password]
DB_SCHEMA=public
DB_SSL=true
NODE_ENV=production
TYPEORM_SYNC=false
PORT=8081
```

For the frontend service, add:
```
VITE_API_BASE_URL=https://wrascal-api.onrender.com/rest
```

## 🔧 TESTING LOCALLY

Your app is already working locally! Test with:

```bash
# Terminal 1: Start backend + database
cd wrascal-ts-2024-master
docker-compose up

# Terminal 2: Start frontend
cd WRASCAL-staging
yarn dev
```

Then visit: http://localhost:3000

## 📞 NEXT STEPS

1. **Contact your professor** - Ask them to verify the database credentials
2. **Test the credentials** - Use the test script to verify connection
3. **Deploy to Render** - Follow the steps above
4. **Test the deployment** - Verify everything works in production

## 🆘 IF PROFESSOR'S DB IS NOT ACCESSIBLE

Create your own database on Render and use those credentials instead. The app will work exactly the same way.


