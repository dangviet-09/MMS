import React, { useEffect } from "react";
import { Button } from "../../atoms/Button/Button";

type ToastProps = {
    message: string;
    type: 'success' | 'error' | 'warning';
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-500 text-white';
            case 'error':
                return 'bg-red-500 text-white';
            case 'warning':
                return 'bg-yellow-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
            <div className={`px-6 py-3 rounded-lg shadow-lg ${getTypeStyles()}`}>
                <div className="flex items-center justify-between">
                    <span>{message}</span>
                    <Button
                        onClick={onClose}
                        className="ml-4 text-white hover:text-gray-200"
                    >
                        ×
                    </Button>
                </div>
            </div>
        </div>
    );
};