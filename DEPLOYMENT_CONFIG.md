# WRASCAL Deployment Configuration

## Backend Environment Variables for Render

Set these in your Render service environment variables:

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

## Frontend Environment Variables

For your frontend deployment (Vercel/Netlify/etc.), set:

```
VITE_API_BASE_URL=https://your-render-app-name.onrender.com/rest
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_KEY=your-supabase-key
```

## Render Service Configuration

- **Build Command**: `yarn build`
- **Start Command**: `yarn start:prod`
- **Node Version**: 18.20.2
- **Port**: 8081

## Database Connection String Format

If you have a connection string instead of individual values:
```
postgresql://username:password@host:port/database?sslmode=require
```

## Next Steps

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the environment variables above
4. Deploy!
5. Update your frontend with the new API URL
6. Deploy your frontend

## Testing

After deployment, test your API at:
- `https://your-app-name.onrender.com/rest/db/search/ligand`
- `https://your-app-name.onrender.com/doc` (Swagger documentation)
