const db = require('../models');
const NotificationService = require('./notificationService');

class commentService {
    async createComment(blogId, userId, content, parentId = null) {
        if (!blogId || !userId || !content) {
            throw new Error('Thiếu dữ liệu bắt buộc');
        }

        const blog = await db.Blog.findByPk(blogId);
        if (!blog) throw new Error('Blog không tồn tại');

        let parentComment = null;
        if (parentId) {
            parentComment = await db.Comment.findByPk(parentId);
            if (!parentComment) throw new Error('Comment cha không tồn tại');
        }

        const comment = await db.Comment.create({
            content,
            userId,
            postId: blogId,
            parentId: parentId || null
        });

        // Create notifications
        try {
            if (parentId && parentComment) {
                // This is a reply - notify the original commenter
                if (parentComment.userId !== userId) {
                    await NotificationService.createReplyNotification(
                        parentComment.userId, 
                        userId, 
                        blogId, 
                        comment.id
                    );
                }
            } else {
                // This is a comment - notify the blog author
                if (blog.authorId && blog.authorId !== userId) {
                    await NotificationService.createCommentNotification(
                        blog.authorId, 
                        userId, 
                        blogId, 
                        comment.id
                    );
                }
            }
        } catch (error) {
            console.error('Error creating comment notification:', error);
            // Don't fail the comment operation if notification fails
        }

        const fullComment = await db.Comment.findByPk(comment.id, {
            include: [
                { model: db.User, as: 'author', attributes: ['id', 'username', 'fullName', 'avatar'] }
            ]
        });


        // Broadcast new comment to all users viewing this blog
        const io = global.io;
        if (io) {
            io.to(`blog_${blogId}`).emit('new_comment', {
                blogId,
                comment: fullComment
            });
        }

        return fullComment;
    }

    async getCommentsByBlogId(blogId, page = 1, limit = 10) {
        const blog = await db.Blog.findByPk(blogId);
        if (!blog) throw new Error('Blog không tồn tại');

        const offset = (page - 1) * limit;
        const { count, rows } = await db.Comment.findAndCountAll({
            where: { postId: blogId, parentId: null },
            offset,
            limit,
            order: [['createdAt', 'DESC']],
            include: [
                { model: db.User, as: 'author', attributes: ['id', 'username', 'fullName', 'avatar'] },
                { model: db.Comment, as: 'replies', include: [{ model: db.User, as: 'author', attributes: ['id', 'username', 'fullName', 'avatar'] }] }
            ]
        });


        return {
            total: count,
            comments: rows,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
        };
    }

    async updateComment(userId, commentId, content) {
        if (!content) throw new Error('Nội dung không được để trống');

        const comment = await db.Comment.findByPk(commentId);
        if (!comment) throw new Error('Comment không tồn tại');
        if (comment.userId !== userId) throw new Error('Không có quyền chỉnh sửa');

        await comment.update({ content });
        return comment;
    }

    async deleteComment(userId, commentId) {
        const comment = await db.Comment.findByPk(commentId);
        if (!comment) throw new Error('Comment không tồn tại');
        if (comment.userId !== userId) throw new Error('Không có quyền xoá');

        await comment.destroy(); // soft delete vì paranoid: true
        return true;
    }
}
module.exports = new commentService();