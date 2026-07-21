"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import MemoryCard from "@/components/features/memory-card";
import { Loader2 } from "lucide-react";

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
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-on-surface-variant font-body-md animate-pulse">Memuat foto...</p>
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
