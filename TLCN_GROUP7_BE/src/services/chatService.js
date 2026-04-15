const db = require('../models');
const AIService = require('./aiService');

class ChatService {

  async getOrCreateSession(userId) {
    // Find student
    const student = await db.Student.findOne({ where: { userId } });
    if (!student) {
      throw new Error('Student not found');
    }

    // Find existing session
    let session = await db.ChatSession.findOne({
      where: { studentId: student.id }
    });

    // If no session exists, create one
    if (!session) {
      const studentContext = await AIService.buildStudentContext(student.id);
      session = await db.ChatSession.create({
        studentId: student.id,
        title: 'Trò chuyện với AI',
        messages: [],
        studentContext,
        isActive: true
      });
    }

    return {
      sessionId: session.id,
      title: session.title,
      messages: session.messages,
      createdAt: session.createdAt
    };
  }

  async sendMessage(userId, message) {
    if (!message || !message.trim()) {
      throw new Error('Thiếu message');
    }

    // Find student
    const student = await db.Student.findOne({ where: { userId } });
    if (!student) {
      throw new Error('Student not found');
    }

    // Find or create session
    let session = await db.ChatSession.findOne({
      where: { studentId: student.id }
    });

    if (!session) {
      const studentContext = await AIService.buildStudentContext(student.id);
      session = await db.ChatSession.create({
        studentId: student.id,
        title: 'Trò chuyện với AI',
        messages: [],
        studentContext,
        isActive: true
      });
    }

    // Add user message
    const userMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    const messages = [...session.messages, userMessage];

    // Get AI response
    const aiResponse = await AIService.chat(
      messages.map(m => ({ role: m.role, content: m.content })),
      session.studentContext
    );

    // Add assistant message
    const assistantMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    };

    messages.push(assistantMessage);

    // Generate title for first message
    if (session.messages.length === 0) {
      const title = await AIService.generateSessionTitle(message);
      await session.update({ title, messages });
    } else {
      await session.update({ messages });
    }

    return {
      sessionId: session.id,
      userMessage,
      aiResponse: assistantMessage
    };
  }

  async clearHistory(userId) {
    const student = await db.Student.findOne({ where: { userId } });
    if (!student) {
      throw new Error('Student not found');
    }

    const session = await db.ChatSession.findOne({
      where: { studentId: student.id }
    });

    if (!session) {
      throw new Error('Chưa có lịch sử chat');
    }

    // Clear messages but keep session
    await session.update({ messages: [] });

    return true;
  }

  async generateAssessment(userId) {
    const student = await db.Student.findOne({ where: { userId } });
    if (!student) {
      throw new Error('Student not found');
    }

    // Build fresh context
    const studentContext = await AIService.buildStudentContext(student.id);

    // Generate assessment
    const assessment = await AIService.generateAssessment(studentContext);

    return {
      assessment,
      studentContext,
      generatedAt: new Date()
    };
  }
}

module.exports = new ChatService();
