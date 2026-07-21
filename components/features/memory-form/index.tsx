"use client";

import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { UploadCloud, X } from "lucide-react";
import axios from "axios";

interface MemoryFormProps {
    onSuccess?: () => void;
}

export default function MemoryForm({ onSuccess }: MemoryFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [caption, setCaption] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error("Silakan pilih gambar terlebih dahulu.");
            return;
        }

        setIsUploading(true);
        const loadingToast = toast.loading("Menyimpan memori...");

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("caption", caption.trim() === "" ? "Foto kenangan" : caption);

            await axios.post("/api/memories", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            toast.success("Memori berhasil disimpan!");
            setIsOpen(false);
            setCaption("");
            setFile(null);
            if (onSuccess) onSuccess();
        } catch (error: any) {
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
                <span>Upload Gambar</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[60] bg-inverse-surface/40 backdrop-blur-strong flex items-center justify-center p-4">
                    <div className="bg-surface-container-lowest w-full max-w-2xl rounded-xl scrapbook-shadow flex flex-col animate-in fade-in zoom-in duration-300">
                        {/* Header */}
                        <div className="px-8 py-6 flex justify-between items-center border-b border-surface-container-high">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                    <UploadCloud size={24} />
                                </div>
                                <h2 className="font-display text-headline-md text-primary">Upload Memory</h2>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-outline hover:text-on-surface transition-colors p-1"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="font-label-sm text-on-secondary-container block">
                                    Upload Gambar
                                </label>
                                <div
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="group relative border-2 border-dashed border-outline-variant hover:border-primary hover:bg-primary/5 rounded-xl transition-all duration-200 cursor-pointer p-10 flex flex-col items-center justify-center gap-4"
                                >
                                    <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <UploadCloud size={32} />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-body-lg text-on-surface font-semibold">
                                            {file ? file.name : "Click to upload or drag and drop"}
                                        </p>
                                        <p className="font-body-md text-outline">
                                            High-res PNG, JPG or HEIC (Max. 20MB)
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="font-label-sm text-on-secondary-container block" htmlFor="caption">
                                    Input Caption cerita
                                </label>
                                <div className="relative">
                                    <textarea
                                        id="caption"
                                        rows={4}
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        placeholder="Tuliskan momen berharga yang ingin kamu simpan..."
                                        className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 rounded-t-xl p-4 font-body-md text-on-surface placeholder:text-outline transition-all focus:bg-surface-container"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-6 py-3 rounded-xl font-label-sm text-primary hover:bg-primary/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className={`bg-primary text-on-primary px-8 py-3 rounded-xl font-label-sm font-bold transition-all shadow-md ${isUploading ? 'opacity-50' : 'hover:opacity-90 active:scale-95'}`}
                                >
                                    {isUploading ? "Menyimpan..." : "Simpan Memory"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
