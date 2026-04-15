import React, { useState } from "react";
import { Input } from "../../atoms/Input/Input";
import { Button } from "../../atoms/Button/Button";
import { Toast } from "../ToastNotification";
import { authService } from "../../../services/authService";

type ResetPasswordModalProps = {
    username: string;
    onSuccess: () => void;
    onClose: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ username, onSuccess, onClose }) => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!newPassword.trim() || !confirmNewPassword.trim()) {
            setToast({ message: 'Please enter complete information', type: 'error' });
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setToast({ message: 'Confirmation password does not match', type: 'error' });
            return;
        }

        if (newPassword.length < 6) {
            setToast({ message: 'Password must be at least 6 characters', type: 'error' });
            return;
        }

        setIsLoading(true);
        try {
            await authService.resetPassword(username, newPassword, confirmNewPassword);
            setToast({ message: "Password changed successfully!", type: "success" });
            setTimeout(() => onSuccess(), 1500);
        } catch (err: any) {
            setToast({
                message: err?.message || "Error resetting password",
                type: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
                    <h2 className="text-2xl font-bold mb-4">Reset password</h2>
                    <p className="mb-6 text-gray-500">
                        Enter a new password for account <strong>{username}</strong>
                    </p>

                    <Button variant="icon"
                        onClick={onClose}
                        aria-label="Close"
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </Button>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <Input
                                type="password"
                                placeholder="New password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                            />
                        </div>

                        <div className="mb-6">
                            <Input
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmNewPassword}
                                onChange={e => setConfirmNewPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                className="flex-1 h-12 bg-black text-white hover:bg-blue-700 rounded-[6px] disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Updating...' : 'Update'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Toast trong modal */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
};