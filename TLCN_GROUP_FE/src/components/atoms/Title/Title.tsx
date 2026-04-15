import React from "react";

type TitleProps = {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3;
}

const Title: React.FC<TitleProps> = ({ children, className = "", level = 1 }) => {
  const sizes: Record<number, string> = {
    1: "text-4xl md:text-5xl",
    2: "text-3xl",
    3: "text-xl",
  };
  const Tag = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
  return (
    <Tag className={`font-bold ${sizes[level]} ${className}`}>
      {children}
    </Tag>
  );
};

export default Title;
