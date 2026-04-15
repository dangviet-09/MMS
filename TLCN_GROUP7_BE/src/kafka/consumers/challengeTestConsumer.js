const ChallengeTestHandler = require("../../handles/challengeTestHandler");

class ChallengeTestConsumer {
  constructor(kafka) {
    this.consumer = kafka.consumer({ groupId: "challenge-test-group" });
    this.topic = process.env.KAFKA_CHALLENGE_TEST_TOPIC || "challenge-test-events";
  }

  async start() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: this.topic });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const data = JSON.parse(message.value.toString());
        try {
          await ChallengeTestHandler.handleEvent(data);
        } catch (err) {
          console.error("[ChallengeTestConsumer]", err.message);
        }
      }
    });
  }
}

module.exports = ChallengeTestConsumer;
