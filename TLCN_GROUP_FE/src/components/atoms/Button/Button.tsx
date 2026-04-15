import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "outline" | "icon" | "unstyled" | "destructive";
    children: React.ReactNode;
};

const base = "rounded-md px-4 py-2 font-medium focus:outline-none";
const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "border border-gray-300 text-gray-900 hover:bg-gray-50",
    icon: "bg-transparent text-gray-700 hover:bg-gray-100 p-2 rounded-fulls",
    unstyled: "",
    destructive: "bg-red-600 text-white hover:bg-red-700"
};

export const Button: React.FC<ButtonProps> = ({
    variant = "primary",
    children,
    ...props
}) => (
    <button className={`${variant === "unstyled" ? "" : base} ${variants[variant]}`} {...props}>
        {children}
    </button>
);