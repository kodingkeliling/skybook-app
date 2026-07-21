"use client";

import { useEffect, useState } from "react";
import MemoryForm from "@/components/features/memory-form";
import MemoryList from "@/components/features/memory-list";
import RandomVoteModal from "@/components/features/random-vote-modal";
import { useVoterStore } from "@/stores/use-voter-store";
import { Play } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { voterName, setVoterName } = useVoterStore();
  const [showNameModal, setShowNameModal] = useState(false);
  const [showRandomVote, setShowRandomVote] = useState(false);
  const [inputName, setInputName] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!voterName) {
      setShowNameModal(true);
    }
  }, [voterName]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleSaveName = () => {
    if (inputName.trim() === "") {
      toast.error("Silakan masukkan nama panggilan kamu :)");
      return;
    }
    setVoterName(inputName.trim());
    setShowNameModal(false);
  };

  if (!isClient) return null;

  return (
    <main className="max-w-container-max-width mx-auto px-margin-mobile md:px-margin-desktop py-12">
      <div className="flex flex-col items-center gap-4 mb-12">
        <img alt="Skybook Logo" className="h-16 w-16" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6WHca2xBvrLFfzPVz7j1xzPdu9IL2Kdb9sMyZgGbDud6M-hAAY62zasamdrdZ1rGwnkSozAmdsiaHwu-HMl52ruoSf4bQvwge8_LFWITHzmRC5gUH5eOdV3MBIQ5RsW-0BOfDMFT0WR6WmocJfrLjkNNxMMXWvnP2XQTGSXOinybCbtaa4qxQYxcMMzPpE_MTRCH5KjBrLCb4RdGERtFQiH63NzNEjJDcqzlCKk_ZQmU_yp3hM2FbO4FdY4tMWnz9yq1Txy_2T2Y" />
        <span className="font-display text-headline-lg font-bold text-primary">Skybook</span>
      </div>

      <section className="flex flex-col items-center text-center mb-12 space-y-6">
        <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-primary max-w-3xl">
          Setiap gambar ada cerita. Tunjukan pesona kalian ke isi kantor Skyshi
        </h1>
        <p className="font-body-lg text-on-surface-variant max-w-xl">
          Kira-kira foto masa kecil ini milik siapa saja?
        </p>
      </section>

      <div className="flex flex-col gap-2 md:flex-row justify-between items-center mb-8 border-b border-outline-variant/30 pb-4">
        <h2 className="font-display text-headline-md text-on-surface">Tebak Siapa Ini?</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRandomVote(true)}
            className="flex items-center gap-1 font-label-sm px-4 py-2 bg-primary/10 text-primary border border-primary/20 font-bold rounded-lg hover:bg-primary/20 transition-all shadow-sm"
          >
            <Play size={18} />
            <span className="">Mulai Voting</span>
          </button>
          <MemoryForm onSuccess={handleRefresh} />
        </div>
      </div>

      <MemoryList refreshKey={refreshKey} />

      {showRandomVote && (
        <RandomVoteModal onClose={() => setShowRandomVote(false)} />
      )}

      {showNameModal && (
        <div className="fixed inset-0 z-[60] bg-inverse-surface/40 backdrop-blur-strong flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-xl scrapbook-shadow animate-in fade-in zoom-in duration-300 p-8 flex flex-col items-center text-center">
            <h2 className="font-display text-headline-md text-primary mb-2">Halo!</h2>
            <p className="font-body-md text-on-surface-variant mb-6">
              Sebelum mulai ngevote, kasih tau nama panggilan kamu ya.
            </p>
            <input
              type="text"
              placeholder="Nama Panggilan"
              className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 rounded-t-xl p-4 font-body-md text-on-surface placeholder:text-outline transition-all focus:bg-surface-container mb-6"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            />
            <button
              onClick={handleSaveName}
              className="w-full bg-primary text-on-primary py-3 rounded-xl font-label-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-md"
            >
              Mulai Voting
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
