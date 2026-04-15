const db = require('../models');

class FollowService {
  async toggleFollow(followerId, followingId) {

    
    if (!followerId || !followingId) throw new Error('Thiếu dữ liệu bắt buộc');
    if (followerId === followingId) throw new Error('Không thể tự follow chính mình');

    const targetUser = await db.User.findByPk(followingId);
    if (!targetUser) throw new Error('User không tồn tại');


    
    const existing = await db.Follow.findOne({ where: { followerId, followingId } });

 

    if (existing) {
      await existing.destroy();
      const followerCount = await db.Follow.count({ where: { followingId } });
      return { isFollowing: false, followerCount };
    } else {
      await db.Follow.create({ followerId, followingId });
      const followerCount = await db.Follow.count({ where: { followingId } });
      return { isFollowing: true, followerCount };
    }
  }

  async getFollowInfo(targetUserId, viewerUserId) {
    const targetUser = await db.User.findByPk(targetUserId);
    if (!targetUser) throw new Error('User không tồn tại');

    const followerCount = await db.Follow.count({ where: { followingId: targetUserId } });

    let isFollowing = false;
    if (viewerUserId) {
      const exists = await db.Follow.findOne({
        where: { followerId: viewerUserId, followingId: targetUserId }
      });
      isFollowing = !!exists;
    }

    return { isFollowing, followerCount };
  }

  async getFollowers(targetUserId, page = 1, limit = 10) {
    const targetUser = await db.User.findByPk(targetUserId);
    if (!targetUser) throw new Error('User không tồn tại');

    const offset = (page - 1) * limit;
    const { count, rows } = await db.Follow.findAndCountAll({
      where: { followingId: targetUserId },
      offset,
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        { model: db.User, as: 'follower', attributes: ['id', 'username', 'fullName'] }
      ]
    });

    return {
      total: count,
      users: rows.map(r => r.follower),
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    };
  }

  async getFollowing(userId, page = 1, limit = 10) {
    const user = await db.User.findByPk(userId);
    if (!user) throw new Error('User không tồn tại');

    const offset = (page - 1) * limit;
    const { count, rows } = await db.Follow.findAndCountAll({
      where: { followerId: userId },
      offset,
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        { model: db.User, as: 'following', attributes: ['id', 'username', 'fullName'] }
      ]
    });

    return {
      total: count,
      users: rows.map(r => r.following),
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    };
  }
}

module.exports = new FollowService();