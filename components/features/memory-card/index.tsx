import React, { useState } from "react";
import axios from "axios";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { useVoterStore } from "@/stores/use-voter-store";

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
    const { voterName } = useVoterStore();
    const [comments, setComments] = useState(memory.comments);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            const response = await axios.post(`/api/memories/${memory.id}/comments`, {
                authorName: voterName,
                content: comment.trim(),
            });

            setComments((prev) => [...prev, response.data]);
            setComment("");
            toast.success("Komentar berhasil ditambahkan.");
        } catch (error) {
            console.error("Comment Error:", error);
            toast.error("Gagal menambahkan komentar.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="memory-card bg-surface-container-lowest p-3 rounded-xl paper-shadow border border-outline-variant/20">
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
                <p className="font-body-md text-on-surface-variant italic">
                    {parseMarkdown(memory.caption)}
                </p>

                <div className="mt-5 rounded-xl bg-surface-container-low p-4">
                    <div className="mb-3 flex items-center gap-2 text-primary">
                        <MessageCircle size={16} />
                        <span className="font-label-sm font-bold">Komentar ({comments.length})</span>
                    </div>

                    <div className="space-y-3">
                        {comments.length > 0 ? (
                            comments.map((item) => (
                                <div key={item.id} className="rounded-lg bg-surface-container-lowest p-3 border border-outline-variant/10">
                                    <p className="text-sm font-semibold text-on-surface">{item.authorName}</p>
                                    <p className="mt-1 text-sm text-on-surface-variant">{item.content}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-outline">Belum ada komentar.</p>
                        )}
                    </div>

                    <div className="mt-4 flex items-end gap-2">
                        <textarea
                            rows={2}
                            value={comment}
                            onChange={(event) => setComment(event.target.value)}
                            onKeyDown={(event) => {
                                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                                    void handleSubmitComment();
                                }
                            }}
                            placeholder="Tulis komentar kamu..."
                            className="min-h-20 flex-1 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 text-sm text-on-surface outline-none transition-colors focus:border-primary"
                        />
                        <button
                            type="button"
                            onClick={() => void handleSubmitComment()}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-3 font-label-sm font-bold text-on-primary transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            <span>Kirim</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
