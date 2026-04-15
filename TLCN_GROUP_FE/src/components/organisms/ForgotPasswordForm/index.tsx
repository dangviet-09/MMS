import React, { useState } from "react";
import { Input } from "../../atoms/Input/Input";
import { Button } from "../../atoms/Button/Button";
import { Link } from "react-router-dom";
import { OTPModal } from "../../molecules/OTPModal";
import { ResetPasswordModal } from "../../molecules/ResetPasswordModal";
import { Toast } from "../../molecules/ToastNotification";
import { ArrowLeft } from "lucide-react";
import { authService } from "../../../services/authService";

export const ForgotPasswordForm: React.FC = () => {
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;

        setIsLoading(true);

        try {
            await authService.verifyUsername(username);

            setShowOTPModal(true);
            setToast({ message: 'OTP code sent!', type: 'success' });
        } catch (error: any) {
            setToast({ message: error.message || 'This account was not found.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOTPSuccess = () => {
        setShowOTPModal(false);
        setShowResetModal(true);
    }

    const handleResetSuccess = () => {
        setShowResetModal(false);
        setUsername("");
    }

    return (
        <>
            <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-lg shadow">
                <Link to="/signin" className="flex items-center text-black hover:text-blue-600 mb-6">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Login
                </Link>
                <h2 className="text-3xl font-bold mb-4">Forgot Password</h2>
                <p className="mb-8 text-gray-500">
                    Enter your username below and we’ll send you code on how to reset your password.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <Input
                            type="text"
                            name="username"
                            placeholder="Username"
                            required
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full h-12 bg-black text-white hover:bg-blue-700 rounded-[6px] text-lg"
                        disabled={isLoading}
                    >
                        {isLoading ? "Sending..." : "Send"}
                    </Button>
                </form>
            </div>

            {showOTPModal && (
                <OTPModal
                    username={username}
                    onSuccess={handleOTPSuccess}
                    onClose={() => setShowOTPModal(false)}
                />
            )}

            {showResetModal && (
                <ResetPasswordModal
                    username={username}
                    onSuccess={handleResetSuccess}
                    onClose={() => setShowResetModal(false)}
                />
            )}

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
