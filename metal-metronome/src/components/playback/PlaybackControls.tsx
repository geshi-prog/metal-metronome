/**
 * ファイル名：src/components/playback/PlaybackControls.tsx
 * 目的：リズム再生の開始／停止、再生中の制御を行うUI
 *
 * 機能概要：
 * - 再生／停止ボタンのトグル
 * - 再生中に許可された操作のガイド（テンポ／ミュート／強弱）
 *
 * 今後の拡張予定：
 * - 再生モード（チェンジアップ、往復など）の追加
 * - 再生中アイコンのアニメーション表示
 */

import React from 'react';
import { useRhythmContext } from '@/contexts/RhythmContext';
import * as Tone from 'tone';
import { startTempoLoop, stopTempoLoop } from '@/lib/rhythmLogic';

const PlaybackControls: React.FC = () => {
    const {
        isPlaying, setIsPlaying,
        bpm, noteValue, accentLevels,
        setCurrentAccentStep, muteStates, numerator
    } = useRhythmContext();

    const handleToggle = async () => {
        await Tone.start(); // AudioContext 再開

        if (!isPlaying) {
            startTempoLoop(bpm, noteValue, accentLevels, setCurrentAccentStep, muteStates, 4, numerator);
        } else {
            stopTempoLoop();
            setCurrentAccentStep(0); // 初期化
        }

        setIsPlaying(!isPlaying);
    };

    return (
        <div className="flex justify-center mt-4 gap-4">
            <button
                onClick={handleToggle}
                className={`w-16 h-16 rounded-full 
                    bg-gradient-to-br from-gray-700 to-black 
                    border-2 border-gray-400 
                    text-white text-xl 
                    flex items-center justify-center 
                    shadow-[0_4px_8px_rgba(0,0,0,0.5)] 
                    hover:shadow-[0_0_12px_rgba(255,255,255,0.6)] 
                    hover:border-white 
                    transition duration-200
                    focus:outline-none focus-visible:outline-white
                    ${isPlaying ? 'bg-red-600' : 'bg-green-600'}`}
            >
                {isPlaying ? '⏹' : '▶️'}
            </button>
        </div>
    );
};

export default PlaybackControls;
