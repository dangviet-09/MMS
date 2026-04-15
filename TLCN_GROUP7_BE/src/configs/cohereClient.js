const { CohereClient } = require('cohere-ai');

// Initialize Cohere client for embeddings
const cohereClient = new CohereClient({
  token: process.env.COHERE_API_KEY
});

module.exports = cohereClient;
