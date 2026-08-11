"use client";

import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { Heart, ImagePlus, Images, Loader2, MessageCircle, Star, UploadCloud, X } from "lucide-react";
import axios from "axios";
import { useVoterStore } from "@/stores/use-voter-store";

interface MemoryFormProps {
    onSuccess?: () => void;
}

type FormTab = "tebak-gambar" | "sambat-sehat" | "love" | "apresiasi";

const TAB_CONFIG: Record<FormTab, {
    label: string;
    icon: React.ElementType;
    typeValue: string;
    imageRequired: boolean;
    imageAllowed: boolean;
    captionLabel: string;
    placeholder: string;
    successMsg: string;
}> = {
    "tebak-gambar": {
        label: "Tebak",
        icon: Images,
        typeValue: "TEBAK_GAMBAR",
        imageRequired: true,
        imageAllowed: true,
        captionLabel: "Caption",
        placeholder: "Tuliskan petunjuk singkat untuk foto ini...",
        successMsg: "Foto tebak gambar berhasil disimpan!",
    },
    "sambat-sehat": {
        label: "Sambat",
        icon: MessageCircle,
        typeValue: "SAMBAT_SEHAT",
        imageRequired: false,
        imageAllowed: false,
        captionLabel: "Cerita / Keluh Kesah",
        placeholder: "Tuliskan sambat sehat atau keluh kesah yang ingin kamu bagikan...",
        successMsg: "Sambat sehat berhasil disimpan!",
    },
    "love": {
        label: "Cinta",
        icon: Heart,
        typeValue: "LOVE",
        imageRequired: false,
        imageAllowed: true,
        captionLabel: "Cerita Cintamu",
        placeholder: "Ceritakan kisah cintamu — sama pasangan, hewan peliharaan, atau siapapun yang kamu sayang...",
        successMsg: "Cerita cinta berhasil disimpan! 💖",
    },
    "apresiasi": {
        label: "Apresiasi",
        icon: Star,
        typeValue: "APRESIASI",
        imageRequired: false,
        imageAllowed: true,
        captionLabel: "Pesan Apresiasi",
        placeholder: "Tuliskan pesan apresiasimu untuk mereka...",
        successMsg: "Apresiasi berhasil dikirim! 🌟",
    },
};

const TABS: FormTab[] = ["tebak-gambar", "sambat-sehat", "love", "apresiasi"];
const TARGET_OPTIONS = ["Jamjam", "Ida", "Ryan", "Sidik", "Dimy"];

export default function MemoryForm({ onSuccess }: MemoryFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<FormTab>("tebak-gambar");
    const [isUploading, setIsUploading] = useState(false);
    const [caption, setCaption] = useState("");
    const [targets, setTargets] = useState<string[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { voterName } = useVoterStore();

    const config = TAB_CONFIG[activeTab];

    const handleClearFile = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleClose = () => {
        handleClearFile();
        setCaption("");
        setTargets([]);
        setActiveTab("tebak-gambar");
        setIsOpen(false);
    };

    const handleTabChange = (tab: FormTab) => {
        setActiveTab(tab);
        if (tab !== "apresiasi") {
            setTargets([]);
        }
        // Clear file if switching to a tab that doesn't allow images
        if (!TAB_CONFIG[tab].imageAllowed) {
            handleClearFile();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const selectedFile = e.dataTransfer.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (caption.trim() === "") {
            toast.error(`${config.captionLabel} tidak boleh kosong.`);
            return;
        }

        if (activeTab === "apresiasi" && targets.length === 0) {
            toast.error("Pilih minimal satu orang untuk diberi apresiasi.");
            return;
        }

        if (config.imageRequired && !file) {
            toast.error("Untuk Tebak Gambar, foto wajib diupload.");
            return;
        }

        setIsUploading(true);
        const loadingToast = toast.loading("Menyimpan memori...");

        try {
            const formData = new FormData();
            formData.append("caption", caption.trim());
            formData.append("type", config.typeValue);
            if (activeTab === "apresiasi" && targets.length > 0) {
                formData.append("targets", JSON.stringify(targets));
                if (voterName) {
                    formData.append("sender", voterName);
                }
            }

            if (config.imageAllowed && file) {
                formData.append("file", file);
            }

            await axios.post("/api/memories", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success(config.successMsg);
            handleClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Upload Error:", error);
            toast.error("Gagal menyimpan memori.");
        } finally {
            setIsUploading(false);
            toast.dismiss(loadingToast);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1 px-4 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-all shadow-md"
            >
                <UploadCloud size={20} />
                <span>Tulis Cerita</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[60] bg-inverse-surface/40 backdrop-blur-strong flex items-center justify-center p-4">
                    <div className="bg-surface-container-lowest w-full max-w-2xl rounded-xl scrapbook-shadow flex flex-col animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-hidden">
                        <div className="shrink-0 px-8 py-6 flex justify-between items-center border-b border-surface-container-high">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${activeTab === "love" ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary"}`}>
                                    <UploadCloud size={24} />
                                </div>
                                <h2 className={`font-display text-headline-md ${activeTab === "love" ? "text-rose-500" : "text-primary"}`}>
                                    Buat Memory
                                </h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-outline hover:text-on-surface transition-colors p-1"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                            <div className="flex-1 space-y-6 overflow-y-auto p-8 no-scrollbar">
                                {/* Tab Selector */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-xl bg-surface-container-low p-1">
                                    {TABS.map((tab) => {
                                        const { label, icon: Icon } = TAB_CONFIG[tab];
                                        const isActive = activeTab === tab;
                                        const isLove = tab === "love";
                                        const isApresiasi = tab === "apresiasi";
                                        return (
                                            <button
                                                key={tab}
                                                type="button"
                                                onClick={() => handleTabChange(tab)}
                                                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 font-label-sm font-bold transition-all ${isActive
                                                    ? isLove
                                                        ? "bg-surface-container-lowest text-rose-500 shadow-sm"
                                                        : isApresiasi
                                                            ? "bg-surface-container-lowest text-amber-500 shadow-sm"
                                                            : "bg-surface-container-lowest text-primary shadow-sm"
                                                    : "text-on-surface-variant hover:text-primary"
                                                    }`}
                                            >
                                                <Icon size={16} className={isActive && isLove ? "text-rose-500" : isActive && isApresiasi ? "text-amber-500" : ""} />
                                                <span className="hidden sm:inline">{label}</span>
                                                <span className="sm:hidden">{isLove ? "💖" : isApresiasi ? "🌟" : label.split(" ")[0]}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Love banner */}
                                {activeTab === "love" && (
                                    <div className="rounded-xl bg-rose-500/10 border border-rose-300/30 px-4 py-3 flex items-center gap-3">
                                        <span className="text-2xl">💖</span>
                                        <p className="font-body-md text-rose-600 text-sm">
                                            Ceritakan cintamu — sama pasangan, hewan peliharaan, atau siapapun yang kamu sayang. Upload foto juga boleh!
                                        </p>
                                    </div>
                                )}

                                {/* Apresiasi banner */}
                                {activeTab === "apresiasi" && (
                                    <div className="rounded-xl bg-amber-500/10 border border-amber-300/30 px-4 py-3 flex items-center gap-3">
                                        <span className="text-2xl">🌟</span>
                                        <p className="font-body-md text-amber-700 text-sm">
                                            Berikan apresiasimu untuk teman-teman yang hebat! Pilih satu atau lebih orang yang ingin kamu apresiasi.
                                        </p>
                                    </div>
                                )}

                                {/* Target Selection for Apresiasi */}
                                {activeTab === "apresiasi" && (
                                    <div className="space-y-3">
                                        <label className="font-label-sm text-on-secondary-container block">
                                            Untuk Siapa? (Pilih satu atau lebih)
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {TARGET_OPTIONS.map(name => {
                                                const isSelected = targets.includes(name);
                                                return (
                                                    <button
                                                        key={name}
                                                        type="button"
                                                        onClick={() => {
                                                            setTargets(prev =>
                                                                isSelected
                                                                    ? prev.filter(t => t !== name)
                                                                    : [...prev, name]
                                                            )
                                                        }}
                                                        className={`px-4 py-2 rounded-full font-label-sm transition-all border ${isSelected
                                                            ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                                                            : "bg-surface-container-low text-on-surface-variant border-outline-variant hover:border-amber-400 hover:text-amber-600"
                                                            }`}
                                                    >
                                                        {name}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Image Upload — shown for Tebak Gambar (required) and Love (optional) */}
                                {config.imageAllowed && (
                                    <div className="space-y-2">
                                        <label className="font-label-sm text-on-secondary-container block">
                                            Upload Gambar{config.imageRequired ? "" : " (opsional)"}
                                        </label>
                                        <div
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={handleDrop}
                                            onClick={() => !previewUrl && fileInputRef.current?.click()}
                                            className={`group relative border-2 border-dashed transition-all duration-200 rounded-xl overflow-hidden
                                                ${activeTab === "love"
                                                    ? "border-rose-300/50 hover:border-rose-400"
                                                    : activeTab === "apresiasi"
                                                        ? "border-amber-300/50 hover:border-amber-400"
                                                        : "border-outline-variant hover:border-primary"
                                                }
                                                ${previewUrl ? "p-2 bg-surface-container/30" : "hover:bg-primary/5 cursor-pointer p-10 flex flex-col items-center justify-center gap-4"}
                                            `}
                                        >
                                            {previewUrl ? (
                                                <div className="relative w-full max-h-64 rounded-lg overflow-hidden flex items-center justify-center bg-surface-container-low">
                                                    <img src={previewUrl} className="max-h-64 object-contain" alt="Preview" />
                                                    <button
                                                        type="button"
                                                        onClick={handleClearFile}
                                                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors shadow-md z-15"
                                                        title="Hapus gambar"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${activeTab === "love"
                                                        ? "bg-rose-500/10 text-rose-500"
                                                        : activeTab === "apresiasi"
                                                            ? "bg-amber-500/10 text-amber-500"
                                                            : "bg-surface-container-low text-primary"
                                                        }`}>
                                                        {activeTab === "love" ? <Heart size={32} /> : activeTab === "apresiasi" ? <Star size={32} /> : <UploadCloud size={32} />}
                                                    </div>
                                                    <div className="text-center animate-in fade-in duration-200">
                                                        <p className="font-body-lg text-on-surface font-semibold">
                                                            {activeTab === "love" ? "Upload foto kenangan cinta" : activeTab === "apresiasi" ? "Upload momen apresiasi" : "Upload foto untuk ditebak"}
                                                        </p>
                                                        <p className="font-body-md text-outline">
                                                            {config.imageRequired ? "PNG, JPG atau HEIC" : "PNG, JPG atau HEIC (opsional)"}
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                className="hidden"
                                                ref={fileInputRef}
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Caption / Text area */}
                                <div className="space-y-2">
                                    <label className="font-label-sm text-on-secondary-container block" htmlFor="caption">
                                        {config.captionLabel}
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            id="caption"
                                            rows={4}
                                            value={caption}
                                            onChange={(e) => setCaption(e.target.value)}
                                            placeholder={config.placeholder}
                                            className={`w-full bg-surface-container-low border-b-2 focus:ring-0 rounded-t-xl p-4 font-body-md text-on-surface text-start placeholder:text-outline transition-all focus:bg-surface-container ${activeTab === "love"
                                                ? "border-rose-300/50 focus:border-rose-400"
                                                : activeTab === "apresiasi"
                                                    ? "border-amber-300/50 focus:border-amber-400"
                                                    : "border-outline-variant focus:border-primary"
                                                }`}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="shrink-0 flex items-center justify-end gap-4 border-t border-surface-container-high bg-surface-container-lowest px-8 py-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-6 py-3 rounded-xl font-label-sm text-primary hover:bg-primary/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className={`px-8 py-3 rounded-xl font-label-sm font-bold transition-all shadow-md ${activeTab === "love"
                                        ? `bg-rose-500 text-white ${isUploading ? "opacity-50" : "hover:bg-rose-600 active:scale-95"}`
                                        : activeTab === "apresiasi"
                                            ? `bg-amber-500 text-white ${isUploading ? "opacity-50" : "hover:bg-amber-600 active:scale-95"}`
                                            : `bg-primary text-on-primary ${isUploading ? "opacity-50" : "hover:opacity-90 active:scale-95"}`
                                        }`}
                                >
                                    {isUploading ? "Menyimpan..." : activeTab === "love" ? "Simpan 💖" : activeTab === "apresiasi" ? "Kirim 🌟" : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
