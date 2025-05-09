// src/features/rhythmMode/RhythmUnitControl.tsx
import React from 'react';
import { useRhythmContext } from '@/contexts/RhythmContext';

type Props = {
    partIndex: number;
};

const RhythmUnitControl: React.FC<Props> = ({ partIndex }) => {
    const { rhythmUnits, setRhythmUnits, isPlaying } = useRhythmContext();
    const unit = rhythmUnits[partIndex];

    const handleChange = (key: 'n' | 'm', value: number) => {
        const updated = [...rhythmUnits];
        updated[partIndex] = { ...unit, [key]: value };
        setRhythmUnits(updated);
    };

    return (
        <div className="flex gap-2 text-sm text-white items-center">
            <input
                type="number"
                min={1}
                max={8}
                value={unit.n}
                onChange={(e) => handleChange('n', parseInt(e.target.value))}
                disabled={isPlaying}
                className="w-12 bg-gray-700 rounded px-1 text-center"
            />
            <span>拍</span>
            <input
                type="number"
                min={1}
                max={32}
                value={unit.m}
                onChange={(e) => handleChange('m', parseInt(e.target.value))}
                disabled={isPlaying}
                className="w-12 bg-gray-700 rounded px-1 text-center"
            />
            <span>連</span>
        </div>
    );
};

export default RhythmUnitControl;
