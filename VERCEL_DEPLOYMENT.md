# Vercel Deployment Guide

This guide explains how to deploy the ConvertAI API to Vercel and what to expect.

## Important Limitations

⚠️ **LibreOffice Cannot Run on Vercel**

Vercel is a serverless platform that does not support:
- System packages (like LibreOffice)
- Long-running processes
- Persistent file storage (except `/tmp`)

This means the actual file conversion functionality will **NOT work** on Vercel.

## What Works on Vercel

✅ The following endpoints work perfectly:
- `GET /api/healthz` - Health check endpoint
- `GET /api/status` - System status and resource monitoring
- `GET /api` - API information endpoint

❌ The following endpoints will return 503 errors with helpful messages:
- `POST /api/convert/pptx-to-pdf`
- `POST /api/convert/pdf-to-pptx`
- `POST /api/convert/docx-to-pdf`
- `POST /api/convert/pdf-to-docx`

## Deployment Methods

### Method 1: Deploy Button (Fastest)

1. Click the "Deploy with Vercel" button in the README
2. Follow the Vercel prompts to import and deploy
3. Your API will be live at `https://your-project.vercel.app`

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project directory
cd convertapi

# Login to Vercel
vercel login

# Deploy
vercel

# Or deploy to production
vercel --prod
```

### Method 3: GitHub Integration

1. Fork the repository on GitHub
2. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect the configuration
6. Click "Deploy"

## Configuration

The project includes a `vercel.json` file that:
- Configures serverless functions in the `/api` directory
- Sets up static file serving from `/public`
- Configures function memory and timeout limits

## Testing Your Deployment

After deployment, test these endpoints:

```bash
# Health check
curl https://your-project.vercel.app/api/healthz

# Status page
curl https://your-project.vercel.app/api/status

# Try a conversion (will return 503 with alternatives)
curl -X POST \
  -F "file=@test.docx" \
  https://your-project.vercel.app/api/convert/docx-to-pdf
```

## Recommended Alternatives for Full Functionality

If you need actual file conversion capabilities, consider:

### Option 1: Use a Cloud Conversion API

Integrate a third-party service into your Vercel deployment:
- [CloudConvert](https://cloudconvert.com/)
- [ConvertAPI](https://www.convertapi.com/)
- [Adobe PDF Services](https://developer.adobe.com/document-services/)

### Option 2: Deploy to Container-Friendly Platforms

These platforms support LibreOffice:
- **Railway** - `railway.app`
- **Render** - `render.com`
- **Fly.io** - `fly.io`
- **Google Cloud Run** - Container-based serverless
- **AWS ECS** - Elastic Container Service

### Option 3: Hybrid Architecture

1. Keep your API on Vercel for routing and status
2. Deploy conversion workers to Railway/Render
3. Use a message queue (Redis, SQS) to coordinate jobs

## Environment Variables (Optional)

You can add environment variables in Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add any API keys or configuration needed

Example variables you might need:
```
CLOUDCONVERT_API_KEY=your_api_key
MAX_FILE_SIZE=25000000
```

## Monitoring and Logs

- View real-time logs: Vercel Dashboard → Your Project → Deployments → View Function Logs
- Monitor performance: Vercel Dashboard → Analytics
- Check errors: Vercel Dashboard → Deployment → Function Logs

## Cost Considerations

Vercel's free tier includes:
- 100GB bandwidth per month
- 100 hours of serverless function execution
- Unlimited static site deployments

For conversion services, API costs depend on the provider:
- CloudConvert: Free tier available
- ConvertAPI: Pay per conversion
- Adobe: Enterprise pricing

## Support

- For Vercel deployment issues: [Vercel Support](https://vercel.com/support)
- For application issues: Open an issue on GitHub
- For conversion alternatives: See README.md

## Summary

This Vercel deployment is ideal for:
- ✅ Testing the API structure
- ✅ Deploying the status monitoring interface
- ✅ Integrating with external conversion APIs

This Vercel deployment is **NOT** suitable for:
- ❌ Running LibreOffice conversions
- ❌ Self-hosted conversion processing
- ❌ Long-running conversion jobs

For full conversion functionality, please use Replit, Railway, Render, or similar platforms that support system packages.
