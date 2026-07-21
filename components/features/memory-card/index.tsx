import React from "react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale/id";

interface MemoryCardProps {
    memory: {
        id: string;
        caption: string;
        imageUrl: string;
        createdAt: Date | string;
    };
}

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
                <p className="font-caption text-primary text-label-sm mb-1 uppercase tracking-wider">
                    {formatDistanceToNow(new Date(memory.createdAt), { addSuffix: true, locale: id })}
                </p>
                <p className="font-body-md text-on-surface-variant italic">"{memory.caption}"</p>
            </div>
        </div>
    );
}
