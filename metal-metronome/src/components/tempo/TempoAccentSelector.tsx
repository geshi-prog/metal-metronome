/**
 * ファイル名：src/components/tempo/TempoAccentSelector.tsx
 * 目的：テンポ欄に対応する拍ごとのアクセント（強・中・弱・無）を設定するUI
 */

import React from "react";
import { useRhythmContext } from "@/contexts/RhythmContext";

const ACCENT_LABELS: Record<AccentType, string> = {
    strong: '強',
    normal: '中',
    weak: '弱',
    none: '無',
};

const ACCENT_ORDER: (keyof typeof ACCENT_LABELS)[] = ['strong', 'normal', 'weak', 'none'];

const TempoAccentSelector: React.FC = () => {
    const { numerator, accentLevels, setAccentLevels, isPlaying, currentAccentStep, } = useRhythmContext();

    const handleClick = (index: number) => {
        if (isPlaying) return;
        const current = accentLevels[index];
        const next =
            ACCENT_ORDER[(ACCENT_ORDER.indexOf(current) + 1) % ACCENT_ORDER.length];
        const updated = [...accentLevels];
        updated[index] = next;
        setAccentLevels(updated);
    };

    const toggleAccent = (index: number) => {
        const current = accentLevels[index];
        const next = ACCENT_ORDER[(ACCENT_ORDER.indexOf(current) + 1) % ACCENT_ORDER.length];
        const updated = [...accentLevels];
        updated[index] = next;
        setAccentLevels(updated);
    };

    type AccentType = 'accent' | 'normal' | 'ghost' | 'none';
    const getStyle = (level: AccentType, isActive: boolean) => {
        const base = "w-25 h-25 rounded-full bg-gradient-to-br from-gray-700 to-black border-2 border-gray-400 transition-transform text-white text-xl flex items-center justify-center shadow-[0_4px_8px_rgba(0,0,0,0.5)] hover:scale-125 focus:outline-none focus-visible:outline-white";
        const color =
            level === 'strong' ? 'bg-red-500 border-red-700' :
            level === 'normal' ? 'bg-orange-400 border-orange-600' :
            level === 'weak' ? 'bg-gray-400 border-gray-500' :
            'bg-black border-gray-600';

        const pulse = isActive && isPlaying ? 'animate-pulse ring-2 ring-yellow-300' : '';

        return `${base} ${color} ${pulse}`;
    };

    const chunked = [];
    for (let i = 0; i < numerator; i += 4) {
        chunked.push(accentLevels.slice(i, i + 4));
    }

    return (
        <div className="flex flex-col gap-2 mt-2">
            {chunked.map((group, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-2">
                    {group.map((level, i) => {
                        const index = rowIndex * 4 + i;
                        return (
                            <button
                                key={index}
                                onClick={() => toggleAccent(index)}
                                className={getStyle(level, currentAccentStep === index)}
                                title={`拍 ${index + 1}：${level}`}
                            >
                                {`拍 ${index + 1}：`}<br />{`${level}`}<br />{ACCENT_LABELS[level]}
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default TempoAccentSelector;
