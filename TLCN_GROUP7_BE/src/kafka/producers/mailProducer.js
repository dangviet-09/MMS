// kafka/producers/mailProducer.js
class MailProducer {
  constructor(kafka) {
    this.producer = kafka.producer();
    this.topic = process.env.KAFKA_MAIL_TOPIC || "mail-events";
  }

  async connect() {
    await this.producer.connect();
  }

  // Low-level: gửi bất kỳ event mail nào
  async sendMailEvent(data) {
    if (!data || !data.to) {
      console.error("[Kafka] Missing 'to' in mail event:", data);
      return;
    }

    await this.producer.send({
      topic: this.topic,
      messages: [{ value: JSON.stringify(data) }],
    });

  }

  // Helper cao cấp: gửi event Welcome (dùng trong service)
  async sendWelcomeEmail({ email, fullName, username }) {
    const event = {
      type: "WELCOME",
      to: email,
      fullName,
      username
    };
    await this.sendMailEvent(event);
  }

  // Helper cao cấp: gửi OTP event
  async sendOTPEmail({ email, fullName, username, otpCode }) {
    const event = {
      type: "OTP",
      to: email,
      fullName,
      username,
      otpCode
    };
    await this.sendMailEvent(event);
  }

  // (tùy chọn) helper generic cho template khác
  async sendTemplateMail({ type, to, payload }) {
    const event = { type, to, ...payload };
    await this.sendMailEvent(event);
  }
}

module.exports = MailProducer;
