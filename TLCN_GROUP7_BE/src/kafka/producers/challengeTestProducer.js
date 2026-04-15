// producers/challengeTestProducer.js
class ChallengeTestProducer {
  constructor(kafka) {
    this.producer = kafka.producer();
    this.topic = process.env.KAFKA_CHALLENGE_TEST_TOPIC || "challenge-test-events";
  }

  async connect() {
    await this.producer.connect();
  }

  async sendEvent(data) {
    if (!data.challengeTestId || !data.type) {
      return;
    }

    await this.producer.send({
      topic: this.topic,
      messages: [{
        key: data.challengeTestId.toString(),
        value: JSON.stringify(data)
      }]
    });

  }
}

module.exports = ChallengeTestProducer;
