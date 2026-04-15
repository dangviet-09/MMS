const vectorService = require('../src/services/vectorService');
const qdrantConfig = require('../src/configs/qdrant');

async function initializeVectorDB() {
    try {
        const isConnected = await qdrantConfig.testConnection();

        if (!isConnected) {
            console.error('Qdrant connection failed. Make sure Qdrant server is running.');
            process.exit(1);
        }

        // Initialize collections and embeddings
        await vectorService.initializeVectorDatabase();
        process.exit(0);
    } catch (error) {
        console.error('❌ Vector database initialization failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the initialization
if (require.main === module) {
    initializeVectorDB();
}

module.exports = { initializeVectorDB };