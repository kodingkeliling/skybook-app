import React, { useState, useEffect } from "react";
import axios from "axios";
import { useVoterStore } from "@/stores/use-voter-store";
import { Users, X, ChevronUp, ChevronRight, ChevronLeft, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface Memory {
    id: string;
    caption: string;
    imageUrl: string;
    createdAt: string;
}

interface VoteGroup {
    candidateName: string;
    count: number;
    voters: string[];
}

const CANDIDATES = ["Jamjam", "Dimy", "Ida", "Ryan", "Sidik"];

export default function RandomVoteModal({ onClose }: { onClose: () => void }) {
    const { voterName } = useVoterStore();
    const [memories, setMemories] = useState<Memory[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [votes, setVotes] = useState<VoteGroup[]>([]);
    const [showDetails, setShowDetails] = useState(false);
    const [isVoting, setIsVoting] = useState(false);
    const [votingCandidate, setVotingCandidate] = useState<string | null>(null);
    const [votesLoading, setVotesLoading] = useState(true);

    useEffect(() => {
        const fetchMemories = async () => {
            try {
                const res = await axios.get("/api/memories");
                const shuffled = [...res.data].sort(() => 0.5 - Math.random());
                setMemories(shuffled);
            } catch {
                toast.error("Gagal mengambil data foto.");
                onClose();
            } finally {
                setLoading(false);
            }
        };
        fetchMemories();
    }, [onClose]);

    useEffect(() => {
        if (memories.length > 0) {
            setShowDetails(false);
            const memId = memories[currentIndex].id;
            setVotesLoading(true);

            // Establish real-time EventSource listener
            const eventSource = new EventSource(`/api/memories/${memId}/votes/stream`);

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (Array.isArray(data)) {
                        setVotes(data);
                        setVotesLoading(false);
                    }
                } catch {
                    // ignore connected and other non-JSON events
                }
            };

            eventSource.onerror = (err) => {
                console.error("SSE stream fail. Falling back to REST fetch:", err);
                axios.get(`/api/memories/${memId}/votes`)
                    .then((res) => {
                        setVotes(res.data);
                        setVotesLoading(false);
                    })
                    .catch(() => { });
            };

            return () => {
                eventSource.close();
            };
        }
    }, [currentIndex, memories]);

    const handleVote = async (candidateName: string) => {
        if (!voterName) {
            toast.error("Nama kamu belum tersimpan.");
            return;
        }
        setIsVoting(true);
        setVotingCandidate(candidateName);
        const memId = memories[currentIndex].id;
        try {
            await axios.post(`/api/memories/${memId}/votes`, {
                candidateName,
                voterName,
            });
            // Instantly fetch updated votes for immediate visual feedback
            const res = await axios.get(`/api/memories/${memId}/votes`);
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
        return (
            <div className="fixed inset-0 z-[70] bg-inverse-surface/50 backdrop-blur-strong flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3" />
                    <p className="font-body-md">Memuat foto...</p>
                </div>
            </div>
        );
    }

    if (memories.length === 0) return null;

    const current = memories[currentIndex];

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < memories.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            toast.success("Semua foto sudah ditampilkan!");
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
                            style={{ width: `${((currentIndex) / memories.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-white text-xs font-bold shrink-0">
                        {currentIndex + 1} / {memories.length}
                    </span>
                </div>

                {/* Card */}
                <div className="bg-surface-container-lowest rounded-xl paper-shadow overflow-hidden max-h-[85vh] overflow-y-auto no-scrollbar">
                    <div className="w-full bg-surface-container-low flex items-center justify-center border-b border-outline-variant/10 overflow-hidden">
                        <img
                            alt="Foto Voting"
                            src={current.imageUrl}
                            className="w-full h-auto max-h-[45vh] md:max-h-[50vh] object-contain"
                            referrerPolicy="no-referrer"
                        />
                    </div>


                    <div className="p-5 space-y-4">
                        <p className="font-body-md text-on-surface-variant italic text-center text-sm md:text-base">"{current.caption}"</p>

                        <div>
                            <p className="text-label-sm font-bold text-on-secondary-container uppercase mb-3">Pilih Kandidat:</p>
                            {votesLoading ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {CANDIDATES.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`animate-pulse h-10 rounded-lg ${i === CANDIDATES.length - 1 && CANDIDATES.length % 2 !== 0 ? 'col-span-2' : ''
                                                }`}
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
                                                    ${i === CANDIDATES.length - 1 && CANDIDATES.length % 2 !== 0 ? 'col-span-2' : ''}
                                                    ${isActive
                                                        ? 'bg-primary border-primary text-white active font-bold'
                                                        : 'border-outline-variant hover:bg-primary/5 text-on-surface'
                                                    }
                                                    ${isVoting && !isThisButtonLoading ? 'opacity-50 cursor-not-allowed' : ''}
                                                `}
                                            >
                                                {isThisButtonLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                                                {candidate}
                                                {!isThisButtonLoading && (
                                                    <span className={`vote-badge ${isActive ? 'bg-white text-primary' : ''}`}>{count}</span>
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
                                                    <span className="font-semibold text-primary">{v.candidateName}:</span> {v.voters.join(', ')}
                                                </div>
                                            ))
                                            : <span>Belum ada yang menebak.</span>
                                        }
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-2 space-y-2">
                            {currentIndex > 0 && (
                                <button
                                    onClick={handlePrevious}
                                    disabled={votesLoading}
                                    className="w-full flex items-center justify-center gap-2 py-2 text-outline text-label-sm hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={16} />
                                    <span>Kembali ke Foto Sebelumnya</span>
                                </button>
                            )}
                            {votesLoading ? (
                                <div className="animate-pulse h-10 w-full rounded-xl" style={{ backgroundColor: "rgba(115, 118, 134, 0.15)" }} />
                            ) : hasAnyVoteFromMe ? (
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
                                    className="w-full flex items-center justify-center gap-2 py-2 text-outline text-label-sm hover:text-primary transition-colors"
                                >
                                    Lewati <ChevronRight size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
