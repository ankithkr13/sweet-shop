# Deployment Guide

## Frontend Deployment (Vercel)

1. **Connect your repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js

2. **Configure environment variables**
   \`\`\`
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com
   \`\`\`

3. **Deploy**
   - Vercel will automatically build and deploy your frontend

## Backend Deployment Options

### Option 1: Railway

1. **Connect to Railway**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select the backend folder

2. **Configure environment variables**
   \`\`\`
   DATABASE_URL=your_postgresql_connection_string
   SECRET_KEY=your-production-jwt-secret
   \`\`\`

3. **Add Procfile**
   \`\`\`
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   \`\`\`

### Option 2: Heroku

1. **Create Heroku app**
   \`\`\`bash
   heroku create your-sweet-shop-api
   \`\`\`

2. **Add PostgreSQL addon**
   \`\`\`bash
   heroku addons:create heroku-postgresql:hobby-dev
   \`\`\`

3. **Configure environment variables**
   \`\`\`bash
   heroku config:set SECRET_KEY=your-production-jwt-secret
   \`\`\`

4. **Deploy**
   \`\`\`bash
   git subtree push --prefix backend heroku main
   \`\`\`

### Option 3: DigitalOcean App Platform

1. **Create new app**
   - Go to DigitalOcean App Platform
   - Connect your repository
   - Select backend folder

2. **Configure build settings**
   - Build command: `pip install -r requirements.txt`
   - Run command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Add database**
   - Create managed PostgreSQL database
   - Add connection string to environment variables

## Database Setup

### Production Database Migration

1. **Run table creation script**
   \`\`\`sql
   -- Connect to your production database and run:
   \i scripts/01_create_tables.sql
   \`\`\`

2. **Seed initial data**
   \`\`\`sql
   \i scripts/02_seed_data.sql
   \`\`\`

3. **Update admin credentials**
   \`\`\`sql
   -- Change default admin password
   UPDATE users 
   SET password_hash = '$2b$12$your_new_hashed_password' 
   WHERE email = 'admin@sweetshop.com';
   \`\`\`

## Security Checklist

- [ ] Change default admin credentials
- [ ] Use strong JWT secret key
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Monitor API rate limits
- [ ] Enable logging and monitoring

## Performance Optimization

- [ ] Enable Next.js image optimization
- [ ] Configure CDN for static assets
- [ ] Set up database connection pooling
- [ ] Enable API response caching
- [ ] Optimize database queries with indexes
- [ ] Monitor application performance
