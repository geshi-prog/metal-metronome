import React from 'react';
import { useRhythmContext } from '@/contexts/RhythmContext';

const RhythmVisualizer: React.FC = () => {
    const { numerator, displayMode, currentAccentStep } = useRhythmContext();

    const MAX_WIDTH = 230;
    const MAX_DOT_SIZE = 24;
    const MIN_DOT_SIZE = 6;

    const spacing = Math.min(MAX_WIDTH / numerator, MAX_DOT_SIZE * 1.5);
    const dotSize = Math.max(MIN_DOT_SIZE, spacing * 0.6);

    const points = Array.from({ length: numerator }, (_, i) => {
        const isActive = currentAccentStep === i;

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

            // 🔄 上からスタート（-90度）
            const angle = (360 / numerator) * i - 90;
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

    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <div
                className="relative"
                style={{
                    width: displayMode === 'circle' ? '100%' : `${spacing * numerator}px`,
                    height: '100%',
                }}
            >
                {points}
            </div>
        </div>
    );
};

export default RhythmVisualizer;
