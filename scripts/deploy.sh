#!/bin/bash

echo "🚀 Deploying CF Agents Demo..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first:"
    echo "npm install -g wrangler"
    exit 1
fi

# Deploy Worker API
echo "📦 Deploying Worker API..."
cd apps/worker-api
wrangler deploy
if [ $? -ne 0 ]; then
    echo "❌ Worker API deployment failed"
    exit 1
fi
echo "✅ Worker API deployed successfully"

# Deploy Pages Frontend
echo "📦 Building and deploying Pages Frontend..."
cd ../pages-frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

wrangler pages deploy dist
if [ $? -ne 0 ]; then
    echo "❌ Pages deployment failed"
    exit 1
fi
echo "✅ Pages Frontend deployed successfully"

# Deploy Workflows
echo "📦 Deploying Workflows..."
cd ../worker-api
wrangler workflows deploy
if [ $? -ne 0 ]; then
    echo "⚠️  Workflows deployment failed (this is optional)"
fi

echo "🎉 Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update your Pages project settings to point to the Worker API"
echo "2. Configure CORS in your Worker API for the Pages domain"
echo "3. Test the deployment with: curl https://your-worker.your-subdomain.workers.dev/health"
