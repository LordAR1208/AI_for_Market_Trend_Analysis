# MarketFlow AI - API Documentation

## Overview

This document provides comprehensive documentation for the MarketFlow AI backend API endpoints, database schema, and integration guidelines.

## Base URL

- **Development**: `http://localhost:3001/api/v1`
- **Production**: `https://api.marketflow.ai/v1`

## Authentication

All authenticated endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Authentication Endpoints

#### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "subscriptionTier": "free"
  },
  "token": "jwt_token_here"
}
```

#### POST /auth/signin
Authenticate existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "subscriptionTier": "free"
  },
  "token": "jwt_token_here"
}
```

#### POST /auth/signout
Sign out current user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Successfully signed out"
}
```

## Market Data Endpoints

#### GET /market/symbols
Get all available market symbols.

**Query Parameters:**
- `type` (optional): Filter by symbol type (stock, crypto, forex, commodity)
- `active` (optional): Filter by active status (true/false)

**Response:**
```json
{
  "symbols": [
    {
      "id": "uuid",
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "type": "stock",
      "exchange": "NASDAQ",
      "isActive": true
    }
  ]
}
```

#### GET /market/data/latest
Get latest market data for all symbols.

**Response:**
```json
{
  "data": [
    {
      "symbol": "AAPL",
      "price": 175.25,
      "change": 2.50,
      "changePercent": 1.45,
      "volume": 1234567,
      "marketCap": 2800000000000,
      "timestamp": "2024-01-01T10:00:00Z"
    }
  ]
}
```

#### GET /market/data/historical/:symbol
Get historical data for a specific symbol.

**Path Parameters:**
- `symbol`: The market symbol (e.g., AAPL, BTC)

**Query Parameters:**
- `days` (optional): Number of days of history (default: 30, max: 365)
- `interval` (optional): Data interval (1d, 1h, 5m) - default: 1d

**Response:**
```json
{
  "symbol": "AAPL",
  "data": [
    {
      "timestamp": "2024-01-01",
      "price": 175.25,
      "volume": 1234567,
      "ma20": 172.50,
      "ma50": 170.25,
      "rsi": 65.5,
      "macd": 1.25
    }
  ]
}
```

#### GET /market/indicators/:symbol
Get technical indicators for a symbol.

**Path Parameters:**
- `symbol`: The market symbol

**Response:**
```json
{
  "symbol": "AAPL",
  "indicators": {
    "rsi": 65.5,
    "macd": 1.25,
    "macdSignal": 0.95,
    "ma20": 172.50,
    "ma50": 170.25,
    "ma200": 165.00,
    "bollingerUpper": 180.00,
    "bollingerLower": 165.00
  },
  "timestamp": "2024-01-01T10:00:00Z"
}
```

## Analysis Endpoints

#### GET /analysis/technical/:symbol
Get technical analysis for a symbol.

**Path Parameters:**
- `symbol`: The market symbol

**Response:**
```json
{
  "symbol": "AAPL",
  "trend": "bullish",
  "strength": 75.5,
  "confidence": 0.85,
  "signals": [
    "Golden Cross detected",
    "RSI oversold bounce",
    "Volume breakout"
  ],
  "nextTarget": 185.00,
  "stopLoss": 165.00,
  "createdAt": "2024-01-01T10:00:00Z"
}
```

#### GET /analysis/predictions/:symbol
Get AI predictions for a symbol.

**Path Parameters:**
- `symbol`: The market symbol

**Query Parameters:**
- `days` (optional): Number of days to predict (default: 7, max: 30)

**Response:**
```json
{
  "symbol": "AAPL",
  "predictions": [
    {
      "timestamp": "2024-01-02",
      "predicted": 177.50,
      "confidence": 0.92,
      "actual": null
    }
  ],
  "modelVersion": "v2.1",
  "accuracy": 0.87
}
```

#### GET /analysis/signals/:symbol
Get trading signals for a symbol.

**Path Parameters:**
- `symbol`: The market symbol

**Response:**
```json
{
  "symbol": "AAPL",
  "signals": [
    {
      "id": "uuid",
      "type": "buy",
      "strength": 0.85,
      "confidence": 0.92,
      "entryPrice": 175.25,
      "targetPrice": 185.00,
      "stopLossPrice": 165.00,
      "reasoning": "Golden cross with high volume confirmation",
      "createdAt": "2024-01-01T10:00:00Z",
      "expiresAt": "2024-01-02T10:00:00Z"
    }
  ]
}
```

## Alert Endpoints

#### GET /alerts
Get user alerts.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `active` (optional): Filter by active status (true/false)
- `triggered` (optional): Filter by triggered status (true/false)

**Response:**
```json
{
  "alerts": [
    {
      "id": "uuid",
      "symbol": "AAPL",
      "type": "price",
      "severity": "medium",
      "message": "AAPL price rises above $180.00",
      "isTriggered": false,
      "isActive": true,
      "targetValue": 180.00,
      "currentValue": 175.25,
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

#### POST /alerts
Create a new alert.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "symbol": "AAPL",
  "alertType": "price",
  "conditionType": "above",
  "targetValue": 180.00,
  "severity": "medium"
}
```

**Response:**
```json
{
  "alert": {
    "id": "uuid",
    "symbol": "AAPL",
    "type": "price",
    "severity": "medium",
    "message": "AAPL price rises above $180.00",
    "targetValue": 180.00,
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

#### PUT /alerts/:id
Update an existing alert.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `id`: Alert ID

**Request Body:**
```json
{
  "targetValue": 185.00,
  "severity": "high"
}
```

#### DELETE /alerts/:id
Delete an alert.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `id`: Alert ID

## Portfolio Endpoints

#### GET /portfolio
Get user portfolios.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "portfolios": [
    {
      "id": "uuid",
      "name": "My Portfolio",
      "description": "Main investment portfolio",
      "isDefault": true,
      "totalValue": 50000.00,
      "holdings": [
        {
          "symbol": "AAPL",
          "quantity": 100,
          "averageCost": 150.00,
          "currentValue": 17525.00
        }
      ]
    }
  ]
}
```

#### POST /portfolio
Create a new portfolio.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Tech Portfolio",
  "description": "Technology stocks portfolio",
  "isDefault": false
}
```

#### POST /portfolio/:id/holdings
Add holding to portfolio.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `id`: Portfolio ID

**Request Body:**
```json
{
  "symbol": "AAPL",
  "quantity": 50,
  "averageCost": 175.25
}
```

## WebSocket Events

Connect to WebSocket at `ws://localhost:3002` for real-time updates.

### Events

#### market_data_update
Real-time market data updates.

```json
{
  "event": "market_data_update",
  "data": {
    "symbol": "AAPL",
    "price": 175.25,
    "change": 2.50,
    "changePercent": 1.45,
    "volume": 1234567,
    "timestamp": "2024-01-01T10:00:00Z"
  }
}
```

#### alert_triggered
Alert notification when conditions are met.

```json
{
  "event": "alert_triggered",
  "data": {
    "alertId": "uuid",
    "symbol": "AAPL",
    "message": "AAPL price rises above $180.00",
    "currentValue": 180.50,
    "triggeredAt": "2024-01-01T10:00:00Z"
  }
}
```

#### analysis_update
Updated technical analysis.

```json
{
  "event": "analysis_update",
  "data": {
    "symbol": "AAPL",
    "trend": "bullish",
    "strength": 75.5,
    "confidence": 0.85,
    "signals": ["Golden Cross detected"]
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "symbol",
      "issue": "Symbol not found"
    },
    "timestamp": "2024-01-01T10:00:00Z"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Invalid request parameters
- `AUTHENTICATION_REQUIRED`: Missing or invalid authentication
- `AUTHORIZATION_FAILED`: Insufficient permissions
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_SERVER_ERROR`: Server-side error
- `SERVICE_UNAVAILABLE`: External service unavailable

## Rate Limiting

API endpoints are rate limited to ensure fair usage:

- **Free Tier**: 100 requests per 15 minutes
- **Premium Tier**: 1000 requests per 15 minutes
- **Enterprise Tier**: 10000 requests per 15 minutes

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Data Models

### Market Symbol
```typescript
interface MarketSymbol {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'crypto' | 'forex' | 'commodity';
  exchange?: string;
  isActive: boolean;
  createdAt: string;
}
```

### Market Data
```typescript
interface MarketData {
  id: string;
  symbolId: string;
  price: number;
  volume: number;
  marketCap?: number;
  change24h: number;
  changePercent24h: number;
  timestamp: string;
}
```

### Technical Analysis
```typescript
interface TechnicalAnalysis {
  id: string;
  symbolId: string;
  trendDirection: 'bullish' | 'bearish' | 'neutral';
  strengthScore: number; // 0-1
  confidenceScore: number; // 0-1
  signals: string[];
  supportLevels: number[];
  resistanceLevels: number[];
  nextTarget?: number;
  stopLoss?: number;
  createdAt: string;
}
```

### User Alert
```typescript
interface UserAlert {
  id: string;
  userId: string;
  symbolId: string;
  alertType: 'price' | 'volume' | 'trend' | 'volatility';
  conditionType: 'above' | 'below' | 'crosses_above' | 'crosses_below';
  targetValue: number;
  currentValue?: number;
  isTriggered: boolean;
  isActive: boolean;
  severity: 'low' | 'medium' | 'high';
  message?: string;
  triggeredAt?: string;
  createdAt: string;
}
```

## Database Schema

### Tables Overview

1. **user_profiles** - User account information
2. **market_symbols** - Available trading symbols
3. **market_data** - Real-time market data
4. **historical_data** - Historical OHLCV data
5. **technical_indicators** - Calculated technical indicators
6. **user_alerts** - User-defined alerts
7. **ai_predictions** - AI-generated predictions
8. **user_portfolios** - User portfolio information
9. **portfolio_holdings** - Portfolio holdings details
10. **market_analysis** - Technical analysis results
11. **news_sentiment** - News sentiment analysis
12. **trading_signals** - Generated trading signals

### Relationships

```
user_profiles (1) ←→ (N) user_alerts
user_profiles (1) ←→ (N) user_portfolios
user_portfolios (1) ←→ (N) portfolio_holdings
market_symbols (1) ←→ (N) market_data
market_symbols (1) ←→ (N) historical_data
market_symbols (1) ←→ (N) technical_indicators
market_symbols (1) ←→ (N) user_alerts
market_symbols (1) ←→ (N) ai_predictions
market_symbols (1) ←→ (N) portfolio_holdings
```

## Integration Examples

### JavaScript/TypeScript Client

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'your_supabase_url',
  'your_supabase_anon_key'
);

// Get market data
const { data, error } = await supabase
  .from('market_data')
  .select(`
    *,
    market_symbols!inner(symbol, name)
  `)
  .order('timestamp', { ascending: false })
  .limit(10);

// Subscribe to real-time updates
const subscription = supabase
  .channel('market_updates')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'market_data'
  }, (payload) => {
    console.log('New market data:', payload.new);
  })
  .subscribe();
```

### Python Client

```python
import requests
from supabase import create_client, Client

# Initialize Supabase client
supabase: Client = create_client(
    "your_supabase_url",
    "your_supabase_anon_key"
)

# Fetch market data
response = supabase.table('market_data')\
    .select('*, market_symbols!inner(symbol, name)')\
    .order('timestamp', desc=True)\
    .limit(10)\
    .execute()

market_data = response.data
```

### cURL Examples

```bash
# Get latest market data
curl -X GET "https://api.marketflow.ai/v1/market/data/latest" \
  -H "Content-Type: application/json"

# Create alert (authenticated)
curl -X POST "https://api.marketflow.ai/v1/alerts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{
    "symbol": "AAPL",
    "alertType": "price",
    "conditionType": "above",
    "targetValue": 180.00
  }'

# Get historical data
curl -X GET "https://api.marketflow.ai/v1/market/data/historical/AAPL?days=30" \
  -H "Content-Type: application/json"
```

## Webhook Integration

### Alert Webhooks

Configure webhooks to receive alert notifications:

```json
{
  "url": "https://your-app.com/webhooks/alerts",
  "events": ["alert.triggered", "alert.created"],
  "secret": "your_webhook_secret"
}
```

**Webhook Payload:**
```json
{
  "event": "alert.triggered",
  "data": {
    "alertId": "uuid",
    "userId": "uuid",
    "symbol": "AAPL",
    "message": "AAPL price rises above $180.00",
    "currentValue": 180.50,
    "triggeredAt": "2024-01-01T10:00:00Z"
  },
  "timestamp": "2024-01-01T10:00:00Z",
  "signature": "sha256_signature"
}
```

## Performance Considerations

### Caching Strategy

- Market data: 5-second cache
- Historical data: 1-hour cache
- Technical analysis: 15-minute cache
- User data: 5-minute cache

### Pagination

Large datasets are paginated:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "total": 1000,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Bulk Operations

For bulk data operations, use batch endpoints:

```bash
POST /market/data/batch
POST /alerts/batch
POST /portfolio/holdings/batch
```

## Security

### API Key Management

- Rotate API keys regularly
- Use environment variables for sensitive data
- Implement proper CORS policies
- Use HTTPS in production

### Data Privacy

- User data is encrypted at rest
- PII is anonymized in logs
- GDPR compliance for EU users
- Data retention policies enforced

## Monitoring and Observability

### Health Check

```bash
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T10:00:00Z",
  "services": {
    "database": "healthy",
    "cache": "healthy",
    "external_apis": "healthy"
  },
  "version": "1.0.0"
}
```

### Metrics Endpoint

```bash
GET /metrics
```

Returns Prometheus-compatible metrics for monitoring.

## Support

For API support and questions:
- Documentation: https://docs.marketflow.ai
- Support Email: support@marketflow.ai
- Status Page: https://status.marketflow.ai</parameter>