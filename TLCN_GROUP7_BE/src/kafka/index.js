const kafka = require("../configs/kafka");
const producers = require("./producers");
const consumers = require("./consumers");

class KafkaManager {
  constructor() {
    this.kafka = kafka;

    // Khởi tạo tất cả producer
    this.producers = {
      mailProducer: new producers.mailProducer(this.kafka),
      courseImageProducer: new producers.courseImageProducer(this.kafka),
      challengeTestProducer: new producers.challengeTestProducer(this.kafka),
    };

    // Khởi tạo tất cả consumer
    this.consumers = {
      mailConsumer: new consumers.mailConsumer(this.kafka),
      courseImageConsumer: new consumers.courseImageConsumer(this.kafka),
      challengeTestConsumer: new consumers.challengeTestConsumer(this.kafka),
    };

    // Danh sách các topic cần check/tạo
    this.topics = [
      { topic: "mail-events", numPartitions: 1, replicationFactor: 1 },
      { topic: "course-image-events", numPartitions: 1, replicationFactor: 1 },
      { topic: process.env.KAFKA_CHALLENGE_TEST_TOPIC || "challenge-test-events", numPartitions: 1, replicationFactor: 1 },
    ];
  }

  // Hàm check/create topic
  async ensureTopics() {
    const admin = this.kafka.admin();
    await admin.connect();

    const existingTopics = await admin.listTopics();

    const topicsToCreate = this.topics.filter(t => !existingTopics.includes(t.topic));

    if (topicsToCreate.length > 0) {
      await admin.createTopics({
        topics: topicsToCreate,
        waitForLeaders: true, // đợi leader partition sẵn sàng
      });
    }
    await admin.disconnect();
  }

  async init() {
    // Check và tạo topic trước khi connect producer
    await this.ensureTopics();

    // Kết nối tất cả producer
    for (const key in this.producers) {
      await this.producers[key].connect();
    }

    // Khởi chạy tất cả consumer
    for (const key in this.consumers) {
      await this.consumers[key].start();
    }
  }
}

module.exports = new KafkaManager();
