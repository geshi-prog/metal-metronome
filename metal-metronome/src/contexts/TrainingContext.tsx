// src/contexts/TrainingContext.tsx

import React, { createContext, useContext, useState } from 'react';
import { Section } from '@/types/training';

type TrainingContextType = {
    sections: Section[];
    setSections: (s: Section[]) => void;
    currentSectionIndex: number;
    setCurrentSectionIndex: (i: number) => void;
    isPlaying: boolean;
    setIsPlaying: (b: boolean) => void;
};

const TrainingContext = createContext<TrainingContextType | null>(null);

export const useTrainingContext = () => {
    const ctx = useContext(TrainingContext);
    if (!ctx) throw new Error('TrainingContext must be used within TrainingProvider');
    return ctx;
};

export const TrainingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sections, setSections] = useState<Section[]>([]);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <TrainingContext.Provider value={{
            sections,
            setSections,
            currentSectionIndex,
            setCurrentSectionIndex,
            isPlaying,
            setIsPlaying,
        }}>
            {children}
        </TrainingContext.Provider>
    );
};
