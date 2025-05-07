import { useEffect, useRef } from 'react';
import { useRhythmContext } from '@/contexts/RhythmContext';
import { playTempoClick, playBeat } from '@/lib/rhythmLogic';

export const usePlaybackLoop = () => {
    const {
        isPlaying,
        bpm,
        noteValue,
        accentLevels,
        numerator,
        setCurrentAccentStep
    } = useRhythmContext();

    const stepRef = useRef(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isPlaying) {
            if (timerRef.current) clearInterval(timerRef.current);
            stepRef.current = 0;
            return;
        }

        const noteValueFactor = noteValue === 'quarter' ? 1 :
                                                        noteValue === 'eighth' ? 0.5 : 0.75;
        const interval = (60_000 / bpm) * noteValueFactor;

        timerRef.current = setInterval(() => {
            const currentStep = stepRef.current % numerator;
            const accent = accentLevels[currentStep] ?? 'normal';

            setCurrentAccentStep(currentStep);
            playTempoClick(accent);    // メトロノーム音
            playBeat();                            // リズム音（現状すべてkickとか）

            stepRef.current++;
        }, interval);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPlaying, bpm, noteValue, accentLevels, numerator]);
};