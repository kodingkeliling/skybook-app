import { Pin, Heart, Star, Images, MessageCircle } from "lucide-react";
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
        targets?: string[];
        sender?: string | null;
    };
}

export default function MemoryCard({ memory }: MemoryCardProps) {
    const isPinned = memory.id === PINNED_MEMORY_ID;
    const effectiveType = memory.type === "TEBAK_GAMBAR" && !memory.imageUrl ? "SAMBAT_SEHAT" : memory.type;
    const isLove = effectiveType === "LOVE";
    const isApresiasi = effectiveType === "APRESIASI";
    const isTebak = effectiveType === "TEBAK_GAMBAR";
    const isSambat = effectiveType === "SAMBAT_SEHAT";

    return (
        <div className={`memory-card relative p-3 rounded-xl paper-shadow border transition-all ${isLove
                ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/50"
                : isApresiasi
                    ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/50"
                    : isTebak
                        ? "bg-blue-50/60 dark:bg-blue-950/20 border-blue-200/50"
                        : isSambat
                            ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/50"
                            : "bg-surface-container-lowest border-outline-variant/20"
            }`}>
            {/* Pinned badge */}
            {isPinned && (
                <div
                    className="absolute top-2 left-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm"
                    title="Pinned"
                >
                    <Pin size={16} className="-rotate-45" />
                </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 right-2 z-10 flex gap-2">
                {isLove && (
                    <div className="flex items-center justify-center bg-rose-500 text-white w-8 h-8 rounded-full shadow-sm select-none" title="Love">
                        <Heart size={14} fill="currentColor" />
                    </div>
                )}
                {isApresiasi && (
                    <div className="flex items-center justify-center bg-amber-500 text-white w-8 h-8 rounded-full shadow-sm select-none" title="Apresiasi">
                        <Star size={14} fill="currentColor" />
                    </div>
                )}
                {isTebak && (
                    <div className="flex items-center justify-center bg-blue-500 text-white w-8 h-8 rounded-full shadow-sm select-none" title="Tebak Gambar">
                        <Images size={14} />
                    </div>
                )}
                {isSambat && (
                    <div className="flex items-center justify-center bg-emerald-500 text-white w-8 h-8 rounded-full shadow-sm select-none" title="Sambat Sehat">
                        <MessageCircle size={14} />
                    </div>
                )}
            </div>

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

            <div className={`px-2 pb-2 ${!memory.imageUrl ? "mt-2" : ""}`}>
                {isLove && (
                    <div className="flex items-center gap-1.5 mb-2 text-rose-500">
                        <Heart size={14} fill="currentColor" />
                        <p className="text-xs font-semibold uppercase tracking-wide">Cerita Cinta</p>
                    </div>
                )}
                {isApresiasi && (
                    <div className="mb-2">
                        <div className="flex items-center gap-1.5 text-amber-600">
                            <Star size={14} fill="currentColor" />
                            <p className="text-xs font-semibold uppercase tracking-wide">Apresiasi</p>
                        </div>
                        {memory.sender && (
                            <p className="text-amber-700/80 text-xs font-medium mt-1">
                                Dari: <span className="font-bold">{memory.sender}</span>
                            </p>
                        )}
                        {memory.targets && memory.targets.length > 0 && (
                            <p className="text-amber-700/80 text-xs font-medium mt-1">
                                Untuk: <span className="font-bold">{memory.targets.join(", ")}</span>
                            </p>
                        )}
                    </div>
                )}
                {isTebak && (
                    <div className="flex items-center gap-1.5 mb-2 text-blue-600">
                        <Images size={14} />
                        <p className="text-xs font-semibold uppercase tracking-wide">Tebak Gambar</p>
                    </div>
                )}
                {isSambat && (
                    <div className="flex items-center gap-1.5 mb-2 text-emerald-600">
                        <MessageCircle size={14} />
                        <p className="text-xs font-semibold uppercase tracking-wide">Sambat Sehat</p>
                    </div>
                )}

                <MemoryCaption
                    text={memory.caption}
                    className={`text-base leading-relaxed font-semibold not-italic ${isLove ? "text-rose-950"
                            : isApresiasi ? "text-amber-950"
                                : isTebak ? "text-blue-950"
                                    : isSambat ? "text-emerald-950"
                                        : "text-slate-900"
                        }`}
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
