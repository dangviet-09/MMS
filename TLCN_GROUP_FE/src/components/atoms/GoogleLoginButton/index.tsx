import React from "react";
import { Button } from "../Button/Button";

type GoogleLoginButtonProps = {
    onClick?: () => void;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onClick }) => (
    <Button
        variant="outline"
        onClick={onClick}
        className="flex items-center justify-center w-full gap-2 border border-gray-300"
        style={{ width: 360, height: 48, border: "1px solid #D8DADC", borderRadius: 6 }}
    >
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
        Log in with Google
    </Button>
);