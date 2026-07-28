"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp, Loader2, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { useVoterStore } from "@/stores/use-voter-store";

export interface MemoryComment {
    id: string;
    authorName: string;
    content: string;
    createdAt: Date | string;
}

interface MemoryCommentsProps {
    memoryId: string;
    initialComments?: MemoryComment[];
    defaultOpen?: boolean;
    placeholder?: string;
}

export default function MemoryComments({
    memoryId,
    initialComments = [],
    defaultOpen = false,
    placeholder = "Tulis komentar kamu...",
}: MemoryCommentsProps) {
    const { voterName } = useVoterStore();
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [comments, setComments] = useState<MemoryComment[]>(initialComments);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setComments(initialComments);
        setComment("");
        setIsOpen(defaultOpen);
        // Reset only when switching memory so local newly-added comments stay intact.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [memoryId]);

    const handleSubmitComment = async () => {
        if (!voterName) {
            toast.error("Simpan nama panggilan dulu sebelum berkomentar.");
            return;
        }

        if (!comment.trim()) {
            toast.error("Komentar tidak boleh kosong.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post(`/api/memories/${memoryId}/comments`, {
                authorName: voterName,
                content: comment.trim(),
            });

            setComments((prev) => [...prev, response.data]);
            setComment("");
            setIsOpen(true);
            toast.success("Komentar berhasil ditambahkan.");
        } catch (error) {
            console.error("Comment Error:", error);
            toast.error("Gagal menambahkan komentar.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="rounded-xl bg-surface-container-low p-4">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex w-full items-center justify-between gap-2 text-left text-primary transition-colors hover:opacity-80"
            >
                <span className="flex items-center gap-2">
                    <MessageCircle size={16} />
                    <span className="font-label-sm font-bold">Komentar ({comments.length})</span>
                </span>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isOpen && (
                <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="max-h-48 space-y-3 overflow-y-auto no-scrollbar">
                        {comments.length > 0 ? (
                            comments.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-lg border border-outline-variant/10 bg-surface-container-lowest p-3"
                                >
                                    <p className="text-sm font-semibold text-on-surface">{item.authorName}</p>
                                    <p className="mt-1 text-sm text-on-surface-variant">{item.content}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-outline">Belum ada komentar.</p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <textarea
                            rows={3}
                            value={comment}
                            onChange={(event) => setComment(event.target.value)}
                            onKeyDown={(event) => {
                                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                                    void handleSubmitComment();
                                }
                            }}
                            placeholder={placeholder}
                            className="min-h-20 w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 text-sm text-on-surface outline-none transition-colors focus:border-primary"
                        />
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => void handleSubmitComment()}
                                disabled={isSubmitting}
                                className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-label-sm font-bold text-on-primary transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                <span>Kirim</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
