"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useVoterStore } from "@/stores/use-voter-store";
import { Users, X, ChevronUp, ChevronRight } from "lucide-react";
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

    const fetchVotes = useCallback(async (memId: string) => {
        try {
            const res = await axios.get(`/api/memories/${memId}/votes`);
            setVotes(res.data);
        } catch {
            // silent
        }
    }, []);

    useEffect(() => {
        if (memories.length > 0) {
            setShowDetails(false);
            fetchVotes(memories[currentIndex].id);
        }
    }, [currentIndex, memories, fetchVotes]);

    const handleVote = async (candidateName: string) => {
        if (!voterName) {
            toast.error("Nama kamu belum tersimpan.");
            return;
        }
        setIsVoting(true);
        try {
            await axios.post(`/api/memories/${memories[currentIndex].id}/votes`, {
                candidateName,
                voterName,
            });
            await fetchVotes(memories[currentIndex].id);
            toast.success(`Ditebak: ${candidateName}!`);
            // Auto-advance to next after 700ms
            setTimeout(() => {
                if (currentIndex < memories.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                } else {
                    toast.success("Semua foto sudah ditebak!");
                    onClose();
                }
            }, 700);
        } catch {
            toast.error("Gagal melakukan vote.");
        } finally {
            setIsVoting(false);
        }
    };

    const getCandidateCount = (name: string) =>
        votes.find(v => v.candidateName === name)?.count || 0;

    const hasVotedFor = (name: string) =>
        votes.find(v => v.candidateName === name)?.voters.includes(voterName || "") ?? false;

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

    return (
        <div className="fixed inset-0 z-[70] bg-inverse-surface/50 backdrop-blur-strong flex flex-col md:items-center justify-end md:justify-center p-4">
            <div className="relative w-full max-w-sm mx-auto animate-in zoom-in-95 duration-300">
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
                <div className="bg-surface-container-lowest rounded-xl paper-shadow overflow-hidden max-h-[80vh] overflow-y-auto no-scrollbar">
                    <img
                        alt="Foto Voting"
                        src={current.imageUrl}
                        className="w-full object-cover aspect-[4/5]"
                        referrerPolicy="no-referrer"
                    />

                    <div className="p-5 space-y-4">
                        <p className="font-body-md text-on-surface-variant italic text-center">"{current.caption}"</p>

                        <div>
                            <p className="text-label-sm font-bold text-on-secondary-container uppercase mb-3">Pilih Kandidat:</p>
                            <div className="grid grid-cols-2 gap-3">
                                {CANDIDATES.map((candidate, i) => {
                                    const isActive = hasVotedFor(candidate);
                                    const count = getCandidateCount(candidate);
                                    return (
                                        <button
                                            key={candidate}
                                            onClick={() => handleVote(candidate)}
                                            disabled={isVoting}
                                            className={`vote-btn relative border text-body-md py-2 px-3 rounded-lg transition-colors font-body-md
                                                ${i === CANDIDATES.length - 1 && CANDIDATES.length % 2 !== 0 ? 'col-span-2' : ''}
                                                ${isActive
                                                    ? 'bg-primary border-primary text-white active'
                                                    : 'border-outline-variant hover:bg-primary/5 text-on-surface'
                                                }
                                            `}
                                        >
                                            {candidate}
                                            <span className={`vote-badge ${isActive ? 'bg-white text-primary' : ''}`}>{count}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <button
                                className="flex items-center gap-1 text-primary text-label-sm font-bold hover:underline"
                                onClick={() => setShowDetails(!showDetails)}
                            >
                                {showDetails ? <ChevronUp size={16} /> : <Users size={16} />}
                                {showDetails ? "Sembunyikan detail" : "Lihat detail vote"}
                            </button>
                            {showDetails && (
                                <div className="pt-2 border-t border-outline-variant/20 text-[11px] text-on-surface-variant">
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

                        <button
                            onClick={() => {
                                if (currentIndex < memories.length - 1) {
                                    setCurrentIndex(prev => prev + 1);
                                } else {
                                    toast.info("Semua foto sudah ditampilkan!");
                                    onClose();
                                }
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2 text-outline text-label-sm hover:text-primary transition-colors"
                        >
                            Lewati <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
