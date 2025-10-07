#!/bin/bash

echo "🚀 WRASCAL Deployment Script for Render"
echo "========================================"

echo ""
echo "📋 Prerequisites Checklist:"
echo "✅ Database credentials ready"
echo "✅ Code committed to git"
echo "✅ Render account created"
echo ""

echo "🔧 Next Steps:"
echo "1. Push your code to GitHub/GitLab/Bitbucket"
echo "2. Go to https://render.com"
echo "3. Create a new Web Service"
echo "4. Connect your repository"
echo "5. Set environment variables (see DEPLOYMENT_CONFIG.md)"
echo "6. Deploy!"
echo ""

echo "📝 Environment Variables to Set in Render:"
echo "DB_HOST=your-render-db-host"
echo "DB_PORT=5432"
echo "DB_USERNAME=your-render-db-username"
echo "DB_PASSWORD=your-render-db-password"
echo "DB_NAME=your-render-db-name"
echo "DB_SCHEMA=public"
echo "DB_SSL=true"
echo "NODE_ENV=production"
echo "PORT=8081"
echo "TYPEORM_SYNC=false"
echo ""

echo "🎯 Build Command: yarn build"
echo "🎯 Start Command: yarn start:prod"
echo "🎯 Node Version: 18.20.2"
echo ""

echo "📚 For detailed instructions, see DEPLOYMENT_CONFIG.md"
echo ""

# Check if we're in a git repository
if [ -d ".git" ]; then
    echo "✅ Git repository initialized"
    echo "📤 Ready to push to remote repository"
    echo ""
    echo "To push to GitHub:"
    echo "1. Create a new repository on GitHub"
    echo "2. Run: git remote add origin https://github.com/yourusername/your-repo-name.git"
    echo "3. Run: git push -u origin main"
else
    echo "❌ Not in a git repository"
fi

echo ""
echo "🎉 Happy Deploying!"
