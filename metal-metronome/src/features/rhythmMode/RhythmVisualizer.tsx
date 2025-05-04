import React, { useEffect, useState } from 'react';
import { useRhythmContext } from '@/contexts/RhythmContext';
import { playBeat } from '@/lib/rhythmLogic';

const RhythmVisualizer: React.FC = () => {
    const { numerator, bpm, noteValue, isPlaying, displayMode } = useRhythmContext();
    const [currentStep, setCurrentStep] = useState(0);

    const noteValueFactor =
        noteValue === 'quarter' ? 1 :
        noteValue === 'eighth' ? 0.5 :
        0.75;

    const interval = (60_000 / bpm) * noteValueFactor;

    useEffect(() => {
        if (!isPlaying) return;
        const timer = setInterval(() => {
            setCurrentStep((prev) => {
                const next = (prev + 1) % numerator;
                playBeat();
                return next;
            });
        }, interval);
        return () => clearInterval(timer);
    }, [bpm, noteValue, isPlaying, numerator]);

    const MAX_WIDTH = 230; // 各パネルの最大幅に合わせて調整（1枚=460px, 2枚=230px）
    const MAX_DOT_SIZE = 24;
    const MIN_DOT_SIZE = 6;

    const spacing = Math.min(MAX_WIDTH / numerator, MAX_DOT_SIZE * 1.5);
    const dotSize = Math.max(MIN_DOT_SIZE, spacing * 0.6);

    const points = Array.from({ length: numerator }, (_, i) => {
        const isActive = currentStep === i;

        const baseStyle: React.CSSProperties = {
            width: dotSize,
            height: dotSize,
            backgroundColor: isActive ? 'rgb(239 68 68)' : 'white',
            borderRadius: '9999px',
            position: 'absolute',
            transition: 'all 0.1s ease',
        };

        if (displayMode === 'circle') {
            // パネルサイズが230pxとして計算（PartPanelがw-full h-full で制約される前提）
            const panelSize = 200;
            const margin = 10;
            const radius = (panelSize / 2) - (dotSize / 2) - margin;

            const angle = (360 / numerator) * i;
            const rad = (angle * Math.PI) / 180;
            const x = radius * Math.cos(rad);
            const y = radius * Math.sin(rad);
            return (
                <div
                    key={i}
                    style={{
                        ...baseStyle,
                        transform: `translate(${x}px, ${y}px)`
                    }}
                />
            );
        }

        if (displayMode === 'bar') {
            const x = i * spacing;
            return (
                <div
                    key={i}
                    style={{
                        ...baseStyle,
                        transform: `translate(${x}px, -50%)`,
                        top: '50%',
                    }}
                />
            );
        }

        if (displayMode === 'wave') {
            const x = i * spacing;
            const y = 20 * Math.sin((i / numerator) * 2 * Math.PI);
            return (
                <div
                    key={i}
                    style={{
                        ...baseStyle,
                        left: `${x}px`,
                        top: `calc(50% + ${y}px)`,
                    }}
                />
            );
        }

        return null;
    });

    if (displayMode === 'wave' || displayMode === 'bar') {
        return (
            <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                <div
                    className="relative"
                    style={{
                        width: `${spacing * numerator}px`,
                        height: '100%',
                    }}
                >
                    {points}
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {points}
        </div>
    );
};

export default RhythmVisualizer;
