import React, { useState } from "react";
import { Input } from "../../atoms/Input/Input";
import { Button } from "../../atoms/Button/Button";
import { Toast } from "../ToastNotification";
import { authService } from "../../../services/authService";

type OTPModalProps = {
    username: string;
    onSuccess: () => void;
    onClose: () => void;
}

export const OTPModal: React.FC<OTPModalProps> = ({ username, onSuccess, onClose }) => {
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp.trim()) {
            setToast({ message: 'Please enter OTP code', type: 'error' });
            return;
        }

        setIsLoading(true);
        try {
            await authService.verifyOTP(username, otp);
            setToast({ message: "OTP authentication successful!", type: "success" });
            setTimeout(() => {
                onSuccess();
            }, 1000);
        } catch (error: any) {
            setToast({
                message: error.message || "Incorrect OTP code",
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
                    <Button variant="icon"
                        onClick={onClose}
                        aria-label="Close"
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </Button>
                    <h2 className="text-2xl font-bold mb-4">Enter OTP code</h2>
                    <p className="mb-6 text-gray-500">
                        We have sent an OTP code to your account. Please enter the code to verify.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <Input
                                type="text"
                                placeholder="Enter OTP code"
                                required
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                maxLength={6}
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                className="flex-1 h-12 bg-black text-white hover:bg-blue-700 rounded-[6px] disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Verifying...' : 'Verify OTP'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

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