import React from "react";

interface MemoryCaptionProps {
    text: string;
    className?: string;
}

const parseMarkdown = (text: string) => {
    return text.split("\n").map((line, lineIndex) => {
        const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
        const lineContent = parts.map((part, partIndex) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
            }

            if (part.startsWith("*") && part.endsWith("*")) {
                return <em key={partIndex}>{part.slice(1, -1)}</em>;
            }

            return part;
        });

        return (
            <React.Fragment key={lineIndex}>
                {lineIndex > 0 && <br />}
                {lineContent}
            </React.Fragment>
        );
    });
};

export default function MemoryCaption({ text, className }: MemoryCaptionProps) {
    return <p className={className}>{parseMarkdown(text)}</p>;
}
