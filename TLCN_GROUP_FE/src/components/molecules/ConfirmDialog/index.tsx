import React from "react";
import { Button } from "../../atoms/Button/Button";

type ConfirmDialogProps = {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    type = 'warning'
}) => {
    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return 'border-red-500 text-red-700';
            case 'warning':
                return 'border-yellow-500 text-yellow-700';
            case 'info':
                return 'border-blue-500 text-blue-700';
            default:
                return 'border-gray-500 text-gray-700';
        }
    };

    const getConfirmButtonType = () => {
        switch (type) {
            case 'danger':
                return 'destructive' as const;
            case 'warning':
                return 'primary' as const;
            case 'info':
                return 'primary' as const;
            default:
                return 'primary' as const;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
                {title && (
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>
                )}

                <div className={`border-l-4 pl-4 py-2 mb-6 ${getTypeStyles()}`}>
                    <p className="text-sm">{message}</p>
                </div>

                <div className="flex justify-end space-x-3">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={getConfirmButtonType()}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};