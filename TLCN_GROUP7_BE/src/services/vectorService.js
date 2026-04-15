const qdrantConfig = require('../configs/qdrant');
const aiService = require('./aiService');
const db = require('../models');

class VectorService {
    constructor() {
        this.qdrant = qdrantConfig.getClient();
        this.collections = qdrantConfig.collections;
    }

    async initializeVectorDatabase() {
        try {

            // Initialize Qdrant collections
            await qdrantConfig.initializeCollections();

            // Create embeddings for existing data
            await this.indexCareerPaths();
            await this.indexLessons();
            await this.indexTests();

        } catch (error) {
            console.error('Error initializing vector database:', error);
            throw error;
        }
    }

    async isReady() {
        try {
            const collections = await this.qdrant.getCollections();
            const requiredCollections = Object.values(this.collections);

            for (const collectionName of requiredCollections) {
                const exists = collections.collections?.some(c => c.name === collectionName);
                if (!exists) return false;
            }

            return true;
        } catch (error) {
            console.error('Error checking vector database readiness:', error);
            return false;
        }
    }

    async indexCareerPaths() {
        try {

            const careerPaths = await db.CareerPath.findAll({
                include: [
                    {
                        model: db.Company,
                        as: 'company',
                        attributes: ['companyName']
                    }
                ]
            });

            const points = [];

            for (const careerPath of careerPaths) {
                // Create searchable text
                const searchText = this.buildCareerPathSearchText(careerPath);

                // Generate embedding
                const embedding = await aiService.getEmbedding(searchText);

                points.push({
                    id: careerPath.id,
                    vector: embedding,
                    payload: {
                        id: careerPath.id,
                        title: careerPath.title,
                        description: careerPath.description,
                        companyName: careerPath.company?.companyName,
                        status: careerPath.status,
                        type: 'career_path',
                        searchText: searchText
                    }
                });
            }

            // Upsert to Qdrant
            if (points.length > 0) {
                await this.qdrant.upsert(this.collections.CAREER_PATHS, {
                    wait: true,
                    points: points
                });
            }
        } catch (error) {
            console.error('Error indexing career paths:', error);
            throw error;
        }
    }

    async indexLessons() {
        try {
            const lessons = await db.Lesson.findAll({
                include: [
                    {
                        model: db.CareerPath,
                        as: 'careerPath',
                        attributes: ['title', 'description']
                    }
                ]
            });

            const points = [];

            for (const lesson of lessons) {
                // Create searchable text
                const searchText = this.buildLessonSearchText(lesson);

                // Generate embedding
                const embedding = await aiService.getEmbedding(searchText);

                points.push({
                    id: lesson.id,
                    vector: embedding,
                    payload: {
                        id: lesson.id,
                        title: lesson.title,
                        content: lesson.content,
                        careerPathTitle: lesson.careerPath?.title,
                        careerPathId: lesson.careerPathId,
                        type: 'lesson',
                        searchText: searchText
                    }
                });
            }

            // Upsert to Qdrant
            if (points.length > 0) {
                await this.qdrant.upsert(this.collections.LESSONS, {
                    wait: true,
                    points: points
                });
            }

        } catch (error) {
            console.error('Error indexing lessons:', error);
            throw error;
        }
    }

    async indexTests() {
        try {
            const tests = await db.Test.findAll({
                include: [
                    {
                        model: db.Lesson,
                        as: 'lesson',
                        attributes: ['title'],
                        include: [
                            {
                                model: db.CareerPath,
                                as: 'careerPath',
                                attributes: ['title']
                            }
                        ]
                    }
                ]
            });

            const points = [];

            for (const test of tests) {
                // Create searchable text
                const searchText = this.buildTestSearchText(test);

                // Generate embedding
                const embedding = await aiService.getEmbedding(searchText);

                points.push({
                    id: test.id,
                    vector: embedding,
                    payload: {
                        id: test.id,
                        title: test.title,
                        description: test.description,
                        type: test.type,
                        lessonTitle: test.lesson?.title,
                        careerPathTitle: test.lesson?.careerPath?.title,
                        lessonId: test.lessonId,
                        maxScore: test.maxScore,
                        searchText: searchText,
                        type: 'test'
                    }
                });
            }

            // Upsert to Qdrant
            if (points.length > 0) {
                await this.qdrant.upsert(this.collections.TESTS, {
                    wait: true,
                    points: points
                });
            }
        } catch (error) {
            console.error('Error indexing tests:', error);
            throw error;
        }
    }

    async searchSimilarContent(query, limit = 10, threshold = 0.7) {
        try {
            // Generate query embedding
            const queryEmbedding = await aiService.getEmbedding(query);

            // Search across all collections
            const [careerPathResults, lessonResults, testResults] = await Promise.all([
                this.searchInCollection(this.collections.CAREER_PATHS, queryEmbedding, limit),
                this.searchInCollection(this.collections.LESSONS, queryEmbedding, limit),
                this.searchInCollection(this.collections.TESTS, queryEmbedding, limit)
            ]);

            // Combine and sort by score
            const allResults = [
                ...careerPathResults.map(r => ({ ...r, collection: 'career_paths' })),
                ...lessonResults.map(r => ({ ...r, collection: 'lessons' })),
                ...testResults.map(r => ({ ...r, collection: 'tests' }))
            ];

            // Filter by threshold and sort by score
            return allResults
                .filter(r => r.score >= threshold)
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);

        } catch (error) {
            console.error('Error searching similar content:', error);
            throw error;
        }
    }

    async searchInCollection(collectionName, queryEmbedding, limit) {
        try {
            const searchResult = await this.qdrant.search(collectionName, {
                vector: queryEmbedding,
                limit: limit,
                with_payload: true
            });

            return searchResult.map(point => ({
                id: point.id,
                score: point.score,
                payload: point.payload
            }));

        } catch (error) {
            console.error(`Error searching in collection ${collectionName}:`, error);
            return [];
        }
    }

    async addCareerPath(careerPath) {
        try {
            const searchText = this.buildCareerPathSearchText(careerPath);
            const embedding = await aiService.getEmbedding(searchText);

            await this.qdrant.upsert(this.collections.CAREER_PATHS, {
                wait: true,
                points: [{
                    id: careerPath.id,
                    vector: embedding,
                    payload: {
                        id: careerPath.id,
                        title: careerPath.title,
                        description: careerPath.description,
                        companyName: careerPath.company?.companyName,
                        status: careerPath.status,
                        type: 'career_path',
                        searchText: searchText
                    }
                }]
            });

        } catch (error) {
            console.error('Error adding career path to vector database:', error);
            throw error;
        }
    }

    async addLesson(lesson) {
        try {
            const searchText = this.buildLessonSearchText(lesson);
            const embedding = await aiService.getEmbedding(searchText);

            await this.qdrant.upsert(this.collections.LESSONS, {
                wait: true,
                points: [{
                    id: lesson.id,
                    vector: embedding,
                    payload: {
                        id: lesson.id,
                        title: lesson.title,
                        content: lesson.content,
                        careerPathTitle: lesson.careerPath?.title,
                        careerPathId: lesson.careerPathId,
                        type: 'lesson',
                        searchText: searchText
                    }
                }]
            });

        } catch (error) {
            console.error('Error adding lesson to vector database:', error);
            throw error;
        }
    }

    async addTest(test) {
        try {
            const searchText = this.buildTestSearchText(test);
            const embedding = await aiService.getEmbedding(searchText);

            await this.qdrant.upsert(this.collections.TESTS, {
                wait: true,
                points: [{
                    id: test.id,
                    vector: embedding,
                    payload: {
                        id: test.id,
                        title: test.title,
                        description: test.description,
                        type: test.type,
                        lessonTitle: test.lesson?.title,
                        careerPathTitle: test.lesson?.careerPath?.title,
                        lessonId: test.lessonId,
                        maxScore: test.maxScore,
                        searchText: searchText,
                        type: 'test'
                    }
                }]
            });
        } catch (error) {
            console.error('Error adding test to vector database:', error);
            throw error;
        }
    }

    async deleteFromVector(collectionName, id) {
        try {
            await this.qdrant.delete(collectionName, {
                points: [id]
            });
        } catch (error) {
            console.error(`Error deleting ${id} from ${collectionName}:`, error);
        }
    }

    // Helper methods to build searchable text
    buildCareerPathSearchText(careerPath) {
        return `${careerPath.title} ${careerPath.description || ''} ${careerPath.company?.companyName || ''}`.trim();
    }

    buildLessonSearchText(lesson) {
        const content = lesson.content ? lesson.content.substring(0, 500) : '';
        return `${lesson.title} ${content} ${lesson.careerPath?.title || ''}`.trim();
    }

    buildTestSearchText(test) {
        return `${test.title} ${test.description || ''} ${test.lesson?.title || ''} ${test.lesson?.careerPath?.title || ''}`.trim();
    }
}

module.exports = new VectorService();