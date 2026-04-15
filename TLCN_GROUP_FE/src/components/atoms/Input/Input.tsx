import React, { useState } from "react";
import { Button } from "../Button/Button";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    isPassword?: boolean;
    overrideDefaultStyles?: boolean; // Cho phép override hoàn toàn style mặc định
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ isPassword = false, overrideDefaultStyles = false, className = "", type = "text", ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);

        // Nếu overrideDefaultStyles = true, chỉ sử dụng className được truyền vào
        const defaultStyles = "w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
        const finalClassName = overrideDefaultStyles 
            ? `${className} ${isPassword ? "pr-14" : ""}`
            : `${defaultStyles} ${isPassword ? "pr-14" : ""} ${className}`;

        return (
            <div className={isPassword ? "relative" : ""}>
                <input
                    ref={ref}
                    type={isPassword ? (showPassword ? "text" : "password") : type}
                    className={finalClassName}
                    {...props}
                />
                {isPassword && (
                    <Button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-3 flex items-center text-sm text-black hover:text-blue-500"
                    >
                        {showPassword ? "Hide" : "Show"}
                    </Button>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";
