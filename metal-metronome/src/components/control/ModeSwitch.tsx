/**
 * ファイル名：src/components/control/ModeSwitch.tsx
 * 目的：リズムモード ↔ 小節モード の画面切り替えボタン
 *
 * 機能概要：
 * - 現在のモード状態を表示
 * - 切替時の画面遷移（React Routerなどと連携予定）
 */
import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useRhythmContext } from '@/contexts/RhythmContext';
import { useTrainingContext } from '@/contexts/TrainingContext';

const ModeSwitchFooter: React.FC = () => {
    const { mode, setMode } = useAppContext();
    const { isPlaying: isRhythmPlaying } = useRhythmContext();
    const { isPlaying: isTrainingPlaying } = useTrainingContext();

    const isPlaying = isRhythmPlaying || isTrainingPlaying;

    return (
        <div className="flex justify-center gap-4 p-4 bg-gray-900 border-t border-gray-700">
            <button
                onClick={() => setMode('rhythm')}
                disabled={isPlaying}
                className={`px-4 py-2 rounded-full focus:outline-noneto-black border-2 border-gray-400 text-white text-xl flex items-center justify-center shadow hover:shadow-[0_0_12px_rgba(255,255,255,0.6)] hover:border-white transition duration-200 bg-gradient-to-br ${mode === 'rhythm' ? 'from-green-600' : 'from-gray-700'} ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                リズムモード🥁
            </button>
            <button
                onClick={() => setMode('training')}
                disabled={isPlaying}
                className={`px-4 py-2 rounded-full focus:outline-noneto-black border-2 border-gray-400 text-white text-xl flex items-center justify-center shadow hover:shadow-[0_0_12px_rgba(255,255,255,0.6)] hover:border-white transition duration-200 bg-gradient-to-br ${mode === 'training' ? 'from-blue-600' : 'from-gray-700'} ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                トレーニングモード🏋️
            </button>
        </div>
    );
};

export default ModeSwitchFooter;
