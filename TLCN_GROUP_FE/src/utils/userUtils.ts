import { User } from "../types/types";

export const getUserDisplayName = (user: User | null): string => {
    if (!user) return "Anonymous";

    return user.fullName || user.username || "Anonymous";
};

export const getUserId = (user: User): string => {
    switch (user.role) {
        case 'STUDENT':
            return user.studentId || user.id;
        case 'COMPANY':
            return user.companyId || user.id;
        case 'ADMIN':
        default:
            return user.id;
    }
};

export const canUserCreateBlog = (user: User | null): boolean => {
    return user?.role === 'COMPANY' || user?.role === 'ADMIN';
};

export const canUserComment = (user: User | null): boolean => {
    return user?.role === 'COMPANY' || user?.role === 'ADMIN' || user?.role === 'STUDENT';
};

export const canUserModifyBlog = (user: User | null, blogAuthorId: string): boolean => {
    if (!user) return false;

    if (user.role === 'ADMIN') return true;

    if (!canUserCreateBlog(user)) return false;

    const userId = getUserId(user);
    return userId === blogAuthorId;
};

export const getUserBlogPermissions = (user: User | null) => {
    return {
        canCreate: canUserCreateBlog(user),
        canRead: true,
        canModify: (blogAuthorId: string) => canUserModifyBlog(user, blogAuthorId)
    };
};

export const getUserIdFieldName = (user: User): string => {
    switch (user.role) {
        case 'STUDENT':
            return 'studentId';
        case 'COMPANY':
            return 'companyId';
        case 'ADMIN':
        default:
            return 'id';
    }
};

export const canUserModifyPost = (
    currentUser: User | null,
    postAuthor: any
): boolean => {
    if (!currentUser) return false;

    if (currentUser.role === 'ADMIN') return true;

    if (typeof postAuthor === 'string') {
        return postAuthor === getUserDisplayName(currentUser);
    }

    if (typeof postAuthor === 'object' && postAuthor) {
        const currentUserId = getUserId(currentUser);

        switch (currentUser.role) {
            case 'STUDENT':
                return postAuthor.studentId === currentUser.studentId ||
                    postAuthor.id === currentUserId;
            case 'COMPANY':
                return postAuthor.companyId === currentUser.companyId ||
                    postAuthor.id === currentUserId;
            default:
                return postAuthor.id === currentUserId;
        }
    }

    return false;
};