# MarketFlow AI - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the MarketFlow AI Market Trend Analysis system to production environments.

## Prerequisites

### Required Services

1. **Supabase Project**
   - Database with PostgreSQL
   - Authentication enabled
   - Row Level Security configured
   - Real-time subscriptions enabled

2. **External API Keys** (Optional for enhanced features)
   - Alpha Vantage API key for stock data
   - Finnhub API key for crypto data
   - News API key for sentiment analysis

3. **Hosting Platform**
   - Netlify (recommended for frontend)
   - Vercel (alternative)
   - AWS S3 + CloudFront (enterprise)

## Environment Setup

### 1. Supabase Configuration

1. Create a new Supabase project at https://supabase.com
2. Go to Settings → API to get your project URL and keys
3. Navigate to SQL Editor and run the migration files:
   - `supabase/migrations/create_users_and_auth.sql`
   - `supabase/migrations/create_market_data_schema.sql`
   - `supabase/migrations/create_alerts_and_predictions.sql`

### 2. Environment Variables

Create a `.env` file with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# External API Keys (Optional)
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
VITE_FINNHUB_API_KEY=your_finnhub_key
VITE_NEWS_API_KEY=your_news_api_key

# Application Configuration
VITE_APP_NAME=MarketFlow AI
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=https://your-domain.com/api

# Security
JWT_SECRET=your_super_secure_jwt_secret_here
```

### 3. Database Setup

#### Enable Required Extensions

In your Supabase SQL Editor, run:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enable real-time for tables
ALTER PUBLICATION supabase_realtime ADD TABLE market_data;
ALTER PUBLICATION supabase_realtime ADD TABLE user_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE trading_signals;
```

#### Configure Authentication

1. Go to Authentication → Settings in Supabase
2. Configure the following settings:
   - **Site URL**: Your production domain
   - **Redirect URLs**: Add your production domain
   - **Email confirmation**: Disabled (for demo purposes)
   - **Email templates**: Customize as needed

## Deployment Steps

### Option 1: Netlify Deployment (Recommended)

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard

3. **Configure Environment Variables in Netlify**
   - Go to Site Settings → Environment Variables
   - Add all required environment variables
   - Ensure `VITE_` prefix for client-side variables

### Option 2: Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   # Add other variables...
   ```

### Option 3: AWS S3 + CloudFront

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://your-bucket-name
   aws s3 website s3://your-bucket-name --index-document index.html
   ```

3. **Upload Files**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

4. **Configure CloudFront**
   - Create CloudFront distribution
   - Set S3 bucket as origin
   - Configure custom error pages for SPA routing

## Post-Deployment Configuration

### 1. Supabase Edge Functions

Deploy the edge functions for real-time processing:

```bash
# If you have Supabase CLI installed locally
supabase functions deploy market-data-processor
supabase functions deploy alert-processor
```

### 2. Set up Monitoring

#### Application Monitoring

1. **Error Tracking**
   - Integrate Sentry for error tracking
   - Configure error boundaries
   - Set up alert notifications

2. **Performance Monitoring**
   - Use Web Vitals for frontend performance
   - Monitor API response times
   - Track user engagement metrics

#### Infrastructure Monitoring

1. **Supabase Monitoring**
   - Monitor database performance
   - Track API usage
   - Set up billing alerts

2. **CDN Monitoring**
   - Monitor cache hit rates
   - Track global performance
   - Set up uptime monitoring

### 3. Security Configuration

#### Content Security Policy

Add CSP headers to your hosting platform:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;
```

#### HTTPS Configuration

Ensure HTTPS is enabled:
- Netlify: Automatic HTTPS with Let's Encrypt
- Vercel: Automatic HTTPS
- AWS: Configure SSL certificate in CloudFront

### 4. Performance Optimization

#### Frontend Optimization

1. **Code Splitting**
   ```typescript
   // Implement lazy loading for components
   const Dashboard = lazy(() => import('./components/Dashboard'));
   const TrendChart = lazy(() => import('./components/TrendChart'));
   ```

2. **Asset Optimization**
   ```bash
   # Optimize images
   npm install --save-dev imagemin imagemin-webp
   
   # Enable gzip compression
   # Configure in your hosting platform
   ```

3. **Caching Strategy**
   ```typescript
   // Service worker for caching
   // Configure cache headers
   ```

#### Database Optimization

1. **Indexes**
   ```sql
   -- Add performance indexes
   CREATE INDEX CONCURRENTLY idx_market_data_symbol_time 
   ON market_data(symbol_id, timestamp DESC);
   
   CREATE INDEX CONCURRENTLY idx_historical_data_symbol_date 
   ON historical_data(symbol_id, date DESC);
   ```

2. **Connection Pooling**
   - Configure connection pooling in Supabase
   - Set appropriate pool sizes

## Scaling Considerations

### Horizontal Scaling

1. **CDN Configuration**
   - Use global CDN for static assets
   - Configure edge caching rules
   - Implement geographic routing

2. **Database Scaling**
   - Enable read replicas for heavy read workloads
   - Implement database sharding for large datasets
   - Use connection pooling

### Vertical Scaling

1. **Supabase Scaling**
   - Upgrade to higher tier plans as needed
   - Monitor resource usage
   - Configure auto-scaling if available

2. **Edge Function Scaling**
   - Monitor function execution times
   - Optimize function code
   - Implement proper error handling

## Backup and Recovery

### Database Backups

1. **Automated Backups**
   - Supabase provides automatic daily backups
   - Configure backup retention period
   - Test backup restoration process

2. **Manual Backups**
   ```bash
   # Export specific tables
   pg_dump --host=your-host --port=5432 --username=postgres \
           --table=market_data --data-only your_database > backup.sql
   ```

### Disaster Recovery

1. **Recovery Plan**
   - Document recovery procedures
   - Test recovery process regularly
   - Maintain offsite backups

2. **Monitoring**
   - Set up uptime monitoring
   - Configure alert notifications
   - Monitor key metrics

## Maintenance

### Regular Tasks

1. **Database Maintenance**
   ```sql
   -- Clean old data (run weekly)
   DELETE FROM market_data 
   WHERE timestamp < NOW() - INTERVAL '90 days';
   
   -- Update statistics
   ANALYZE;
   ```

2. **Log Rotation**
   - Configure log retention policies
   - Archive old logs
   - Monitor log storage usage

3. **Security Updates**
   - Update dependencies regularly
   - Monitor security advisories
   - Rotate API keys periodically

### Performance Monitoring

1. **Key Metrics to Monitor**
   - Response times (< 200ms for 95th percentile)
   - Error rates (< 1%)
   - Database query performance
   - Memory and CPU usage

2. **Alerting Thresholds**
   - Response time > 500ms
   - Error rate > 5%
   - Database connections > 80%
   - Disk usage > 85%

## Troubleshooting

### Common Issues

1. **CORS Errors**
   ```typescript
   // Ensure proper CORS configuration in Supabase
   // Add your domain to allowed origins
   ```

2. **Authentication Issues**
   ```typescript
   // Check JWT token expiration
   // Verify Supabase configuration
   // Ensure proper redirect URLs
   ```

3. **Performance Issues**
   ```sql
   -- Check slow queries
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   ```

### Debug Mode

Enable debug mode for troubleshooting:

```bash
# Set environment variable
VITE_DEBUG_MODE=true

# Or add to URL
https://your-app.com?debug=true
```

## Support and Resources

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

### Community
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/your-repo/issues)

### Professional Support
- Enterprise support available
- Custom deployment assistance
- Performance optimization consulting

## Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Authentication configured
- [ ] API keys obtained and configured
- [ ] Build process tested
- [ ] Tests passing

### Post-Deployment
- [ ] Application accessible
- [ ] Authentication working
- [ ] Real-time updates functioning
- [ ] Database connections stable
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Security headers configured
- [ ] Performance optimized

### Production Readiness
- [ ] Error tracking configured
- [ ] Logging implemented
- [ ] Monitoring dashboards set up
- [ ] Alert notifications configured
- [ ] Documentation updated
- [ ] Team training completed</parameter>