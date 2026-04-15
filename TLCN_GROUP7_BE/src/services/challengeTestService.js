// services/challengeTestService.js
const kafkaModule = require("../kafka");
const db = require("../models");

class ChallengeTestService {

  
  async create(userId, data, files) {

    const company = await db.Company.findOne({ where: { userId } });
    if (!company) {
      throw new Error('Không tìm thấy công ty của bạn');
    }

    const challenge = await db.ChallengeTest.create({
      title: data.title,
      description: data.description || null,
      deadline: data.deadline ? new Date(data.deadline) : null,
      maxScore: data.maxScore ?? 100,
      companyId: company.id,
      image: null,
      fileUrl: null,
      publicId: null
    });

    // If files present, send event to kafka to upload
    try {
      const image = files?.images?.[0];
      const file = files?.files?.[0];

      if (image || file) {
        await kafkaModule.producers.challengeTestProducer.sendEvent({
          challengeTestId: challenge.id,
          type: "CREATE",
          imageBase64: image ? image.buffer.toString('base64') : undefined,
          fileBase64: file ? file.buffer.toString('base64') : undefined,
          fileName: file ? file.originalname : undefined
        });
      }
    } catch (err) {
      console.error('Lỗi gửi event challenge create', err);
      throw new Error('Lỗi xử lý file challenge test');
    }

    return challenge;
  }

  async getAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const { rows, count } = await db.ChallengeTest.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return { total: count, page, limit, data: rows };
  }

  async getById(id) {
    const item = await db.ChallengeTest.findByPk(id);
    if (!item) throw new Error('ChallengeTest không tồn tại');
    return item;
  }

  async update(userId, id, data, files) {
    const challenge = await db.ChallengeTest.findByPk(id);
    if (!challenge) throw new Error('ChallengeTest không tồn tại');

    // Resolve company and check ownership
    let company = await db.Company.findOne({ where: { userId } });
    if (!company) company = await db.Company.findByPk(userId);
    if (!company) throw new Error('Không tìm thấy công ty');

    if (challenge.companyId !== company.id) throw new Error('Không có quyền chỉnh sửa');

    await challenge.update({
      title: data.title ?? challenge.title,
      description: data.description ?? challenge.description,
      deadline: data.deadline ? new Date(data.deadline) : challenge.deadline,
      maxScore: data.maxScore ?? challenge.maxScore
    });

    // If new files provided, send UPDATE event
    try {
      const image = files?.images?.[0];
      const file = files?.files?.[0];

      if (image || file) {
        await kafkaModule.producers.challengeTestProducer.sendEvent({
          challengeTestId: challenge.id,
          type: 'UPDATE',
          imageBase64: image ? image.buffer.toString('base64') : undefined,
          fileBase64: file ? file.buffer.toString('base64') : undefined,
          oldImagePublicId: challenge.publicId,
          fileName: file ? file.originalname : undefined
        });
      }
    } catch (err) {
      console.error('Lỗi gửi event challenge update', err);
      throw new Error('Lỗi xử lý file challenge test');
    }

    return challenge;
  }

  // companyIdOrUserId may be userId; role is required to evaluate permission (ADMIN/COMPANY)
  async delete(userId, id, role = 'COMPANY') {
    const challenge = await db.ChallengeTest.findByPk(id);
    if (!challenge) throw new Error('ChallengeTest không tồn tại');

    // Resolve company
    let company = await db.Company.findOne({ where: { userId } });
    if (!company) company = await db.Company.findByPk(userId);
    if (!company) throw new Error('Không tìm thấy công ty');

    if (role === 'COMPANY' && challenge.companyId !== company.id) {
      throw new Error('Không có quyền xoá');
    }

    if (!['ADMIN', 'COMPANY'].includes(role)) throw new Error('Bạn không có quyền xoá challenge');

    // send DELETE event to remove cloudinary image if exists
    try {
      if (challenge.publicId) {
        await kafkaModule.producers.challengeTestProducer.sendEvent({
          challengeTestId: challenge.id,
          type: 'DELETE',
          oldImagePublicId: challenge.publicId
        });
      }
    } catch (err) {
      console.error('Lỗi gửi event challenge delete', err);
      throw new Error('Lỗi xóa file challenge test');
    }

    await db.ChallengeTest.destroy({ where: { id: challenge.id } });
    return true;
  }
}

module.exports = new ChallengeTestService();
