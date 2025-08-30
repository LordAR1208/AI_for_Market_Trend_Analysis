/**
 * API Client for external market data sources
 * Handles rate limiting, error handling, and data normalization
 */

export interface ExternalMarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  timestamp: string;
}

export interface NewsItem {
  headline: string;
  content: string;
  source: string;
  publishedAt: string;
  sentiment?: number;
  relevance?: number;
}

class APIClient {
  private readonly baseUrls = {
    alphaVantage: 'https://www.alphavantage.co/query',
    finnhub: 'https://finnhub.io/api/v1',
    newsApi: 'https://newsapi.org/v2'
  };

  private readonly apiKeys = {
    alphaVantage: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY,
    finnhub: import.meta.env.VITE_FINNHUB_API_KEY,
    newsApi: import.meta.env.VITE_NEWS_API_KEY
  };

  private rateLimiters = new Map<string, { lastCall: number; callCount: number }>();

  /**
   * Fetch real-time market data from Alpha Vantage
   */
  async fetchMarketData(symbols: string[]): Promise<ExternalMarketData[]> {
    const results: ExternalMarketData[] = [];

    for (const symbol of symbols) {
      try {
        await this.checkRateLimit('alphaVantage');
        
        const response = await fetch(
          `${this.baseUrls.alphaVantage}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKeys.alphaVantage}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const quote = data['Global Quote'];

        if (quote) {
          results.push({
            symbol,
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
            volume: parseInt(quote['06. volume']),
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        // Continue with other symbols
      }
    }

    return results;
  }

  /**
   * Fetch historical data from Alpha Vantage
   */
  async fetchHistoricalData(symbol: string, interval: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<any[]> {
    try {
      await this.checkRateLimit('alphaVantage');
      
      const functionName = interval === 'daily' ? 'TIME_SERIES_DAILY' : 
                          interval === 'weekly' ? 'TIME_SERIES_WEEKLY' : 'TIME_SERIES_MONTHLY';
      
      const response = await fetch(
        `${this.baseUrls.alphaVantage}?function=${functionName}&symbol=${symbol}&apikey=${this.apiKeys.alphaVantage}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const timeSeriesKey = Object.keys(data).find(key => key.includes('Time Series'));
      
      if (!timeSeriesKey) {
        throw new Error('No time series data found');
      }

      const timeSeries = data[timeSeriesKey];
      return Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'])
      }));
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Fetch cryptocurrency data from Finnhub
   */
  async fetchCryptoData(symbols: string[]): Promise<ExternalMarketData[]> {
    const results: ExternalMarketData[] = [];

    for (const symbol of symbols) {
      try {
        await this.checkRateLimit('finnhub');
        
        const response = await fetch(
          `${this.baseUrls.finnhub}/crypto/candle?symbol=BINANCE:${symbol}USDT&resolution=1&from=${Math.floor(Date.now() / 1000) - 86400}&to=${Math.floor(Date.now() / 1000)}`,
          {
            headers: {
              'X-Finnhub-Token': this.apiKeys.finnhub
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.c && data.c.length > 0) {
          const latestPrice = data.c[data.c.length - 1];
          const previousPrice = data.c[data.c.length - 2] || latestPrice;
          const change = latestPrice - previousPrice;
          const changePercent = (change / previousPrice) * 100;

          results.push({
            symbol,
            price: latestPrice,
            change,
            changePercent,
            volume: data.v ? data.v[data.v.length - 1] : 0,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error(`Error fetching crypto data for ${symbol}:`, error);
      }
    }

    return results;
  }

  /**
   * Fetch news data for sentiment analysis
   */
  async fetchNews(query: string, pageSize: number = 20): Promise<NewsItem[]> {
    try {
      await this.checkRateLimit('newsApi');
      
      const response = await fetch(
        `${this.baseUrls.newsApi}/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=${pageSize}&apiKey=${this.apiKeys.newsApi}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return data.articles.map((article: any) => ({
        headline: article.title,
        content: article.description || article.content,
        source: article.source.name,
        publishedAt: article.publishedAt
      }));
    } catch (error) {
      console.error(`Error fetching news for ${query}:`, error);
      return [];
    }
  }

  /**
   * Rate limiting to respect API limits
   */
  private async checkRateLimit(apiName: string): Promise<void> {
    const now = Date.now();
    const limiter = this.rateLimiters.get(apiName) || { lastCall: 0, callCount: 0 };
    
    // Reset call count every minute
    if (now - limiter.lastCall > 60000) {
      limiter.callCount = 0;
    }
    
    // Check rate limits (adjust based on API provider limits)
    const limits = {
      alphaVantage: 5, // 5 calls per minute for free tier
      finnhub: 60,     // 60 calls per minute
      newsApi: 100     // 100 calls per minute
    };
    
    if (limiter.callCount >= limits[apiName as keyof typeof limits]) {
      const waitTime = 60000 - (now - limiter.lastCall);
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      limiter.callCount = 0;
    }
    
    limiter.callCount++;
    limiter.lastCall = now;
    this.rateLimiters.set(apiName, limiter);
  }

  /**
   * Batch fetch data for multiple symbols
   */
  async batchFetchMarketData(symbols: string[]): Promise<ExternalMarketData[]> {
    const stockSymbols = symbols.filter(s => !['BTC', 'ETH', 'ADA', 'DOT'].includes(s));
    const cryptoSymbols = symbols.filter(s => ['BTC', 'ETH', 'ADA', 'DOT'].includes(s));

    const [stockData, cryptoData] = await Promise.allSettled([
      this.fetchMarketData(stockSymbols),
      this.fetchCryptoData(cryptoSymbols)
    ]);

    const results: ExternalMarketData[] = [];
    
    if (stockData.status === 'fulfilled') {
      results.push(...stockData.value);
    }
    
    if (cryptoData.status === 'fulfilled') {
      results.push(...cryptoData.value);
    }

    return results;
  }
}

export const apiClient = new APIClient();</parameter>