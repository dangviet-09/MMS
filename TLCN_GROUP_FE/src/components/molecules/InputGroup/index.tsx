import React from "react";
import { Input } from "../../atoms/Input/Input";
type InputGroupProps = {
    label: string;
    type?: string;
    name: string;
    placeholder?: string;
};

export const InputGroup: React.FC<InputGroupProps> = ({
    label,
    type = "text",
    name,
    placeholder,
}) => (
    <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor={name}>
            {label}
        </label>
        <Input id={name} name={name} type={type} placeholder={placeholder} />
    </div>
);