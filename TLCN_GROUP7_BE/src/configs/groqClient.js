const axios = require('axios');

const groqClient = axios.create({
  baseURL: 'https://api.groq.com/openai/v1',
  headers: {
    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 60000 // 60 seconds
});

// Add retry interceptor for rate limiting
groqClient.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config;

    // Retry on 429 (rate limit) or 5xx errors
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }

    const shouldRetry =
      (error.response?.status === 429 || error.response?.status >= 500) &&
      config.__retryCount < 3;

    if (shouldRetry) {
      config.__retryCount += 1;
      // Exponential backoff: 2s, 4s, 8s
      const delay = Math.pow(2, config.__retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return groqClient(config);
    }

    return Promise.reject(error);
  }
);

module.exports = groqClient;
