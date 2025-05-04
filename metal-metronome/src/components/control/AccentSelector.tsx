/**
 * ファイル名：src/components/control/AccentSelector.tsx
 * 目的：音符や拍ごとに「強弱（アクセント・通常・ゴースト・無し）」を切り替えるUI
 *
 * 機能概要：
 * - 点のクリック／タップで状態を循環（●→○→◎→✕）
 * - 再生中もリアルタイムで変更可能
 *
 * 今後の拡張予定：
 * - アクセントの数値調整（より細かな音量制御）
 */

import React from 'react';
import { useRhythmContext } from '@/contexts/RhythmContext';

const ACCENT_ORDER: ('accent' | 'normal' | 'ghost' | 'none')[] = ['accent', 'normal', 'ghost', 'none'];

const AccentSelector: React.FC = () => {
    const {
        accentLevels,
        setAccentLevels,
        numerator,
        currentAccentStep,
        isPlaying,
    } = useRhythmContext();

    const toggleAccent = (index: number) => {
        const current = accentLevels[index];
        const next = ACCENT_ORDER[(ACCENT_ORDER.indexOf(current) + 1) % ACCENT_ORDER.length];
        const updated = [...accentLevels];
        updated[index] = next;
        setAccentLevels(updated);
    };

    const getStyle = (level: string, isActive: boolean) => {
        const base = "w-6 h-6 rounded-full border-2 transition-transform hover:scale-125";
        const color =
            level === 'accent' ? 'bg-red-500 border-red-700' :
            level === 'normal' ? 'bg-orange-400 border-orange-600' :
            level === 'ghost' ? 'bg-gray-400 border-gray-500' :
            'bg-black border-gray-600';

        const pulse = isActive && isPlaying ? 'animate-pulse ring-2 ring-yellow-300' : '';

        return `${base} ${color} ${pulse}`;
    };

    return (
        <div className="flex justify-center gap-2 mt-2">
            {accentLevels.slice(0, numerator).map((level, i) => (
                <button
                    key={i}
                    onClick={() => toggleAccent(i)}
                    className={getStyle(level, currentAccentStep === i)}
                    title={`拍 ${i + 1}：${level}`}
                />
            ))}
        </div>
    );
};

export default AccentSelector;
