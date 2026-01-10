# Railway Deployment Guide

## Prerequisites
- A [Railway](https://railway.app) account
- Git repository connected to Railway
- MongoDB database (can be provisioned on Railway or use your existing one)

## Deployment Steps

### 1. Create a New Project on Railway
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository and branch

### 2. Configure Environment Variables
Add the following environment variables in Railway dashboard (Settings → Variables):

#### Required Variables
```
NODE_ENV=production
PORT=${{PORT}}
DATABASE_URL=your-mongodb-connection-string
JWT_SECRET=your-secure-jwt-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-domain.com
AI_ENGINE_URL=your-ai-engine-url
```

#### Variable Descriptions
- `NODE_ENV`: Set to `production` for production deployment
- `PORT`: Railway automatically provides this variable (use `${{PORT}}`)
- `DATABASE_URL`: MongoDB connection string (format: `mongodb://user:password@host:port/database`)
- `JWT_SECRET`: Strong secret key for JWT token signing (generate a secure random string)
- `JWT_EXPIRES_IN`: JWT token expiration time (e.g., `7d`, `24h`, `30d`)
- `CORS_ORIGIN`: Comma-separated list of allowed origins (e.g., `https://app.example.com, https://www.example.com`)
- `AI_ENGINE_URL`: URL of your AI engine service

### 3. Database Setup Options

#### Option A: Use Railway's MongoDB Plugin (Recommended)
1. In your Railway project, click "New"
2. Select "Database" → "Add MongoDB"
3. Railway will automatically create a `DATABASE_URL` variable
4. Copy this value to use in your service

#### Option B: Use External MongoDB
1. Use your existing MongoDB connection string
2. Ensure the connection string includes authentication credentials
3. Format: `mongodb://username:password@host:port/database?retryWrites=true&w=majority`

### 4. Configure Build & Deploy Settings
Railway automatically detects Node.js projects. The configuration is in `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 5. Deploy
1. Push your changes to GitHub
2. Railway will automatically deploy your application
3. Monitor the deployment logs in Railway dashboard
4. Once deployed, Railway provides a public URL (e.g., `https://your-app.up.railway.app`)

### 6. Custom Domain (Optional)
1. Go to Settings → Networking in Railway dashboard
2. Click "Add Custom Domain"
3. Enter your domain name
4. Update DNS records as instructed by Railway
5. Update `CORS_ORIGIN` to include your custom domain

## Post-Deployment

### Health Check
Test your deployment:
```bash
curl https://your-app.up.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-10T...",
  "environment": "production"
}
```

### API Endpoints
- Base URL: `https://your-app.up.railway.app/api`
- Health: `https://your-app.up.railway.app/health`

### Monitor Logs
View application logs in Railway dashboard:
1. Go to your service in Railway
2. Click "Logs" tab
3. Monitor for any errors or issues

## Troubleshooting

### Common Issues

#### Database Connection Fails
- Verify `DATABASE_URL` is correct
- Check if MongoDB accepts connections from Railway IPs
- For MongoDB Atlas, ensure IP whitelist includes `0.0.0.0/0` or Railway's IPs

#### Port Binding Error
- Ensure you're using `process.env.PORT` in your application
- Railway automatically assigns a port via the `PORT` variable

#### CORS Errors
- Update `CORS_ORIGIN` to include your frontend domain
- Ensure no trailing slashes in URLs
- Use comma-separated list for multiple origins

#### Application Crashes on Start
- Check deployment logs in Railway dashboard
- Verify all required environment variables are set
- Ensure `NODE_ENV=production` is set

### Viewing Logs
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# View logs
railway logs
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NODE_ENV | Yes | development | Application environment |
| PORT | Yes | Auto | Server port (provided by Railway) |
| DATABASE_URL | Yes | - | MongoDB connection string |
| JWT_SECRET | Yes | - | Secret key for JWT signing |
| JWT_EXPIRES_IN | No | 7d | JWT token expiration |
| CORS_ORIGIN | Yes | * | Allowed CORS origins |
| AI_ENGINE_URL | Yes | - | AI engine service URL |

## Security Recommendations

1. **JWT Secret**: Generate a strong, random secret key:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **CORS**: Only allow specific trusted domains in production

3. **Environment Variables**: Never commit `.env` files to version control

4. **Database**: Use strong passwords and enable authentication

5. **HTTPS**: Railway provides HTTPS by default - ensure your frontend uses HTTPS

## Updates and Rollbacks

### Automatic Deployment
- Push changes to your connected GitHub branch
- Railway automatically deploys new changes

### Manual Rollback
1. Go to Deployments in Railway dashboard
2. Find the previous working deployment
3. Click "Redeploy"

## Support
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Report issues in your repository
