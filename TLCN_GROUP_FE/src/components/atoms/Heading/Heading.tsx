import React, { FC, ReactNode, CSSProperties } from "react";

type HeadingProps = {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4;
  className?: string;
  style?: CSSProperties;
}

const Heading: FC<HeadingProps> = ({ children, level = 1, className = "", style }) => {
  const sizes: Record<1 | 2 | 3 | 4, string> = {
    1: "text-3xl sm:text-4xl font-extrabold",
    2: "text-[42px] leading-[52px] font-extrabold",
    3: "text-lg font-semibold",
    4: "text-sm font-semibold",
  };

  const tagMap: Record<1 | 2 | 3 | 4, string> = {
    1: "h1",
    2: "h2",
    3: "h3",
    4: "h4",
  };

  const Tag = tagMap[level] as React.ElementType;

  return (
    <Tag className={`${sizes[level]} ${className}`.trim()} style={style}>
      {children}
    </Tag>
  );
};

export default Heading;
