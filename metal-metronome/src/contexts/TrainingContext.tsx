// src/contexts/TrainingContext.tsx

import React, { createContext, useContext, useState } from 'react';

type TrainingContextType = {
    bpm: number;
    setBpm: (value: number) => void;
    numerator: number;
    setNumerator: (value: number) => void;
    denominator: 1 | 2 | 4 | 8 | 16;
    setDenominator: (value: 1 | 2 | 4 | 8 | 16) => void;
    isPlaying: boolean;
    setIsPlaying: (value: boolean) => void;
};

const TrainingContext = createContext<TrainingContextType | null>(null);

export const useTrainingContext = () => {
    const ctx = useContext(TrainingContext);
    if (!ctx) throw new Error('useTrainingContext must be used within TrainingProvider');
    return ctx;
};

export const TrainingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [bpm, setBpm] = useState(120);
    const [numerator, setNumerator] = useState(4);
    const [denominator, setDenominator] = useState<1 | 2 | 4 | 8 | 16>(4);
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <TrainingContext.Provider
            value={{
                bpm, setBpm,
                numerator, setNumerator,
                denominator, setDenominator,
                isPlaying, setIsPlaying
            }}
        >
            {children}
        </TrainingContext.Provider>
    );
};
