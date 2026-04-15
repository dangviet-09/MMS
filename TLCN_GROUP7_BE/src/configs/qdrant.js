const { QdrantClient } = require('@qdrant/js-client-rest');

// Qdrant configuration
const QDRANT_CONFIG = {
    host: process.env.QDRANT_HOST || 'localhost',
    port: process.env.QDRANT_PORT || 6333,
    apiKey: process.env.QDRANT_API_KEY, // Optional for cloud
};

class QdrantConfig {
    constructor() {
        // Handle URL properly - remove http:// prefix if exists
        const host = QDRANT_CONFIG.host.replace(/^https?:\/\//, '');

        this.client = new QdrantClient({
            url: `http://${host}:${QDRANT_CONFIG.port}`,
            apiKey: QDRANT_CONFIG.apiKey,
            checkCompatibility: false // Skip version check
        });

        this.collections = {
            CAREER_PATHS: 'career_paths',
            LESSONS: 'lessons',
            TESTS: 'tests'
        };
    }

    async initializeCollections() {
        try {
            // Create collections if they don't exist
            for (const [key, collectionName] of Object.entries(this.collections)) {
                await this.createCollectionIfNotExists(collectionName);
            }

        } catch (error) {
            console.error('Error initializing Qdrant collections:', error);
            throw error;
        }
    }

    async createCollectionIfNotExists(collectionName) {
        try {
            // Check if collection exists
            const collections = await this.client.getCollections();
            const exists = collections.collections?.some(c => c.name === collectionName);

            if (!exists) {
                await this.client.createCollection(collectionName, {
                    vectors: {
                        size: 1024, // Cohere embed-multilingual-v3.0 vector size
                        distance: 'Cosine'
                    }
                });
            }
        } catch (error) {
            console.error(`Error creating collection ${collectionName}:`, error);
            throw error;
        }
    }

    async testConnection() {
        try {
            const host = QDRANT_CONFIG.host.replace(/^https?:\/\//, '');
            const url = `http://${host}:${QDRANT_CONFIG.port}`;
            // Try to get collections - simpler than cluster API
            const collections = await this.client.getCollections();
            return true;
        } catch (error) {
            console.error('Qdrant connection failed:', error.message);
            console.error('Make sure Qdrant server is running and accessible');
            return false;
        }
    }

    getClient() {
        return this.client;
    }
}

module.exports = new QdrantConfig();