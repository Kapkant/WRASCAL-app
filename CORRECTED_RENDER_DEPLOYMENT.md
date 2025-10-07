# 🚀 CORRECTED WRASCAL RENDER DEPLOYMENT GUIDE

## ❌ **ISSUES FOUND AND FIXED:**

1. **❌ Wrong Runtime**: Was set to `node` instead of `docker`
2. **❌ Missing Dockerfile Path**: Not specified correctly
3. **❌ Wrong Health Check**: Trying to access non-existent `/rest/hello` endpoint
4. **❌ Missing DB_SCHEMA**: Environment variable not set

## ✅ **FIXED CONFIGURATION:**

### **Backend Service (wrascal-api)**
- **Runtime**: `Docker` ✅
- **Dockerfile Path**: `wrascal-ts-2024-master/Dockerfile` ✅
- **Root Directory**: `wrascal-ts-2024-master` ✅
- **Health Check**: Fixed to use `/` instead of `/rest/hello` ✅

### **Environment Variables Required:**
```
NODE_ENV=production
PORT=8081
DB_SSL=true
TYPEORM_SYNC=false
DB_SCHEMA=public
DB_HOST=[your-database-host]
DB_PORT=5432
DB_USERNAME=[your-database-username]
DB_PASSWORD=[your-database-password]
DB_NAME=[your-database-name]
```

## 🎯 **STEP-BY-STEP DEPLOYMENT:**

### **Step 1: Backend Service**
1. Go to [Render.com](https://render.com) → New → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Name**: `wrascal-api`
   - **Runtime**: `Docker` ⚠️ **IMPORTANT: Use Docker, not Node!**
   - **Root Directory**: `wrascal-ts-2024-master`
   - **Dockerfile Path**: `wrascal-ts-2024-master/Dockerfile`
   - **Plan**: Free

### **Step 2: Environment Variables**
Add these environment variables in Render dashboard:

**Required Database Variables:**
```
DB_HOST=dpg-coa67df79t8c73ed886g-9.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=wrascal_db
DB_USERNAME=wrascal_db_user
DB_PASSWORD=[password from professor]
DB_SCHEMA=public
DB_SSL=true
```

**System Variables:**
```
NODE_ENV=production
PORT=8081
TYPEORM_SYNC=false
```

### **Step 3: Frontend Service**
1. Go to Render.com → New → Static Site
2. Connect your GitHub repository
3. Configure:
   - **Name**: `wrascal-frontend`
   - **Root Directory**: `WRASCAL-staging`
   - **Build Command**: `yarn build`
   - **Publish Directory**: `dist`

### **Step 4: Frontend Environment Variables**
Add this environment variable for the frontend:
```
VITE_API_BASE_URL=https://wrascal-api.onrender.com/rest
```

## 🔧 **TESTING THE DEPLOYMENT:**

### **Local Test (Already Working):**
```bash
# Backend + Database
cd wrascal-ts-2024-master
docker-compose up

# Frontend (in another terminal)
cd WRASCAL-staging
yarn dev
```

Visit: http://localhost:3000

### **Production Test:**
1. Deploy backend first
2. Wait for it to be healthy
3. Deploy frontend
4. Test the live URL

## 🚨 **CRITICAL NOTES:**

1. **Use Docker Runtime**: The app is designed for Docker, not Node.js runtime
2. **Database First**: Make sure your database is accessible before deploying
3. **Environment Variables**: All database credentials must be set correctly
4. **Health Check**: Fixed to use the root endpoint `/` instead of `/rest/hello`

## 📞 **NEXT STEPS:**

1. **Verify Database Access**: Test the professor's database credentials
2. **Deploy Backend**: Use the corrected configuration above
3. **Deploy Frontend**: After backend is working
4. **Test Everything**: Verify the complete application works

## ✅ **CONFIGURATION FILES UPDATED:**

- ✅ `render.yaml` - Fixed runtime and Dockerfile path
- ✅ `Dockerfile` - Fixed health check endpoint
- ✅ Environment variables - Added missing DB_SCHEMA

**Your configuration is now correct and ready for deployment!**


