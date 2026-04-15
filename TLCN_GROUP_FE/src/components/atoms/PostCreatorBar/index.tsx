import React, { useState } from "react";
import { Button } from "../Button/Button";
import { useAuth } from "../../../contexts/AuthContext";
import { canUserCreateBlog } from "../../../utils/userUtils";
import { Toast } from "../../molecules/ToastNotification";

type PostCreatorBarProps = {
    onOpen: () => void;
}

const PostCreatorBar: React.FC<PostCreatorBarProps> = ({ onOpen }) => {
    const { user } = useAuth();
    const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
    const allowed = canUserCreateBlog(user as any);

    const handleOpen = () => {
        if (!allowed) {
            setToastMessage({ message: "You don't have permission to create posts.", type: 'error' });
            return;
        }
        onOpen();
    };

    return (
        <div className="bg-white rounded-xl shadow p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                    <img
                        src={user.avatar}
                        alt={user.fullName || user.username || 'User'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                                parent.innerHTML = `<span class="text-white font-semibold text-lg">${(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}</span>`;
                            }
                        }}
                    />
                ) : (
                    <span className="text-white font-semibold text-lg">
                        {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                    </span>
                )}
            </div>

            <Button
                variant="outline"
                onClick={handleOpen}
                className="flex-1 text-left bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full px-4 py-2 transition"
            >
                What's on your mind, {user?.fullName || user?.username || 'there'}?
            </Button>
            
            {toastMessage && (
                <Toast
                    message={toastMessage.message}
                    type={toastMessage.type}
                    onClose={() => setToastMessage(null)}
                />
            )}
        </div>
    );
};

export default PostCreatorBar;
