# MarketFlow AI - Market Trend Analysis System

A comprehensive, production-ready AI-powered market trend analysis platform built with React, TypeScript, and Supabase.

## 🚀 Features

### Core Functionality
- **Real-time Market Data**: Live price feeds with 2-second updates
- **AI-Powered Predictions**: Machine learning models for price forecasting
- **Technical Analysis**: Advanced indicators (RSI, MACD, Bollinger Bands)
- **Smart Alerts**: Customizable notifications for price movements
- **Portfolio Tracking**: Multi-asset portfolio management
- **Interactive Charts**: Professional-grade financial visualizations

### Advanced Features
- **Sentiment Analysis**: News and social media sentiment integration
- **Pattern Recognition**: Automated chart pattern detection
- **Risk Assessment**: AI-driven risk scoring and recommendations
- **Multi-Asset Support**: Stocks, crypto, forex, and commodities
- **Real-time Collaboration**: Shared watchlists and analysis

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for responsive design
- **Framer Motion** for smooth animations
- **Recharts** for financial data visualization
- **Lucide React** for consistent iconography

### Backend Stack
- **Supabase** for database and authentication
- **PostgreSQL** with Row Level Security
- **Edge Functions** for serverless processing
- **Real-time Subscriptions** for live updates

### AI/ML Components
- **Technical Indicators Engine** for market analysis
- **Predictive Models** for price forecasting
- **Pattern Recognition** algorithms
- **Sentiment Analysis** pipeline

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Git

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd market-trend-analysis
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Database Setup**
   - Create a new Supabase project
   - Run the migration files in order:
     ```sql
     -- Execute in Supabase SQL Editor
     -- 1. supabase/migrations/create_users_and_auth.sql
     -- 2. supabase/migrations/create_market_data_schema.sql
     -- 3. supabase/migrations/create_alerts_and_predictions.sql
     -- 4. supabase/migrations/create_analytics_schema.sql
     ```

4. **Start Development**
   ```bash
   npm run dev
   ```

### Supabase Configuration

1. **Create Project**: Go to [Supabase](https://supabase.com) and create a new project
2. **Get Credentials**: Copy your project URL and anon key from Settings → API
3. **Configure Authentication**:
   - Go to Authentication → Settings
   - Set Site URL to your domain
   - Disable email confirmation for development
4. **Run Migrations**: Execute the SQL files in the Supabase SQL Editor

## 📊 Usage

### Basic Usage
1. **Market Overview**: View real-time prices for major assets
2. **Chart Analysis**: Select any symbol to view detailed charts
3. **AI Predictions**: Get 7-day price forecasts with confidence scores
4. **Set Alerts**: Create custom price and volume alerts
5. **Technical Analysis**: View AI-generated trading signals

### Advanced Features
1. **Authentication**: Sign up/in to access personalized features
2. **Portfolio Management**: Track your investments and performance
3. **Custom Alerts**: Set complex multi-condition alerts
4. **Historical Analysis**: Access extended historical data
5. **Export Data**: Download analysis reports and charts

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check
```

## 🚀 Deployment

### Netlify (Recommended)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy!

### Manual Deployment
```bash
# Build for production
npm run build

# Preview build locally
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── TrendChart.tsx   # Chart component
│   ├── AlertsPanel.tsx  # Alerts management
│   └── ...
├── services/           # Business logic
│   ├── authService.ts  # Authentication
│   ├── marketDataService.ts # Market data
│   └── ...
├── utils/              # Utility functions
│   ├── technicalIndicators.ts
│   ├── dataProcessor.ts
│   └── ...
├── hooks/              # Custom React hooks
├── types/              # TypeScript definitions
└── tests/              # Test files

supabase/
├── migrations/         # Database migrations
└── functions/          # Edge functions
```

## 🔧 Configuration

### Environment Variables
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_ALPHA_VANTAGE_API_KEY`: For real market data (optional)
- `VITE_FINNHUB_API_KEY`: For crypto data (optional)

### Database Configuration
The system uses PostgreSQL with the following key tables:
- `user_profiles`: User account information
- `market_symbols`: Available trading symbols
- `market_data`: Real-time market data
- `user_alerts`: User-defined alerts
- `ai_predictions`: AI-generated predictions

## 📈 Performance

### Optimization Features
- **Code Splitting**: Lazy loading for optimal performance
- **Caching**: Intelligent data caching strategies
- **Real-time Updates**: Efficient WebSocket connections
- **Database Indexing**: Optimized queries for fast data retrieval

### Monitoring
- **Error Tracking**: Comprehensive error handling and logging
- **Performance Metrics**: Built-in performance monitoring
- **Health Checks**: System health monitoring endpoints

## 🔒 Security

### Security Features
- **Row Level Security**: Database-level access control
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive data validation
- **Rate Limiting**: API abuse prevention
- **CORS Configuration**: Secure cross-origin requests

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/signup` - Create new user account
- `POST /auth/signin` - Authenticate user
- `POST /auth/signout` - Sign out user

### Market Data Endpoints
- `GET /market/symbols` - Get available symbols
- `GET /market/data/latest` - Get latest market data
- `GET /market/data/historical/:symbol` - Get historical data

### Analysis Endpoints
- `GET /analysis/technical/:symbol` - Get technical analysis
- `GET /analysis/predictions/:symbol` - Get AI predictions
- `GET /analysis/signals/:symbol` - Get trading signals

See `API_DOCUMENTATION.md` for complete API reference.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the `docs/` folder for detailed guides
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join our community discussions

## 🎯 Roadmap

### Phase 1 (Current)
- [x] Real-time market data integration
- [x] AI-powered predictions
- [x] Technical analysis engine
- [x] User authentication
- [x] Alert system

### Phase 2 (Next)
- [ ] Advanced portfolio analytics
- [ ] Social trading features
- [ ] Mobile application
- [ ] Advanced ML models
- [ ] Institutional features

### Phase 3 (Future)
- [ ] Algorithmic trading integration
- [ ] Advanced risk management
- [ ] Regulatory compliance tools
- [ ] Enterprise features
- [ ] API marketplace

---

**Built with ❤️ for the financial technology community**