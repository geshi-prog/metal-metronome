import React from 'react';
import { useRhythmContext } from '@/contexts/RhythmContext';

type Props = {
    partIndex: number;
};

const RhythmVisualizer: React.FC<Props> = ({ partIndex }) => {
    const {
        rhythmUnits,
        currentRhythmSteps,
        displayMode,
    } = useRhythmContext();

    const { m } = rhythmUnits[partIndex];
    const currentStep = currentRhythmSteps[partIndex];

    const MAX_WIDTH = 230;
    const MAX_DOT_SIZE = 24;
    const MIN_DOT_SIZE = 6;

    const spacing = Math.min(MAX_WIDTH / m, MAX_DOT_SIZE * 1.5);
    const dotSize = Math.max(MIN_DOT_SIZE, spacing * 0.6);

    const points = Array.from({ length: m }, (_, i) => {
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
            const panelSize = 200;
            const margin = 10;
            const radius = (panelSize / 2) - (dotSize / 2) - margin;

            const angle = (360 / m) * i - 90;
            const rad = (angle * Math.PI) / 180;
            const x = radius * Math.cos(rad);
            const y = radius * Math.sin(rad);

            return (
                <div
                    key={i}
                    style={{
                        ...baseStyle,
                        left: '50%',
                        top: '50%',
                        transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
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
                        left: `${x}px`,
                        top: '50%',
                        transform: 'translateY(-50%)',
                    }}
                />
            );
        }

        if (displayMode === 'wave') {
            const x = i * spacing;
            const y = 20 * Math.sin((i / m) * 2 * Math.PI);
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

    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <div
                className="relative"
                style={{
                    width: displayMode === 'circle' ? '100%' : `${spacing * m}px`,
                    height: '100%',
                }}
            >
                {points}
            </div>
        </div>
    );
};

export default RhythmVisualizer;
