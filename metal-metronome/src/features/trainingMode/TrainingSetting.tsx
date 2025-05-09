/**
 * ファイル名：src/features/trainingMode/TrainingSetting.tsx
 * 目的：トレーニングモードのテンポ、拍子、音価などの基本設定UIを提供する
 */

import React from 'react';
import { useTrainingContext } from '@/contexts/TrainingContext';

const TrainingSetting: React.FC = () => {
    const {
        bpm, setBpm,
        numerator, setNumerator,
        denominator, setDenominator,
        noteValue, setNoteValue,
    } = useTrainingContext();

    return (
        <div className="flex flex-col gap-4 p-4 bg-gray-900 rounded-lg shadow-md w-full max-w-md">
            {/* BPM */}
            <div className="flex items-center gap-4">
                <label className="w-20">BPM：</label>
                <input
                    type="number"
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="flex-1 p-1 rounded bg-gray-800 text-white border border-gray-600"
                />
            </div>

            {/* 拍子 */}
            <div className="flex items-center gap-2">
                <label>拍子：</label>
                <select
                    value={numerator}
                    onChange={(e) => setNumerator(parseInt(e.target.value))}
                    className="p-1 bg-gray-800 text-white rounded border border-gray-600"
                >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>
                <span>/</span>
                <select
                    value={denominator}
                    onChange={(e) => setDenominator(parseInt(e.target.value) as 1 | 2 | 4 | 8 | 16)}
                    className="p-1 bg-gray-800 text-white rounded border border-gray-600"
                >
                    {[1, 2, 4, 8, 16].map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>

            {/* 音価 */}
            <div className="flex items-center gap-4">
                <label className="w-20">音価：</label>
                <select
                    value={noteValue}
                    onChange={(e) => setNoteValue(e.target.value as 'quarter' | 'eighth' | 'dotted-eighth')}
                    className="flex-1 p-1 bg-gray-800 text-white rounded border border-gray-600"
                >
                    <option value="quarter">♩ (4分)</option>
                    <option value="eighth">♪ (8分)</option>
                    <option value="dotted-eighth">♪. (付点8分)</option>
                </select>
            </div>
        </div>
    );
};

export default TrainingSetting;
