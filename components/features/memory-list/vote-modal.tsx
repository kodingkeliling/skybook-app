"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useVoterStore } from "@/stores/use-voter-store";
import { Users, X } from "lucide-react";

interface Memory {
    id: string;
    caption: string;
    imageUrl: string;
    createdAt: string;
}

interface VoteModalProps {
    memory: Memory;
    onClose: () => void;
}

interface VoteGroup {
    candidateName: string;
    count: number;
    voters: string[];
}

const CANDIDATES = ["Jamjam", "Dimy", "Ida", "Ryan", "Sidik"];

export default function VoteModal({ memory, onClose }: VoteModalProps) {
    const { voterName } = useVoterStore();
    const [votes, setVotes] = useState<VoteGroup[]>([]);
    const [showDetails, setShowDetails] = useState(false);
    const [isVoting, setIsVoting] = useState(false);

    useEffect(() => {
        // Initial fetch
        const fetchVotes = async () => {
            try {
                const res = await axios.get(`/api/memories/${memory.id}/votes`);
                setVotes(res.data);
            } catch (err) {
                console.error("Failed to fetch votes", err);
            }
        };
        fetchVotes();

        // Setup SSE for real-time updates
        const eventSource = new EventSource(`/api/memories/${memory.id}/votes/stream`);
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setVotes(data);
        };
        eventSource.onerror = (err) => {
            console.error("SSE error", err);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [memory.id]);

    const handleVote = async (candidateName: string) => {
        if (!voterName) return;
        setIsVoting(true);
        try {
            await axios.post(`/api/memories/${memory.id}/votes`, {
                candidateName,
                voterName,
            });
            // votes state will be updated via SSE automatically
        } catch (error) {
            console.error("Error voting:", error);
        } finally {
            setIsVoting(false);
        }
    };

    const getCandidateDetails = (candidateName: string) => {
        return votes.find(v => v.candidateName === candidateName);
    };

    const hasVotedFor = (candidateName: string) => {
        const det = getCandidateDetails(candidateName);
        return det?.voters.includes(voterName || "") ?? false;
    };

    // calculate all voters across all
    const allVoters = votes.flatMap(v => v.voters);

    return (
        <div className="fixed inset-0 z-[60] bg-inverse-surface/40 backdrop-blur-strong flex flex-col md:items-center justify-end md:justify-center p-0 md:p-4">
            <div className="bg-surface-container-lowest w-full max-w-md rounded-t-xl md:rounded-xl scrapbook-shadow flex flex-col animate-in slide-in-from-bottom-5 duration-300 relative max-h-[90vh]">

                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 w-8 h-8 flex items-center justify-center bg-black/20 text-white rounded-full hover:bg-black/40 transition-colors"
                >
                    <X size={18} />
                </button>

                <div className="overflow-y-auto no-scrollbar pb-6 rounded-xl">
                    <img
                        alt="Voting focus"
                        className="w-full aspect-[4/5] object-cover"
                        src={memory.imageUrl}
                        referrerPolicy="no-referrer"
                    />

                    <div className="px-6 pt-6 pb-2">
                        <p className="font-body-md text-on-surface-variant italic mb-6 text-center">
                            "{memory.caption}"
                        </p>

                        <div className="space-y-6">
                            <div>
                                <p className="text-label-sm font-bold text-on-secondary-container uppercase mb-3 text-center">
                                    Pilih Kandidat:
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {CANDIDATES.map((candidate, i) => {
                                        const details = getCandidateDetails(candidate);
                                        const isActive = hasVotedFor(candidate);
                                        const count = details?.count || 0;

                                        return (
                                            <button
                                                key={candidate}
                                                onClick={() => handleVote(candidate)}
                                                disabled={isVoting}
                                                className={`vote-btn relative border text-body-md py-3 px-3 rounded-xl transition-all duration-200
                                                    ${i === CANDIDATES.length - 1 && CANDIDATES.length % 2 !== 0 ? 'col-span-2' : ''}
                                                    ${isActive
                                                        ? 'bg-primary border-primary text-white shadow-md'
                                                        : 'border-outline-variant hover:bg-primary/5 hover:border-primary/30'
                                                    }
                                                `}
                                            >
                                                {candidate}
                                                <span className={`vote-badge transition-colors ${isActive ? 'bg-white text-primary' : ''}`}>
                                                    {count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    className="flex items-center justify-center w-full gap-2 text-primary text-label-sm font-bold hover:bg-primary/5 py-2 rounded-lg transition-colors"
                                    onClick={() => setShowDetails(!showDetails)}
                                >
                                    <Users size={16} />
                                    {showDetails ? "Sembunyikan detail vote" : "Lihat detail vote"}
                                </button>

                                {showDetails && (
                                    <div className="mt-4 p-3 bg-surface-container-low rounded-lg text-xs text-on-surface-variant animate-in fade-in slide-in-from-top-2">
                                        <p className="mb-2 font-bold">Dipilih oleh:</p>
                                        {votes.length > 0 ? (
                                            <div className="space-y-2">
                                                {votes.filter(v => v.count > 0).map(v => (
                                                    <div key={v.candidateName}>
                                                        <span className="font-semibold text-primary">{v.candidateName}:</span> {v.voters.join(', ')}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="italic">Belum ada yang memilih.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
