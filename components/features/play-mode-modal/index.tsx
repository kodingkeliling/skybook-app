"use client";

import { FileText, Images, X } from "lucide-react";

interface PlayModeModalProps {
    onClose: () => void;
    onSelectMode: (mode: "voting" | "sambat-sehat") => void;
}

const PLAY_MODES = [
    {
        mode: "voting" as const,
        title: "Voting",
        description: "Tebak pemilik foto dari gambar dan caption yang diacak.",
        icon: Images,
    },
    {
        mode: "sambat-sehat" as const,
        title: "Sambat Sehat",
        description: "Baca caption random tanpa gambar untuk sesi cerita santai.",
        icon: FileText,
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
                        Mau tebak foto atau baca sambat sehat hari ini?
                    </p>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {PLAY_MODES.map(({ mode, title, description, icon: Icon }) => (
                        <button
                            key={mode}
                            type="button"
                            onClick={() => onSelectMode(mode)}
                            className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5"
                        >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Icon size={22} />
                            </div>
                            <h3 className="font-display text-headline-sm text-on-surface">{title}</h3>
                            <p className="mt-2 text-sm text-on-surface-variant">{description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
