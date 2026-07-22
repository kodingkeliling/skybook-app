import React from "react";

interface MemoryCardProps {
    memory: {
        id: string;
        caption: string;
        imageUrl: string;
        createdAt: Date | string;
    };
}

const parseMarkdown = (text: string) => {
    return text.split('\n').map((line, lineIndex) => {
        const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
        const lineContent = parts.map((part, partIndex) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
            } else if (part.startsWith('*') && part.endsWith('*')) {
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

export default function MemoryCard({ memory }: MemoryCardProps) {
    return (
        <div className="memory-card bg-surface-container-lowest p-3 rounded-xl paper-shadow border border-outline-variant/20">
            <div className="overflow-hidden rounded-lg mb-4">
                <img
                    alt="Memory"
                    className="w-full object-cover rounded-lg"
                    src={memory.imageUrl}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x500?text=Image+Unavailable";
                    }}
                />
            </div>
            <div className="px-2 pb-2">
                <p className="font-body-md text-on-surface-variant italic">
                    {parseMarkdown(memory.caption)}
                </p>
            </div>
        </div>
    );
}
