# TinyLink Deployment Checklist

## Before Deployment

- [ ] Code pushed to GitHub repository
- [ ] `.env.example` file created with all required variables
- [ ] Package.json contains correct dependencies and scripts
- [ ] Both servers (index.js and server.js) use environment PORT

## Database Setup (Neon)

- [ ] Neon account created
- [ ] New project created in Neon
- [ ] Database connection string obtained
- [ ] Links table created using provided SQL

## Render Deployment

### API Server (index.js)

- [ ] New Web Service created on Render
- [ ] Repository connected
- [ ] Build Command: `npm install`
- [ ] Start Command: `node index.js`
- [ ] Environment variables set:
  - [ ] PG_USER
  - [ ] PG_HOST
  - [ ] PG_DATABASE
  - [ ] PG_PASSWORD
  - [ ] PG_PORT
  - [ ] NODE_ENV=production
- [ ] Service deployed successfully
- [ ] API URL noted (e.g., https://tinylink-api.onrender.com)

### Frontend Server (server.js)

- [ ] New Web Service created on Render
- [ ] Repository connected
- [ ] Build Command: `npm install`
- [ ] Start Command: `node server.js`
- [ ] Environment variables set:
  - [ ] API_URL (your deployed API URL)
  - [ ] NODE_ENV=production
- [ ] Service deployed successfully

## Testing

- [ ] API health check: `/healthz` returns 200
- [ ] Frontend loads without errors
- [ ] Can create new short links
- [ ] Short links redirect properly
- [ ] Statistics page works
- [ ] Search functionality works
- [ ] Delete functionality works

## Post-Deployment

- [ ] Update README with live demo URLs
- [ ] Test all features thoroughly
- [ ] Monitor service logs for any errors
- [ ] Consider setting up custom domain (optional)

## Useful Commands

```bash
# Test API health locally
curl http://localhost:4000/healthz

# Test API health on Render
curl https://your-api-url.onrender.com/healthz

# Check Render service logs
# Use Render dashboard to view real-time logs
```

## Important Notes

1. **Free Tier Limitations**: Services sleep after 15 minutes of inactivity
2. **Cold Starts**: First request after sleep may take 30+ seconds
3. **Database**: Neon free tier has 0.5GB storage limit
4. **Monitoring**: Check service status regularly via Render dashboard
