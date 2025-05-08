import React, { useState } from 'react';
import { useRhythmContext } from '@/contexts/RhythmContext';

type Props = {
    partIndex: number;
};

const RhythmVisualizer: React.FC<Props> = ({ partIndex }) => {
    const {
        rhythmUnits,
        currentRhythmSteps,
        displayMode,
        rhythmVolumes,
        setRhythmVolumes,
    } = useRhythmContext();

    const { m } = rhythmUnits[partIndex];
    const currentStep = currentRhythmSteps[partIndex];
    const [selectedStep, setSelectedStep] = useState<number | null>(null);
    const volumes = rhythmVolumes[partIndex] || [];

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedStep === null) return;
        const value = parseFloat(e.target.value);
        const updated = [...rhythmVolumes];
        updated[partIndex] = [...updated[partIndex]];
        updated[partIndex][selectedStep] = value;
        setRhythmVolumes(updated);
    };

    const MAX_WIDTH = 230;
    const MAX_DOT_SIZE = 24;
    const MIN_DOT_SIZE = 6;
    const spacing = Math.min(MAX_WIDTH / m, MAX_DOT_SIZE * 1.5);

    // rotary モードだけ別に return する！
    if (displayMode === 'rotary') {
        const panelSize = 200;
        const centerX = panelSize / 2;
        const centerY = panelSize / 2;
        const margin = 10;
        const radius = (panelSize / 2) - MAX_DOT_SIZE / 2 - margin;
        const anglePerStep = (360 / m);
        const angle = (anglePerStep * currentStep - 90) * (Math.PI / 180);
        const needleX = radius * Math.cos(angle);
        const needleY = radius * Math.sin(angle);

        return (
            <div className="flex flex-col items-center w-full h-full overflow-hidden">
                <svg
                    width={panelSize}
                    height={panelSize}
                    viewBox={`0 0 ${panelSize} ${panelSize}`}
                >
                    <circle
                        cx={centerX}
                        cy={centerY}
                        r={radius}
                        stroke="gray"
                        strokeWidth={1}
                        fill="none"
                    />
                    {Array.from({ length: m }, (_, i) => {
                        const theta = ((360 / m) * i - 90) * (Math.PI / 180);
                        const x = centerX + radius * Math.cos(theta);
                        const y = centerY + radius * Math.sin(theta);
                        const isSelected = selectedStep === i;
                        const volume = volumes[i] ?? 1.0;
                        const opacity = volume;
                        const fillColor = isSelected ? 'yellow' : `rgba(255,255,255,${opacity})`;

                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r={MAX_DOT_SIZE / 2}
                                fill={fillColor}
                                onClick={() => setSelectedStep(i === selectedStep ? null : i)}
                                style={{ cursor: 'pointer' }}
                            />
                        );
                    })}
                    <line
                        x1={centerX}
                        y1={centerY}
                        x2={centerX + needleX}
                        y2={centerY + needleY}
                        stroke="red"
                        strokeWidth={2}
                    />
                </svg>

                {/* スライダー & プリセット */}
                {selectedStep !== null && (
                    <div className="flex flex-col items-center gap-2 mt-2">
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={rhythmVolumes[partIndex][selectedStep]}
                            onChange={handleVolumeChange}
                            className="w-32 accent-blue-400"
                        />
                        <select
                            value=""
                            onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (selectedStep === null) return;
                                const updated = [...rhythmVolumes];
                                updated[partIndex] = [...updated[partIndex]];
                                updated[partIndex][selectedStep] = value;
                                setRhythmVolumes(updated);
                            }}
                            className="mt-2 px-2 py-1 bg-gray-800 text-white rounded border border-gray-500"
                        >
                            <option value="" disabled>プリセット</option>
                            <option value={1.0}>f</option>
                            <option value={0.75}>mf</option>
                            <option value={0.5}>p</option>
                            <option value={0.25}>pp</option>
                            <option value={0}>×</option>
                        </select>
                    </div>
                )}
            </div>
        );
    }

    // その他（circle, bar, wave）
    const points = Array.from({ length: m }, (_, i) => {
        const isActive = currentStep === i;
        const isSelected = selectedStep === i;
        const volume = volumes[i] ?? 1.0;
        const dotSize = Math.max(MIN_DOT_SIZE, MAX_DOT_SIZE);
        const opacity = volume;

        const baseStyle: React.CSSProperties = {
            width: dotSize,
            height: dotSize,
            backgroundColor: isSelected ? 'yellow'
                            : isActive ? 'rgb(239,68,68)'
                            : `rgba(255, 255, 255, ${opacity})`,
            borderRadius: '9999px',
            position: 'absolute',
            transition: 'all 0.1s ease',
            cursor: 'pointer',
        };

        const handleClick = () => {
            setSelectedStep(i === selectedStep ? null : i);
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
                    onClick={handleClick}
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
                    onClick={handleClick}
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
                    onClick={handleClick}
                />
            );
        }

        return null;
    });

    return (
        <div className="flex flex-col items-center w-full h-full overflow-hidden">
            <div
                className="relative flex-1 w-full flex items-center justify-center"
                style={{
                    width: displayMode === 'circle' ? '100%' : `${spacing * m}px`,
                }}
            >
                {points}
            </div>
            {selectedStep !== null && (
                <div className="flex flex-col items-center gap-2 mt-2">
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={rhythmVolumes[partIndex][selectedStep]}
                        onChange={handleVolumeChange}
                        className="w-32 accent-blue-400"
                    />
                    <select
                        value=""
                        onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (selectedStep === null) return;
                            const updated = [...rhythmVolumes];
                            updated[partIndex] = [...updated[partIndex]];
                            updated[partIndex][selectedStep] = value;
                            setRhythmVolumes(updated);
                        }}
                        className="mt-2 px-2 py-1 bg-gray-800 text-white rounded border border-gray-500"
                    >
                        <option value="" disabled>プリセット</option>
                        <option value={1.0}>f</option>
                        <option value={0.75}>mf</option>
                        <option value={0.5}>p</option>
                        <option value={0.25}>pp</option>
                        <option value={0}>×</option>
                    </select>
                </div>
            )}
        </div>
    );
};

export default RhythmVisualizer;
