const { Kafka } = require("kafkajs");
// require("dotenv").config();

if (!process.env.KAFKA_BROKERS) {
  throw new Error("KAFKA_BROKERS is not set in .env!");
}

const brokers = process.env.KAFKA_BROKERS.split(",").map(b => b.trim());

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "mms-backend",
  brokers,
  retry: { retries: 10, initialRetryTime: 300 },
  connectionTimeout: 10000,
});

module.exports = kafka;
