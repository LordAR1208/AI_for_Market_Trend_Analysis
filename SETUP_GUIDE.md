# MarketFlow AI - Complete Setup Guide

## 🎯 Quick Start (5 Minutes)

### Step 1: Environment Setup
1. Copy environment template:
   ```bash
   cp .env.example .env
   ```

2. **Get Supabase Credentials**:
   - Go to [Supabase](https://supabase.com) and create a new project
   - Navigate to Settings → API
   - Copy your Project URL and anon key
   - Update `.env` file:
     ```env
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your_anon_key_here
     ```

### Step 2: Database Setup
1. **Open Supabase SQL Editor**
2. **Run Migration Files** (in order):
   ```sql
   -- Copy and paste each file content into SQL Editor
   -- 1. supabase/migrations/create_users_and_auth.sql
   -- 2. supabase/migrations/create_market_data_schema.sql  
   -- 3. supabase/migrations/create_alerts_and_predictions.sql
   -- 4. supabase/migrations/create_analytics_schema.sql
   ```

### Step 3: Authentication Setup
1. **Go to Authentication → Settings** in Supabase
2. **Configure**:
   - Site URL: `http://localhost:5173` (for development)
   - Redirect URLs: Add your domain
   - **Disable email confirmation** for development
   - Enable email provider

### Step 4: Start Application
```bash
npm run dev
```

🎉 **You're ready!** The app will run with mock data initially and switch to real data once Supabase is configured.

---

## 🔧 Detailed Configuration

### Database Schema Overview

The system creates these key tables:

1. **User Management**
   - `user_profiles` - User account information
   - `user_portfolios` - Portfolio management
   - `portfolio_holdings` - Asset holdings

2. **Market Data**
   - `market_symbols` - Available trading symbols
   - `market_data` - Real-time price data
   - `historical_data` - OHLCV historical data
   - `technical_indicators` - Calculated indicators

3. **AI & Analytics**
   - `ai_predictions` - ML-generated forecasts
   - `market_analysis` - Technical analysis results
   - `trading_signals` - Generated trading signals
   - `news_sentiment` - News sentiment analysis

4. **User Features**
   - `user_alerts` - Custom user alerts
   - Alert processing and notifications

### Real-Time Features Setup

1. **Enable Real-time** in Supabase:
   ```sql
   -- Run in SQL Editor
   ALTER PUBLICATION supabase_realtime ADD TABLE market_data;
   ALTER PUBLICATION supabase_realtime ADD TABLE user_alerts;
   ALTER PUBLICATION supabase_realtime ADD TABLE trading_signals;
   ```

2. **Edge Functions** (Optional):
   - The system includes Supabase Edge Functions for advanced processing
   - These handle market data processing and alert checking
   - They're automatically deployed when you set up Supabase

### External API Integration (Optional)

For real market data, add these to your `.env`:

```env
# Stock Market Data
VITE_ALPHA_VANTAGE_API_KEY=your_key_here

# Cryptocurrency Data  
VITE_FINNHUB_API_KEY=your_key_here

# News & Sentiment
VITE_NEWS_API_KEY=your_key_here
```

**API Providers:**
- [Alpha Vantage](https://www.alphavantage.co/) - Stock market data
- [Finnhub](https://finnhub.io/) - Crypto and stock data
- [NewsAPI](https://newsapi.org/) - Financial news

---

## 🧪 Testing Setup

### Run Tests
```bash
# Install test dependencies (already included)
npm test

# Run with UI
npm run test:ui

# Coverage report
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Individual component and service testing
- **Integration Tests**: API and database integration
- **Utility Tests**: Technical indicators and data processing

---

## 🚀 Production Deployment

### Option 1: Netlify (Recommended)

1. **Connect Repository**:
   - Link your GitHub repo to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

2. **Environment Variables**:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_production_anon_key
   ```

3. **Deploy**: Netlify will automatically build and deploy

### Option 2: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### Option 3: Docker

```dockerfile
# Dockerfile (create this file)
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## 🔍 Troubleshooting

### Common Issues

1. **"Supabase client error"**
   - Check your `.env` file has correct credentials
   - Verify Supabase project is active
   - Ensure database migrations are run

2. **"Authentication not working"**
   - Check Site URL in Supabase Auth settings
   - Verify email confirmation is disabled for development
   - Check redirect URLs are configured

3. **"No market data showing"**
   - The app starts with mock data by default
   - Real data requires Supabase setup and API keys
   - Check browser console for error messages

4. **"Charts not loading"**
   - Ensure all dependencies are installed
   - Check for JavaScript errors in browser console
   - Verify data format matches expected structure

### Debug Mode

Enable debug logging:
```env
VITE_DEBUG_MODE=true
```

### Performance Issues

1. **Slow loading**:
   - Check network tab for slow API calls
   - Verify database indexes are created
   - Consider enabling caching

2. **Memory usage**:
   - Monitor real-time subscriptions
   - Check for memory leaks in components
   - Optimize chart rendering

---

## 📈 Scaling Considerations

### Database Optimization
- **Indexes**: All critical queries have optimized indexes
- **Partitioning**: Consider partitioning large tables by date
- **Connection Pooling**: Configure for high-traffic scenarios

### Performance Monitoring
- **Metrics**: Built-in performance monitoring
- **Alerts**: Set up monitoring alerts for critical metrics
- **Logging**: Comprehensive error and performance logging

### Security Hardening
- **Rate Limiting**: API rate limiting implemented
- **Input Validation**: All inputs validated and sanitized
- **Access Control**: Row-level security on all tables
- **Audit Logging**: Track all user actions

---

## 🎓 Learning Resources

### Technical Documentation
- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Financial Technology
- [Technical Analysis Basics](https://www.investopedia.com/technical-analysis-4689657)
- [Market Data APIs](https://www.alphavantage.co/documentation/)
- [Financial Modeling](https://www.investopedia.com/financial-modeling-4689765)

### AI/ML in Finance
- [Time Series Forecasting](https://www.tensorflow.org/tutorials/structured_data/time_series)
- [Sentiment Analysis](https://huggingface.co/ProsusAI/finbert)
- [Pattern Recognition](https://www.quantstart.com/articles/pattern-recognition-in-financial-markets/)

---

## 🤝 Support & Community

### Getting Help
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Join community discussions
- **Documentation**: Comprehensive guides and API docs

### Contributing
- **Code Style**: Follow existing patterns and conventions
- **Testing**: Add tests for new features
- **Documentation**: Update docs for any changes

---

**Ready to analyze the markets with AI! 📊🤖**