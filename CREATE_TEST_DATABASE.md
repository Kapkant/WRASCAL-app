# 🗄️ HOW TO CREATE YOUR OWN TEST DATABASE

## Step 1: Go to Render.com
1. Visit [render.com](https://render.com)
2. Sign up or login to your account

## Step 2: Create PostgreSQL Database
1. Click **"New +"** button
2. Select **"PostgreSQL"**
3. Fill in the details:
   - **Name**: `wrascal-test-db`
   - **Database**: `wrascal_test`
   - **User**: `wrascal_user`
   - **Region**: Choose closest to you
   - **Plan**: Free (for testing)

## Step 3: Wait for Database to Start
- Wait 2-3 minutes for the database to be ready
- You'll see a "Ready" status when it's done

## Step 4: Get Your Credentials
Render will show you:
- **Host**: `dpg-xxxxx.oregon-postgres.render.com`
- **Port**: `5432`
- **Database**: `wrascal_test`
- **Username**: `wrascal_user`
- **Password**: `[generated password]`
- **URL**: `postgresql://username:password@host:port/database`

## Step 5: Test the Connection
Once you have the credentials, run:

```bash
cd wrascal-ts-2024-master
node test-db-final.js
```

But first, update the test script with your new credentials.

## Step 6: Update Environment Variables
In your Render web service, set:
- `DB_HOST` = your new host
- `DB_PORT` = 5432
- `DB_NAME` = wrascal_test
- `DB_USERNAME` = wrascal_user
- `DB_PASSWORD` = your new password
- `DB_SSL` = true

## Step 7: Deploy
Once the database is working, deploy your app!



