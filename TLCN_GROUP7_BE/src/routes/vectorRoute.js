const express = require('express');
const router = express.Router();
const vectorService = require('../services/vectorService');
const qdrantConfig = require('../configs/qdrant');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const RoleMiddleware = require('../middlewares/RoleMiddleware');

// Only admin can access vector operations
router.use(AuthMiddleware.verifyToken);
router.use(RoleMiddleware.checkRole(['ADMIN']));

/**
 * Initialize full vector database indexing
 */
router.post('/init', async (req, res) => {
    try {
        await vectorService.initializeVectorDatabase();
        res.json({
            success: true,
            message: 'Vector database initialized successfully'
        });
    } catch (error) {
        console.error('Vector database initialization failed:', error);
        res.status(500).json({
            success: false,
            message: 'Vector database initialization failed',
            error: error.message
        });
    }
});

/**
 * Check vector database status
 */
router.get('/status', async (req, res) => {
    try {
        const isConnected = await qdrantConfig.testConnection();
        const isReady = await vectorService.isReady();
        
        let collections = [];
        if (isConnected) {
            try {
                const collectionsResponse = await qdrantConfig.getClient().getCollections();
                collections = collectionsResponse.collections || [];
            } catch (error) {
                console.error('Error getting collections:', error);
            }
        }
        
        res.json({
            connected: isConnected,
            ready: isReady,
            collections: collections.map(c => ({
                name: c.name,
                points_count: c.points_count || 0,
                status: c.status
            }))
        });
    } catch (error) {
        res.status(500).json({
            connected: false,
            ready: false,
            error: error.message
        });
    }
});

/**
 * Test vector search
 */
router.post('/search-test', async (req, res) => {
    try {
        const { query, limit = 5 } = req.body;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Query is required'
            });
        }
        
        const results = await vectorService.searchSimilarContent(query, limit, 0.5);
        
        res.json({
            success: true,
            query: query,
            results: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Search test failed',
            error: error.message
        });
    }
});

module.exports = router;