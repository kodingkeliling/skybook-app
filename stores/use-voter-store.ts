import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VoterState {
    voterName: string | null;
    setVoterName: (name: string) => void;
    clearVoterName: () => void;
}

export const useVoterStore = create<VoterState>()(
    persist(
        (set) => ({
            voterName: null,
            setVoterName: (name) => set({ voterName: name }),
            clearVoterName: () => set({ voterName: null }),
        }),
        {
            name: 'voter-storage',
        }
    )
);
