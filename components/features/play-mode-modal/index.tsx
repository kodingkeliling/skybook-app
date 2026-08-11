"use client";

import { MessageCircle, Heart, Images, X, Star } from "lucide-react";

interface PlayModeModalProps {
    onClose: () => void;
    onSelectMode: (mode: "voting" | "sambat-sehat" | "love" | "apresiasi") => void;
}

const PLAY_MODES = [
    {
        mode: "voting" as const,
        title: "Voting",
        description: "Tebak pemilik foto dari gambar dan caption yang diacak.",
        icon: Images,
        isLove: false,
        isApresiasi: false,
    },
    {
        mode: "sambat-sehat" as const,
        title: "Sambat Sehat",
        description: "Baca caption random tanpa gambar untuk sesi cerita santai.",
        icon: MessageCircle,
        isLove: false,
        isApresiasi: false,
    },
    {
        mode: "love" as const,
        title: "Love 💖",
        description: "Baca cerita cinta yang pernah dibagikan. Hangatkan hati kalian!",
        icon: Heart,
        isLove: true,
        isApresiasi: false,
    },
    {
        mode: "apresiasi" as const,
        title: "Apresiasi 🌟",
        description: "Baca momen apresiasi untuk teman-teman hebat. Tebarkan kebaikan!",
        icon: Star,
        isLove: false,
        isApresiasi: true,
    },
];

export default function PlayModeModal({ onClose, onSelectMode }: PlayModeModalProps) {
    return (
        <div className="fixed inset-0 z-[70] bg-inverse-surface/50 backdrop-blur-strong flex items-center justify-center p-4">
            <div className="relative w-full max-w-xl rounded-2xl bg-surface-container-lowest p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant transition-colors hover:bg-surface-container"
                >
                    <X size={18} />
                </button>

                <div className="pr-12">
                    <h2 className="font-display text-headline-md text-primary">Pilih Mode Bermain</h2>
                    <p className="mt-2 text-sm text-on-surface-variant">
                        Mau tebak foto, baca sambat sehat, cerita cinta, atau apresiasi hari ini?
                    </p>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {PLAY_MODES.map(({ mode, title, description, icon: Icon, isLove, isApresiasi }) => (
                        <button
                            key={mode}
                            type="button"
                            onClick={() => onSelectMode(mode)}
                            className={`rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 ${isLove
                                ? "border-rose-200/30 bg-rose-50/50 hover:border-rose-300/50 hover:bg-rose-50/80 dark:bg-rose-950/20 dark:border-rose-800/30"
                                : isApresiasi
                                    ? "border-amber-200/30 bg-amber-50/50 hover:border-amber-300/50 hover:bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-800/30"
                                    : "border-outline-variant/20 bg-surface-container-low hover:border-primary/30 hover:bg-primary/5"
                                }`}
                        >
                            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${isLove ? "bg-rose-500/15 text-rose-500" : isApresiasi ? "bg-amber-500/15 text-amber-500" : "bg-primary/10 text-primary"
                                }`}>
                                <Icon size={22} />
                            </div>
                            <h3 className={`font-display text-headline-sm ${isLove ? "text-rose-600" : isApresiasi ? "text-amber-600" : "text-on-surface"}`}>
                                {title}
                            </h3>
                            <p className="mt-2 text-sm text-on-surface-variant">{description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
