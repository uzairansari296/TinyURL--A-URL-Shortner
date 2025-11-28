TinyLink - URL Shortener

TinyLink is a full-stack URL shortening service built with Node.js, Express, PostgreSQL, and EJS. It lets users convert long URLs into short, shareable links, track link analytics, and manage everything through a simple, clean web interface.

Features

URL shortening to convert long links into short, easy-to-share URLs

Custom short codes with 6–8 alphanumeric characters

Automatic code generation if no custom code is provided

Click tracking with total click count and last-click timestamp

Search functionality to find links by short code

Link management: view, delete, analyze performance

Responsive and modern user interface

Built-in health check endpoints for frontend and backend services

Architecture

The project uses a lightweight microservices structure with two servers:

Frontend Server (server.js) – runs at port 3000

API Server (index.js) – runs at port 4000

The frontend communicates with the API using Axios and renders pages using EJS templates.

Tech Stack

Backend: Node.js, Express.js

Database: PostgreSQL

View Engine: EJS

HTTP Client: Axios

Environment Variables: dotenv

Development Tools: Nodemon

Dependencies
{
  "axios": "^1.13.2",
  "body-parser": "^2.2.1",
  "dotenv": "^17.2.3",
  "ejs": "^3.1.10",
  "express": "^5.1.0",
  "method-override": "^3.0.0",
  "nodemon": "^3.1.11",
  "pg": "^8.16.3"
}

Getting Started
Prerequisites

Node.js (version 14 or above)

PostgreSQL

npm or yarn

Installation Steps

Clone the repository

git clone <repository-url>
cd Aganitha_Assignment


Install dependencies

npm install


Create a .env file at the root level

PG_USER=your_postgres_username
PG_HOST=localhost
PG_DATABASE=your_database_name
PG_PASSWORD=your_postgres_password
PG_PORT=5432


Set up the database

CREATE DATABASE "TinyLink Database Schema";

CREATE TABLE links (
    id SERIAL PRIMARY KEY,
    short_code VARCHAR(8) UNIQUE NOT NULL,
    target_url TEXT NOT NULL,
    total_clicks INTEGER DEFAULT 0,
    last_clicked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


Start both servers

API server:

node index.js


Frontend server:

node server.js


or

nodemon server.js


Open the application
Visit: http://localhost:3000

API Endpoints
Link Management
Method	Endpoint	Description
GET	/api/links	Fetch all links (supports search)
POST	/links	Create a new short link
GET	/api/links/:code	Get link details
DELETE	/api/links/:code	Delete a link
Redirect and Tracking
Method	Endpoint	Description
GET	/links/:code/redirect	Get long URL and update click count
GET	/:code	Public redirect to original URL
Health Check
Method	Endpoint	Description
GET	/healthz	Simple health check
Frontend Routes
Route	Description
/	Dashboard showing all short links
/add	Create new short link
/search	Search links by code
/code/:code	View link analytics
/:code	Redirect to long URL
Database Schema
CREATE TABLE links (
    id SERIAL PRIMARY KEY,
    short_code VARCHAR(8) UNIQUE NOT NULL,
    target_url TEXT NOT NULL,
    total_clicks INTEGER DEFAULT 0,
    last_clicked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Usage Examples
Creating a Short Link

Go to http://localhost:3000/add

Enter a long URL

Optionally provide a short code

Submit to generate your shortened link

Using the Short Link

Open:

http://localhost:3000/YOUR_SHORT_CODE

Viewing Statistics

Open any link from the dashboard to see click analytics.

Searching for a Link

Use the search bar on the main page.

Configuration

Customize via environment variables:

PORT – Frontend port (default 3000)

PG_USER – PostgreSQL username

PG_HOST – Database host

PG_DATABASE – Database name

PG_PASSWORD – Database password

PG_PORT – Database port

Error Handling

The app handles errors like:

Invalid or missing URLs

Duplicate custom codes

Database connection issues

API communication issues

Non-existing short codes

Health Checks

Frontend: http://localhost:3000/healthz

API: http://localhost:4000/healthz

Features Explained
Short Code Generation

Codes are 7 characters by default

Custom codes allowed between 6–8 characters

Uniqueness checked before saving

Click Tracking

Counts every redirect

Records last visit timestamp

Updates in real time

Search and Filtering

Search short codes case-insensitively

Results show on the same dashboard

## 🚀 Deployment Guide

This application is ready for deployment on free hosting services. Choose one of the following platforms:

### Step 1: Set up Neon PostgreSQL Database (Free)

1. **Create a Neon account**: Go to [neon.tech](https://neon.tech) and sign up
2. **Create a new project**: Click "Create Project"
3. **Copy the connection string**: After creation, copy the connection string from the dashboard
4. **Create the database schema**: Connect to your database and run:

```sql
CREATE TABLE links (
    id SERIAL PRIMARY KEY,
    short_code VARCHAR(8) UNIQUE NOT NULL,
    target_url TEXT NOT NULL,
    total_clicks INTEGER DEFAULT 0,
    last_clicked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Option A: Deploy to Railway (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy to Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will automatically detect the Procfile and start deployment

3. **Set environment variables** in Railway dashboard:
   ```
   DATABASE_URL=your_neon_connection_string
   NODE_ENV=production
   ```

4. **Access your deployed app**: Railway will provide a public URL

### Option B: Deploy to Render

1. **Push your code to GitHub** (same as Railway)

2. **Deploy to Render**:
   - Go to [render.com](https://render.com)
   - Sign up with GitHub
   - Click "New+" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

3. **Set environment variables** in Render dashboard:
   ```
   DATABASE_URL=your_neon_connection_string
   NODE_ENV=production
   ```

### Option C: Deploy to Vercel

1. **Push your code to GitHub** (same as above)

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository
   - Vercel will use the `vercel.json` configuration automatically

3. **Set environment variables** in Vercel dashboard:
   ```
   DATABASE_URL=your_neon_connection_string
   NODE_ENV=production
   ```

### Environment Variables Required

For all hosting services, you need to set these environment variables:

```bash
# Required
DATABASE_URL=postgresql://username:password@host:5432/database

# Optional (will use defaults if not set)
NODE_ENV=production
PORT=3000
```

### Testing Your Deployment

1. **Health Check**: Visit `https://your-app-url.com/healthz`
2. **Main App**: Visit `https://your-app-url.com`
3. **Create a link**: Test the full functionality

### Troubleshooting Deployment

**Common Issues**:

- **Database connection errors**: Verify your `DATABASE_URL` is correct
- **Module not found**: Ensure all dependencies are in `package.json`
- **Port issues**: Make sure you're using `process.env.PORT`
- **Build failures**: Check the build logs for specific error messages

**Logs Access**:
- **Railway**: View logs in the deployment tab
- **Render**: Check the logs section in your service dashboard
- **Vercel**: View function logs in the functions tab

### Local Development vs Production

The application now runs as a single process (`app.js`) which combines both the frontend and API servers. This works for both local development and production deployment.

**Local Development**:
```bash
npm run dev  # Uses nodemon for auto-restart
```

**Production**:
```bash
npm start    # Uses node directly
```

## 🚀 Deployment Guide

### Step 1: Setup Free PostgreSQL Database (Neon)

1. **Create Neon Account**:
   - Go to [neon.tech](https://neon.tech)
   - Sign up for free
   - Create a new project

2. **Get Database Credentials**:
   - Copy the connection string from your Neon dashboard
   - It will look like: `postgresql://username:password@host:5432/database`

3. **Create Tables**:
   - Use Neon's SQL editor or connect with a client
   - Run the following SQL:
   ```sql
   CREATE TABLE links (
       id SERIAL PRIMARY KEY,
       short_code VARCHAR(8) UNIQUE NOT NULL,
       target_url TEXT NOT NULL,
       total_clicks INTEGER DEFAULT 0,
       last_clicked_at TIMESTAMP,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

### Step 2: Deploy to Render

**Deploy API Server (index.js)**:

1. **Create Render Account**:
   - Go to [render.com](https://render.com)
   - Sign up for free
   - Connect your GitHub account

2. **Deploy API Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `tinylink-api`
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `node index.js`
   - Click "Create Web Service"

3. **Set Environment Variables** for API:
   ```
   PG_USER=your_neon_username
   PG_HOST=your_neon_host  
   PG_DATABASE=your_database_name
   PG_PASSWORD=your_neon_password
   PG_PORT=5432
   NODE_ENV=production
   ```

4. **Note the API URL**: Copy the URL of your deployed API (e.g., `https://tinylink-api.onrender.com`)

**Deploy Frontend Server (server.js)**:

1. **Create Another Web Service**:
   - Click "New +" → "Web Service"
   - Use the same repository
   - Configure:
     - **Name**: `tinylink-frontend`
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`

2. **Set Environment Variables** for Frontend:
   ```
   API_URL=https://your-api-service-url.onrender.com
   NODE_ENV=production
   ```

3. **Access Your App**: Your frontend will be available at `https://tinylink-frontend.onrender.com`

### Step 3: Alternative - Single Server Deployment

If you prefer a simpler deployment, you can modify the architecture:

1. **Create a combined server** that serves both API and frontend
2. **Deploy as a single service** to save resources
3. **Use internal communication** instead of HTTP calls

### Environment Variables Required

```bash
# Database (Required)
PG_USER=your_neon_username
PG_HOST=your_neon_host
PG_DATABASE=your_database_name
PG_PASSWORD=your_neon_password
PG_PORT=5432

# API Communication (Required for frontend)
API_URL=https://your-api-service-url.onrender.com

# System (Automatic)
NODE_ENV=production
PORT=10000  # Set automatically by Render
```

### Testing Your Deployment

1. **API Health Check**: `GET https://your-api-url.onrender.com/healthz`
2. **Frontend Health Check**: `GET https://your-frontend-url.onrender.com/healthz`  
3. **Test Full Flow**: Create a short link and verify redirect works

### Troubleshooting

**Common Issues**:
- **Database connection**: Verify Neon credentials and whitelist Render IPs
- **API communication**: Ensure API_URL is correctly set in frontend
- **Cold starts**: Free tier services sleep after 15 minutes of inactivity
- **Build failures**: Check Render build logs for dependency issues

**Render Free Tier Limitations**:
- Services sleep after 15 minutes of inactivity
- 750 hours/month free (shared across all services)
- Limited to 0.5 CPU and 512MB RAM per service

### Production Optimization

For better performance:
1. **Upgrade to paid tier** for always-on services
2. **Implement caching** for frequent database queries
3. **Add monitoring** with health checks and alerts
4. **Setup custom domain** for professional appearance

Contributing

Fork the repository

Create a feature branch

Commit your changes

Push and create a pull request

Author

Mohd Uzair Ansari

License

Licensed under the ISC License.

Future Enhancements

User login system

Expiring links

Analytics dashboard with charts

QR code generation

Bulk URL shortening

Rate limiting

Link tags and categories

Exportable analytics