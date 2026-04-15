require("dotenv").config();
const express = require("express");
const route = require("./src/routes/index");
const connectDB = require("./src/utils/connectDB");
const cors = require('cors');
const http = require('http');
const socketSetup = require('./src/sockets');
const passport = require('./src/configs/passport.js');
const kafkaModule = require("./src/kafka");
const qdrantConfig = require('./src/configs/qdrant');

const app = express();
const server = http.createServer(app);

// Init Socket.IO và attach vào app
const io = socketSetup(server);
app.set('io', io);
global.io = io; // Also set globally for services to access

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

// Init routes
route(app);

// Kết nối DB và start server
connectDB().then(async () => {
  // Initialize Kafka (only in production)
  if (process.env.NODE_ENV === 'production') {
    try {
      await kafkaModule.init();
      console.log('Kafka initialized successfully');
    } catch (error) {
      console.error('Kafka initialization failed:', error.message);
      console.warn('Continuing without Kafka...');
    }
  } else {
    console.log('Skipping Kafka initialization (development mode)');
  }
  
  // Initialize Vector Database
  try {
    // Test connection first
    const isConnected = await qdrantConfig.testConnection();
    if (isConnected) {
      // Initialize collections (but not full indexing on startup)
      await qdrantConfig.initializeCollections();
    } else {
      console.warn('Qdrant connection failed - vector search will be disabled');
    }
  } catch (error) {
    console.error('Vector database initialization failed:', error.message);
    console.warn('Continuing without vector search...');
  }
  const port = process.env.PORT;
  const hostname = process.env.HOST_NAME || "localhost";

  server.listen(port, hostname, () => {
    console.log(`Server đang chạy tại http://${hostname}:${port}`);
  });
});
