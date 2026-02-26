import { type ReactNode } from "react";

type HeadingLevel = 1 | 2 | 3 | 4;

type HeadingTag = "h1" | "h2" | "h3" | "h4";

interface HeadingProps {
    children: ReactNode;
    level?: HeadingLevel;
    className?: string;
}

export function Heading({ children, level = 1, className = "" }: HeadingProps) {
    const baseStyles = "font-semibold text-slate-100";
    
    const sizeStyles: Record<HeadingLevel, string> = {
        1: "text-3xl",
        2: "text-2xl",
        3: "text-xl",
        4: "text-lg",
    };

    const Component = `h${level}` as HeadingTag;

    return (
        <Component className={`${baseStyles} ${sizeStyles[level]} ${className}`}>
            {children}
        </Component>
    );
}
