"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import MemoryCard from "@/components/features/memory-card";

interface Memory {
    id: string;
    caption: string;
    imageUrl: string;
    createdAt: string;
}

interface MemoryListProps {
    refreshKey: number;
}

export default function MemoryList({ refreshKey }: MemoryListProps) {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMemories = async () => {
        try {
            const response = await axios.get("/api/memories");
            setMemories(response.data);
        } catch (error) {
            console.error("Failed to fetch memories", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMemories();
    }, [refreshKey]);

    if (isLoading) {
        return (
            <div className="masonry-grid">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="memory-card bg-surface-container-lowest p-3 rounded-xl paper-shadow border border-outline-variant/20 animate-pulse"
                    >
                        <div className="bg-surface-container-high rounded-lg mb-4 w-full" style={{ height: i % 2 === 0 ? "280px" : "200px" }} />
                        <div className="px-2 pb-2">
                            <div className="h-4 bg-surface-container-high rounded w-3/4 mb-2" />
                            <div className="h-4 bg-surface-container-high rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (memories.length === 0) {
        return (
            <div className="text-center py-20 border-2 border-dashed border-outline-variant/30 rounded-xl">
                <p className="text-on-surface-variant font-body-md">
                    Belum ada memori tersimpan. Ayo upload foto pertama!
                </p>
            </div>
        );
    }

    return (
        <div className="masonry-grid">
            {memories.map((memory) => (
                <MemoryCard
                    key={memory.id}
                    memory={memory}
                />
            ))}
        </div>
    );
}
