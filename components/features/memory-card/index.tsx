import { Pin } from "lucide-react";
import MemoryCaption from "@/components/features/memory-caption";
import MemoryComments from "@/components/features/memory-comments";

const PINNED_MEMORY_ID = "30774a7f-77c9-42ce-9679-f3fc47999956";

interface MemoryCardProps {
    memory: {
        id: string;
        caption: string;
        imageUrl: string | null;
        createdAt: Date | string;
        comments: {
            id: string;
            authorName: string;
            content: string;
            createdAt: Date | string;
        }[];
    };
}

export default function MemoryCard({ memory }: MemoryCardProps) {
    const isPinned = memory.id === PINNED_MEMORY_ID;

    return (
        <div className="memory-card relative bg-surface-container-lowest p-3 rounded-xl paper-shadow border border-outline-variant/20">
            {isPinned && (
                <div
                    className="absolute -left-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary shadow-md"
                    title="Pinned"
                >
                    <Pin size={16} className="-rotate-45" />
                </div>
            )}
            {memory.imageUrl && (
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
            )}
            <div className="px-2 pb-2">
                <MemoryCaption
                    text={memory.caption}
                    className="font-body-md text-on-surface-variant italic"
                />

                <div className="mt-5">
                    <MemoryComments
                        memoryId={memory.id}
                        initialComments={memory.comments ?? []}
                    />
                </div>
            </div>
        </div>
    );
}
