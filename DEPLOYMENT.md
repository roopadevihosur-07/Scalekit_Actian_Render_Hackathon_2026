# Deployment Guide - MediSync on Render

## Prerequisites

- GitHub repository (already set up)
- Render.com account
- Scalekit account with API credentials
- VectorAI instance (self-hosted or cloud)

## Quick Start - Deploy to Render

### 1. Connect GitHub Repository

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub account and select: `Scalekit_Actian_Render_Hackathon_2026`
4. Configure the service:
   - **Name:** `medisync`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `NODE_ENV=production node server.js`
   - **Plan:** Standard (or higher)

### 2. Set Environment Variables

In the Render dashboard, add these environment variables:

```
SCALEKIT_ENVIRONMENT_URL=https://your-org.scalekit.com
SCALEKIT_CLIENT_ID=skc_xxxxxxxxxxxxx
SCALEKIT_CLIENT_SECRET=sks_xxxxxxxxxxxxx
REDIRECT_URI=https://your-render-app.onrender.com/callback
SESSION_SECRET=your-random-secret-key-min-32-chars
VECTORAI_HOST=your-vectorai-host:6574
PORT=3001
NODE_ENV=production
```

### 3. Update Scalekit Settings

In your Scalekit dashboard, add the redirect URI:
- **Redirect URI:** `https://your-render-app.onrender.com/callback`

### 4. Deploy

Click **Deploy Service**. Render will:
1. Install dependencies (`npm install`)
2. Build the React frontend (`npm run build`)
3. Start the Express server (`node server.js`)

The app will be available at: `https://your-render-app.onrender.com`

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `SCALEKIT_ENVIRONMENT_URL` | ✅ | Scalekit dashboard URL |
| `SCALEKIT_CLIENT_ID` | ✅ | Scalekit API client ID |
| `SCALEKIT_CLIENT_SECRET` | ✅ | Scalekit API secret |
| `REDIRECT_URI` | ✅ | OAuth callback URL (must match Scalekit config) |
| `SESSION_SECRET` | ✅ | Random string for session security (min 32 chars) |
| `VECTORAI_HOST` | ✅ | VectorAI database host:port |
| `PORT` | ❌ | Server port (default: 3001) |
| `NODE_ENV` | ❌ | Environment (default: production) |

## VectorAI Setup

### Option 1: Self-Hosted VectorAI

Deploy VectorAI as a separate Render service or use Docker:
```bash
docker run -d -p 6574:6574 vectorai/server
```

### Option 2: Cloud VectorAI

Use Actian VectorAI cloud service and set `VECTORAI_HOST` accordingly.

## Notion Integration

The app uses Scalekit's AgentKit to connect to Notion. Credentials are managed via Scalekit—no additional setup needed.

## Testing Deployment

After deployment, test:

1. **Home Page:** `https://your-app.onrender.com/`
2. **Server Health:** Check that the app loads without errors
3. **Notion Connection:** In the dashboard, verify Notion integration status
4. **VectorAI:** Test semantic search to ensure DB connection works

## Troubleshooting

### App won't start
- Check `NODE_ENV=production` is set
- Verify all required environment variables are present
- Check Render logs for error messages

### Notion connection fails
- Verify SCALEKIT credentials in environment
- Check that redirect URI in Scalekit matches Render URL
- Re-authenticate Notion via app dashboard

### VectorAI connection fails
- Verify `VECTORAI_HOST` is correct
- Check that VectorAI instance is running and accessible
- Ping the VectorAI host from Render shell

## Performance Tips

- Use Render's **Standard** plan or higher for production
- Enable **Auto-Deploy** for automatic deployments on GitHub push
- Set up **Health Check** in Render dashboard
- Monitor logs for errors: Dashboard → Service → Logs

## Security Considerations

- Never commit `.env` file to GitHub
- Use Render's environment variables, not `.env` files
- Rotate `SESSION_SECRET` periodically
- Keep Scalekit credentials secure
- Use HTTPS only (Render provides free SSL)

## Support

For issues, check:
- Render Logs: Dashboard → Service Logs
- Scalekit Dashboard: Settings → API Credentials
- VectorAI Status: Health check endpoint
