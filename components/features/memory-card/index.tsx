import { Pin } from "lucide-react";
import MemoryCaption from "@/components/features/memory-caption";
import MemoryComments from "@/components/features/memory-comments";

const PINNED_MEMORY_ID = "30774a7f-77c9-42ce-9679-f3fc47999956";

interface MemoryCardProps {
    memory: {
        id: string;
        caption: string;
        imageUrl: string | null;
        type: string;
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
    const isLove = memory.type === "LOVE";

    return (
        <div className={`memory-card relative p-3 rounded-xl paper-shadow border transition-all ${
            isLove
                ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/50"
                : "bg-surface-container-lowest border-outline-variant/20"
        }`}>
            {/* Pinned badge */}
            {isPinned && (
                <div
                    className="absolute -left-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary shadow-md"
                    title="Pinned"
                >
                    <Pin size={16} className="-rotate-45" />
                </div>
            )}

            {/* Love badge */}
            {isLove && (
                <div className="absolute -right-2 -top-2 z-10 flex items-center justify-center bg-rose-500 text-white text-sm w-8 h-8 rounded-full shadow-md select-none">
                    💖
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
                {isLove && (
                    <p className="text-rose-500 text-xs font-semibold uppercase tracking-wide mb-2">💕 Cerita Cinta</p>
                )}
                <MemoryCaption
                    text={memory.caption}
                    className={`text-base leading-relaxed font-semibold not-italic ${isLove ? "text-rose-950" : "text-slate-900"}`}
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
