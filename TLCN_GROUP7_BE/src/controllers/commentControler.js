const ApiResponse = require('../utils/apiResponse');
const commentService = require('../services/commentService');
class commentController {
    async createComment(req, res) {
        try {
            const userId = req.user.id;
            const { blogId, content, parentId } = req.body;
            const newComment = await commentService.createComment(blogId, userId, content, parentId);
            
            // Emit socket notification
            const io = req.app.get('io');
            if (io) {
                // Get blog author and parent comment author
                const blog = await require('../models').Blog.findByPk(blogId);
                let parentCommentAuthorId = null;
                
                if (parentId) {
                    const parentComment = await require('../models').Comment.findByPk(parentId);
                    parentCommentAuthorId = parentComment?.authorId;
                }
                
                // Notify
                io.to(`user_${blog?.authorId}`).emit('newComment', {
                    type: parentId ? 'COMMENT_REPLY' : 'NEW_COMMENT',
                    comment: newComment,
                    blog: { id: blog?.id, title: blog?.title }
                });
                
                if (parentCommentAuthorId && parentCommentAuthorId !== userId) {
                    io.to(`user_${parentCommentAuthorId}`).emit('newComment', {
                        type: 'COMMENT_REPLY',
                        comment: newComment
                    });
                }
            }
            
            return ApiResponse.success(res, 'Tạo comment thành công', newComment);
        } catch (error) {
            return ApiResponse.error(res, error.message || 'Tạo comment thất bại', 400);
        }
    }

    async getCommentsByBlogId(req, res) {
        try {
            const blogId = req.params.blogId;
            const { page = 1, limit = 10 } = req.query;
            const comments = await commentService.getCommentsByBlogId(blogId, Number(page), Number(limit));
            return ApiResponse.success(res, 'Lấy danh sách comment thành công', comments);
        } catch (error) {
            return ApiResponse.error(res, error.message || 'Không thể lấy danh sách comment', 404);
        }
    }

    async updateComment(req, res) {
        try {
            const userId = req.user.id;
            const commentId = req.params.commentId;
            const { content } = req.body;
            const updated = await commentService.updateComment(userId, commentId, content);
            return ApiResponse.success(res, 'Cập nhật comment thành công', updated);
        } catch (error) {
            return ApiResponse.error(res, error.message || 'Cập nhật comment thất bại', 400);
        }
    }

    async deleteComment(req, res) {
        try {
            const userId = req.user.id;
            const commentId = req.params.commentId;
            await commentService.deleteComment(userId, commentId);
            return ApiResponse.success(res, 'Xoá comment thành công', { deleted: true });
        } catch (error) {
            return ApiResponse.error(res, error.message || 'Xoá comment thất bại', 400);
        }
    }
}

module.exports = new commentController();
