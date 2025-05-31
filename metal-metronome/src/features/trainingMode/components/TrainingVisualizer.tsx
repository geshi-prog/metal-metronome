// src/features/trainingMode/components/TrainingVisualizer.tsx

import React, { useState } from 'react';
import { useTrainingContext } from '@/contexts/TrainingContext';

type Props = {
    sectionIndex: number;
    partIndex: number;
    beatIndex: number;
    volumes: number[];
    onVolumesChange: (v: number[]) => void;
    m: number;
};

const TrainingVisualizer: React.FC<Props> = ({
    sectionIndex,
    partIndex,
    beatIndex,
    volumes,
    onVolumesChange,
    m,
}) => {
    const { sections, parts, isPlaying } = useTrainingContext();
    const [selectedStep, setSelectedStep] = useState<number | null>(null);

    const MAX_DOT_SIZE = 24;
    const displayMode = 'rotary';

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedStep === null) return;
        const updated = [...volumes];
        updated[selectedStep] = parseFloat(e.target.value);
        onVolumesChange(updated);
    };

    if (displayMode === 'rotary') {
        const panelSize = 200;
        const centerX = panelSize / 2;
        const centerY = panelSize / 2;
        const margin = 10;
        const radius = (panelSize / 2) - MAX_DOT_SIZE / 2 - margin;

        return (
            <div className="flex flex-col items-center w-full h-full overflow-hidden">
                <svg width={panelSize} height={panelSize} viewBox={`0 0 ${panelSize} ${panelSize}`}>
                    <circle cx={centerX} cy={centerY} r={radius} stroke="gray" strokeWidth={1} fill="none" />
                    {Array.from({ length: m }, (_, i) => {
                        const theta = ((360 / m) * i - 90) * (Math.PI / 180);
                        const x = centerX + radius * Math.cos(theta);
                        const y = centerY + radius * Math.sin(theta);
                        const isSelected = selectedStep === i;
                        const volume = volumes[i] ?? 1.0;
                        const fillColor = isSelected ? 'yellow' : `rgba(255,255,255,${volume})`;

                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r={MAX_DOT_SIZE / 2}
                                fill={fillColor}
                                onClick={isPlaying ? undefined : () => setSelectedStep(i === selectedStep ? null : i)}
                                style={{ cursor: 'pointer' }}
                            />
                        );
                    })}
                </svg>

                {selectedStep !== null && (
                    <div className="flex flex-col items-center gap-2 mt-2">
                        <select
                            value={selectedStep}
                            onChange={(e) => setSelectedStep(parseInt(e.target.value))}
                            className="mb-1 px-2 py-1 bg-gray-800 text-white rounded border border-gray-500"
                        >
                            {Array.from({ length: m }, (_, i) => (
                                <option key={i} value={i}>Step {i + 1}</option>
                            ))}
                        </select>
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={volumes[selectedStep] ?? 1.0}
                            onChange={handleVolumeChange}
                            className="w-32 accent-blue-400"
                        />
                        <select
                            value=""
                            onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (selectedStep === null) return;
                                const updated = [...volumes];
                                updated[selectedStep] = value;
                                onVolumesChange(updated);
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

    return null;
};

export default TrainingVisualizer;
