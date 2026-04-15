import React, { useState, useEffect, useRef } from "react";
import { Blog } from "../../../api/blogApi";
import { Button } from "../../atoms/Button/Button";
import { Textarea } from "../../atoms/Textarea/Textarea";
import { useAuth } from "../../../contexts/AuthContext";
import { canUserCreateBlog } from "../../../utils/userUtils";
import { X } from "lucide-react";
import { Toast } from "../ToastNotification";

type PostModalProps = {
    onClose: () => void;
    onPost: (data: { content: string; images?: File[] }) => void;
    initialData?: Blog;
    title?: string;
};

const PostModal: React.FC<PostModalProps> = ({ onClose, onPost, initialData }) => {
    const { user } = useAuth();
    const [content, setContent] = useState("");
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialData) {
            setContent(initialData.content);
        }
    }, [initialData]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        // Validate file types
        const validFiles = files.filter(file => 
            file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
        );

        if (validFiles.length !== files.length) {
            setToastMessage({ message: 'Please select only image files under 5MB each', type: 'warning' });
            return;
        }

        setSelectedImages(prev => [...prev, ...validFiles]);

        // Create preview URLs
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setImagePreviews(prev => [...prev, e.target!.result as string]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleImageButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handlePost = () => {
        if (!canUserCreateBlog(user as any)) {
            setToastMessage({ message: "You don't have permission to create posts.", type: 'error' });
            setTimeout(() => onClose(), 2000);
            return;
        }

        if (!content.trim() && selectedImages.length === 0) return;
        onPost({ content, images: selectedImages });
        setContent("");
        setSelectedImages([]);
        setImagePreviews([]);
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] m-0 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto transform transition-all animate-in fade-in-0 zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900">
                        {initialData ? "Edit Post" : "Create Post"}
                    </h3>
                    <Button
                        variant="icon"
                        onClick={onClose}
                        aria-label="Close"
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </Button>
                </div>

                {/* Content Area */}
                <div className="p-6">
                    <div className="mb-4">
                        <Textarea
                            placeholder={`What's on your mind, ${user?.fullName || user?.username || 'there'}?`}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            className="w-full border-0 resize-none focus:ring-0 text-lg placeholder-gray-400 bg-transparent"
                            style={{ minHeight: '120px' }}
                        />
                    </div>

                    {/* Image Preview */}
                    {imagePreviews.length > 0 && (
                        <div className="mb-4">
                            <div className="grid grid-cols-2 gap-3">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-40 object-cover rounded-xl border border-gray-200"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-xl flex items-center justify-center">
                                            <Button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 transform scale-90 hover:scale-100"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                    />

                    {/* Add Photo Section */}
                    <div className="flex items-center justify-center mb-4">
                        <Button
                            variant="secondary"
                            onClick={handleImageButtonClick}
                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-700">Add Photo</span>
                        </Button>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                    <Button
                        onClick={handlePost}
                        disabled={!content.trim() && selectedImages.length === 0}
                        className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                            (!content.trim() && selectedImages.length === 0)
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                        }`}
                    >
                        {initialData ? "Update Post" : "Share Post"}
                    </Button>
                </div>
            </div>

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

export default PostModal;
