import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import MemoryCaption from "@/components/features/memory-caption";
import MemoryComments, { type MemoryComment } from "@/components/features/memory-comments";
import { useVoterStore } from "@/stores/use-voter-store";
import { ArrowRight, ChevronLeft, ChevronRight, ChevronUp, MessageCircle, Heart, Loader2, Users, X, Star } from "lucide-react";
import { toast } from "sonner";

interface Memory {
    id: string;
    caption: string;
    imageUrl: string | null;
    type: string;
    createdAt: string;
    comments?: MemoryComment[];
    targets?: string[];
    sender?: string | null;
}

interface VoteGroup {
    candidateName: string;
    count: number;
    voters: string[];
}

const CANDIDATES = ["Jamjam", "Dimy", "Ida", "Ryan", "Sidik"];

interface RandomVoteModalProps {
    mode: "voting" | "sambat-sehat" | "love" | "apresiasi";
    onClose: () => void;
}

function shuffleMemories(items: Memory[]) {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export default function RandomVoteModal({ mode, onClose }: RandomVoteModalProps) {
    const { voterName } = useVoterStore();
    const onCloseRef = useRef(onClose);
    const [memories, setMemories] = useState<Memory[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [votes, setVotes] = useState<VoteGroup[]>([]);
    const [showDetails, setShowDetails] = useState(false);
    const [isVoting, setIsVoting] = useState(false);
    const [votingCandidate, setVotingCandidate] = useState<string | null>(null);
    const [votesLoading, setVotesLoading] = useState(true);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        let cancelled = false;

        const fetchMemories = async () => {
            setLoading(true);
            setCurrentIndex(0);
            setVotes([]);
            setShowDetails(false);
            setVotesLoading(mode === "voting");

            try {
                const res = await axios.get("/api/memories");
                const filtered = (res.data as Memory[]).filter((memory) => {
                    if (mode === "voting") {
                        return Boolean(memory.imageUrl) && memory.type !== "LOVE" && memory.type !== "APRESIASI";
                    }
                    if (mode === "sambat-sehat") {
                        return !memory.imageUrl && memory.type === "SAMBAT_SEHAT";
                    }
                    if (mode === "love") {
                        return memory.type === "LOVE";
                    }
                    if (mode === "apresiasi") {
                        return memory.type === "APRESIASI";
                    }
                    return false;
                });

                if (cancelled) return;
                setMemories(shuffleMemories(filtered));
            } catch {
                if (cancelled) return;
                toast.error(
                    mode === "voting" ? "Gagal mengambil data foto."
                    : mode === "love" ? "Gagal mengambil cerita cinta."
                    : mode === "apresiasi" ? "Gagal mengambil data apresiasi."
                    : "Gagal mengambil data cerita."
                );
                onCloseRef.current();
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void fetchMemories();

        return () => {
            cancelled = true;
        };
    }, [mode]);

    const currentMemoryId = memories[currentIndex]?.id;

    useEffect(() => {
        if (mode !== "voting" || !currentMemoryId) {
            setVotes([]);
            setVotesLoading(false);
            return;
        }

        let cancelled = false;
        setShowDetails(false);
        setVotesLoading(true);

        const eventSource = new EventSource(`/api/memories/${currentMemoryId}/votes/stream`);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (!cancelled && Array.isArray(data)) {
                    setVotes(data);
                    setVotesLoading(false);
                }
            } catch {
                // ignore connected and other non-JSON events
            }
        };

        eventSource.onerror = () => {
            eventSource.close();
            axios.get(`/api/memories/${currentMemoryId}/votes`)
                .then((res) => {
                    if (!cancelled) {
                        setVotes(res.data);
                        setVotesLoading(false);
                    }
                })
                .catch(() => {
                    if (!cancelled) {
                        setVotesLoading(false);
                    }
                });
        };

        return () => {
            cancelled = true;
            eventSource.close();
        };
    }, [currentMemoryId, mode]);

    const handleVote = async (candidateName: string) => {
        if (mode !== "voting" || !currentMemoryId) {
            return;
        }

        if (!voterName) {
            toast.error("Nama kamu belum tersimpan.");
            return;
        }
        setIsVoting(true);
        setVotingCandidate(candidateName);
        try {
            await axios.post(`/api/memories/${currentMemoryId}/votes`, {
                candidateName,
                voterName,
            });
            const res = await axios.get(`/api/memories/${currentMemoryId}/votes`);
            setVotes(res.data);
            toast.success(`Berhasil voting: ${candidateName}!`);
        } catch {
            toast.error("Gagal melakukan vote.");
        } finally {
            setIsVoting(false);
            setVotingCandidate(null);
        }
    };

    const getCandidateCount = (name: string) =>
        votes.find(v => v.candidateName === name)?.count || 0;

    const hasVotedFor = (name: string) =>
        votes.find(v => v.candidateName === name)?.voters.includes(voterName || "") ?? false;

    const hasAnyVoteFromMe = votes.some(v => v.voters.includes(voterName || ""));

    if (loading) {
        const isVotingMode = mode === "voting";

        return (
            <div className="fixed inset-0 z-[70] bg-inverse-surface/50 backdrop-blur-strong flex flex-col md:items-center justify-end md:justify-center p-4">
                <div className="relative w-full max-w-lg mx-auto animate-in zoom-in-95 duration-300">
                    <button
                        onClick={onClose}
                        className="absolute -top-12 right-0 w-10 h-10 flex items-center justify-center bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="mb-2 flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden">
                            <div className="h-full w-1/4 animate-pulse rounded-full bg-white/60" />
                        </div>
                        <div className="h-3 w-10 animate-pulse rounded bg-white/30" />
                    </div>

                    <div className="bg-surface-container-lowest rounded-xl paper-shadow overflow-hidden max-h-[85vh] overflow-y-auto no-scrollbar">
                        <div className="p-5 space-y-4">
                            <div className="text-center space-y-3">
                                <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-surface-container-high" />
                                <div className="mx-auto h-5 w-40 animate-pulse rounded bg-surface-container-high" />
                                <div className="mx-auto h-4 w-64 max-w-full animate-pulse rounded bg-surface-container-high" />
                            </div>

                            {isVotingMode && (
                                <div
                                    className="w-full animate-pulse rounded-xl bg-surface-container-high"
                                    style={{ height: "40vh" }}
                                />
                            )}

                            <div className="rounded-2xl bg-surface-container-low p-5 space-y-3">
                                <div className="h-4 w-full animate-pulse rounded bg-surface-container-high" />
                                <div className="h-4 w-5/6 animate-pulse rounded bg-surface-container-high" />
                                <div className="h-4 w-2/3 animate-pulse rounded bg-surface-container-high" />
                            </div>

                            {isVotingMode ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <div
                                            key={index}
                                            className={`h-10 animate-pulse rounded-lg bg-surface-container-high ${index === 4 ? "col-span-2" : ""}`}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-xl bg-surface-container-low p-4 space-y-3">
                                    <div className="h-4 w-28 animate-pulse rounded bg-surface-container-high" />
                                    <div className="h-20 w-full animate-pulse rounded-xl bg-surface-container-high" />
                                    <div className="flex justify-end">
                                        <div className="h-10 w-24 animate-pulse rounded-xl bg-surface-container-high" />
                                    </div>
                                </div>
                            )}

                            <div className="h-10 w-full animate-pulse rounded-xl bg-surface-container-high" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (memories.length === 0) {
        const emptyTitle = mode === "voting" ? "Belum ada foto untuk voting"
            : mode === "love" ? "Belum ada cerita cinta 💖"
            : mode === "apresiasi" ? "Belum ada apresiasi 🌟"
            : "Belum ada sambat sehat";
        const emptyDesc = mode === "voting"
            ? "Post yang hanya berisi cerita tidak akan dimasukkan ke mode voting."
            : mode === "love"
            ? "Tambahkan cerita cinta dulu di menu Tulis Cerita → tab Love!"
            : mode === "apresiasi"
            ? "Tambahkan apresiasi dulu di menu Tulis Cerita → tab Apresiasi!"
            : "Tambahkan post tanpa gambar dulu supaya mode ini bisa dimainkan.";
        return (
            <div className="fixed inset-0 z-[70] bg-inverse-surface/50 backdrop-blur-strong flex items-center justify-center p-4">
                <div className={`w-full max-w-md rounded-2xl p-6 text-center shadow-2xl ${
                    mode === "love" ? "bg-rose-50 border border-rose-200/50" : mode === "apresiasi" ? "bg-amber-50 border border-amber-200/50" : "bg-surface-container-lowest"
                }`}>
                    <h2 className={`font-display text-headline-sm ${mode === "love" ? "text-rose-500" : mode === "apresiasi" ? "text-amber-500" : "text-primary"}`}>
                        {emptyTitle}
                    </h2>
                    <p className="mt-2 text-sm text-on-surface-variant">
                        {emptyDesc}
                    </p>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`mt-5 rounded-xl px-4 py-3 font-bold transition-opacity hover:opacity-90 ${
                            mode === "love" ? "bg-rose-500 text-white" : mode === "apresiasi" ? "bg-amber-500 text-white" : "bg-primary text-on-primary"
                        }`}
                    >
                        Tutup
                    </button>
                </div>
            </div>
        );
    }

    const current = memories[currentIndex];
    const isVotingMode = mode === "voting";
    const isLoveMode = mode === "love";
    const isApresiasiMode = mode === "apresiasi";
    const title = isVotingMode ? "Voting Random" : isLoveMode ? "Love 💖" : isApresiasiMode ? "Apresiasi 🌟" : "Sambat Sehat";
    const description = isVotingMode
        ? "Tebak pemilik foto dari caption berikut."
        : isLoveMode
        ? "Baca cerita cinta yang pernah dibagikan. Hangatkan hatimu!"
        : isApresiasiMode
        ? "Baca apresiasi untuk teman-teman hebat. Tebarkan kebaikan!"
        : "Baca caption random tanpa gambar dan nikmati sesi sambat sehat.";

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < memories.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            toast.success(
                isVotingMode ? "Semua foto sudah ditampilkan!"
                : isLoveMode ? "Semua cerita cinta sudah dibaca! 💖"
                : isApresiasiMode ? "Semua apresiasi sudah dibaca! 🌟"
                : "Semua sambat sehat sudah ditampilkan!"
            );
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[70] bg-inverse-surface/50 backdrop-blur-strong flex flex-col md:items-center justify-end md:justify-center p-4">
            <div className="relative w-full max-w-lg mx-auto animate-in zoom-in-95 duration-300">
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 w-10 h-10 flex items-center justify-center bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Progress */}
                <div className="mb-2 flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-500"
                            style={{ width: `${((currentIndex + 1) / memories.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-white text-xs font-bold shrink-0">
                        {currentIndex + 1} / {memories.length}
                    </span>
                </div>

                <div className="bg-surface-container-lowest rounded-xl paper-shadow overflow-hidden max-h-[85vh] overflow-y-auto no-scrollbar">
                    <div className="p-5 space-y-4">
                        <div className="text-center">
                            <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
                                isLoveMode ? "bg-rose-500/15 text-rose-500" : isApresiasiMode ? "bg-amber-500/15 text-amber-500" : "bg-primary/10 text-primary"
                            }`}>
                                {isVotingMode ? <Users size={20} /> : isLoveMode ? <Heart size={20} /> : isApresiasiMode ? <Star size={20} /> : <MessageCircle size={20} />}
                            </div>
                            <h2 className={`mt-3 font-display text-headline-sm ${isLoveMode ? "text-rose-500" : isApresiasiMode ? "text-amber-500" : "text-primary"}`}>{title}</h2>
                            <p className="mt-1 text-sm text-on-surface-variant">{description}</p>
                        </div>

                        {(isVotingMode || isLoveMode || isApresiasiMode) && current.imageUrl && (
                            <div className={`w-full flex items-center justify-center overflow-hidden rounded-xl border ${
                                isLoveMode
                                    ? "bg-rose-50/50 border-rose-200/30"
                                    : isApresiasiMode
                                    ? "bg-amber-50/50 border-amber-200/30"
                                    : "bg-surface-container-low border-outline-variant/10"
                            }`}>
                                <img
                                    key={current.id}
                                    alt={isLoveMode ? "Foto Kenangan Cinta" : isApresiasiMode ? "Foto Apresiasi" : "Foto Voting"}
                                    src={current.imageUrl}
                                    className="w-full h-auto max-h-[45vh] md:max-h-[50vh] object-contain"
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                        )}

                        <div className={`rounded-2xl p-5 ${
                            isLoveMode ? "bg-rose-50/60 border border-rose-200/30" : isApresiasiMode ? "bg-amber-50/60 border border-amber-200/30" : "bg-surface-container-low"
                        }`}>
                            {isLoveMode && (
                                <p className="text-rose-400 text-xs font-medium mb-2">💕 Cerita Cinta</p>
                            )}
                            {isApresiasiMode && (
                                <div className="mb-2">
                                    <p className="text-amber-600 text-xs font-semibold uppercase tracking-wide">🌟 Apresiasi</p>
                                    {current.sender && (
                                        <p className="text-amber-700/80 text-xs font-medium mt-1">
                                            Dari: <span className="font-bold">{current.sender}</span>
                                        </p>
                                    )}
                                    {current.targets && current.targets.length > 0 && (
                                        <p className="text-amber-700/80 text-xs font-medium mt-1">
                                            Untuk: <span className="font-bold">{current.targets.join(", ")}</span>
                                        </p>
                                    )}
                                </div>
                            )}
                            <MemoryCaption
                                text={current.caption}
                                className={`font-body-md italic text-start text-sm md:text-base ${
                                    isLoveMode ? "text-rose-700/80" : isApresiasiMode ? "text-amber-900/80" : "text-on-surface-variant"
                                }`}
                            />
                        </div>

                        {!isVotingMode && (
                            <MemoryComments
                                key={current.id}
                                memoryId={current.id}
                                initialComments={current.comments ?? []}
                                defaultOpen
                                placeholder={isLoveMode ? "Tulis respons untuk cerita cinta ini... 💖" : isApresiasiMode ? "Tulis respons apresiasi ini... 🌟" : "Tulis tanggapan untuk keluh kesah ini..."}
                            />
                        )}

                        {isVotingMode && (
                            <>
                                <div>
                                    <p className="text-label-sm font-bold text-on-secondary-container uppercase mb-3">
                                        Pilih Kandidat:
                                    </p>
                                    {votesLoading ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {CANDIDATES.map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`animate-pulse h-10 rounded-lg ${i === CANDIDATES.length - 1 && CANDIDATES.length % 2 !== 0 ? "col-span-2" : ""}`}
                                                    style={{ backgroundColor: "rgba(115, 118, 134, 0.15)" }}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            {CANDIDATES.map((candidate, i) => {
                                                const isActive = hasVotedFor(candidate);
                                                const count = getCandidateCount(candidate);
                                                const isThisButtonLoading = votingCandidate === candidate;

                                                return (
                                                    <button
                                                        key={candidate}
                                                        onClick={() => handleVote(candidate)}
                                                        disabled={isVoting}
                                                        className={`vote-btn relative border text-body-md py-2 px-3 rounded-lg transition-colors font-body-md flex items-center justify-center gap-2
                                                            ${i === CANDIDATES.length - 1 && CANDIDATES.length % 2 !== 0 ? "col-span-2" : ""}
                                                            ${isActive
                                                                ? "bg-primary border-primary text-white active font-bold"
                                                                : "border-outline-variant hover:bg-primary/5 text-on-surface"}
                                                            ${isVoting && !isThisButtonLoading ? "opacity-50 cursor-not-allowed" : ""}
                                                        `}
                                                    >
                                                        {isThisButtonLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                                                        {candidate}
                                                        {!isThisButtonLoading && (
                                                            <span className={`vote-badge ${isActive ? "bg-white text-primary" : ""}`}>{count}</span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {votesLoading ? (
                                    <div className="space-y-2 pt-2">
                                        <div className="animate-pulse h-4 w-32 rounded" style={{ backgroundColor: "rgba(115, 118, 134, 0.15)" }} />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <button
                                            className="flex items-center gap-1 text-primary text-label-sm font-bold hover:underline"
                                            onClick={() => setShowDetails(!showDetails)}
                                        >
                                            {showDetails ? <ChevronUp size={16} /> : <Users size={16} />}
                                            {showDetails ? "Sembunyikan detail" : "Lihat detail vote"}
                                        </button>
                                        {showDetails && (
                                            <div className="pt-2 border-t border-outline-variant/20 text-[11px] text-on-surface-variant max-h-32 overflow-y-auto no-scrollbar">
                                                {votes.filter(v => v.count > 0).length > 0
                                                    ? votes.filter(v => v.count > 0).map(v => (
                                                        <div key={v.candidateName}>
                                                            <span className="font-semibold text-primary">{v.candidateName}:</span> {v.voters.join(", ")}
                                                        </div>
                                                    ))
                                                    : <span>Belum ada yang menebak.</span>
                                                }
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        <div className="pt-2 space-y-2">
                            {currentIndex > 0 && (
                                <button
                                    onClick={handlePrevious}
                                    disabled={isVotingMode && votesLoading}
                                    className="w-full flex items-center justify-center gap-2 py-2 text-outline text-label-sm hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={16} />
                                    <span>
                                        {isVotingMode ? "Kembali ke Foto Sebelumnya" : isLoveMode ? "Kembali ke Cerita Cinta Sebelumnya" : isApresiasiMode ? "Kembali ke Apresiasi Sebelumnya" : "Kembali ke Cerita Sebelumnya"}
                                    </span>
                                </button>
                            )}
                            {isVotingMode && votesLoading ? (
                                <div className="animate-pulse h-10 w-full rounded-xl" style={{ backgroundColor: "rgba(115, 118, 134, 0.15)" }} />
                            ) : isVotingMode && hasAnyVoteFromMe ? (
                                <button
                                    onClick={handleNext}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/95 transition-all shadow-md active:scale-[0.98]"
                                >
                                    <span>Lanjut ke Foto Berikutnya</span>
                                    <ArrowRight size={18} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    className={`w-full flex items-center justify-center gap-2 py-2 text-label-sm transition-colors ${
                                        isLoveMode ? "text-rose-400 hover:text-rose-500" : isApresiasiMode ? "text-amber-500 hover:text-amber-600" : "text-outline hover:text-primary"
                                    }`}
                                >
                                    {isVotingMode ? "Lewati" : isLoveMode ? "Lanjut ke Cerita Cinta Berikutnya 💖" : isApresiasiMode ? "Lanjut ke Apresiasi Berikutnya 🌟" : "Lanjut ke Cerita Berikutnya"} <ChevronRight size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
