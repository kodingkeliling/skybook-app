import MemoryCaption from "@/components/features/memory-caption";
import MemoryComments from "@/components/features/memory-comments";

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

export default function MemoryCard({ memory }: MemoryCardProps) {
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
                <MemoryCaption
                    text={memory.caption}
                    className="font-body-md text-on-surface-variant italic"
                />

                <div className="mt-5">
                    <MemoryComments
                        memoryId={memory.id}
                        initialComments={memory.comments ?? []}
                    />
                </div>
            </div>
        </div>
    );
}
