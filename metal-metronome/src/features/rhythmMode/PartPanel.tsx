/**
 * ファイル名：src/features/rhythmMode/PartPanel.tsx
 * 目的：1つのパート（右手・左足など）を表示するUIコンポーネント
 *
 * 機能概要：
 * - 視覚化モードに応じて RhythmVisualizer を表示
 * - 拍の強弱表示＆切り替え（AccentSelector）
 * - ミュートボタンの表示・切り替え（MuteToggle）
 * - ラベル表示（どのパートか）
 *
 * 今後の拡張予定：
 * - パネルサイズの自動調整／グリッドレスポンシブ対応
 * - パートごとの音色設定機能
 */
import React from 'react';
import RhythmVisualizer from './RhythmVisualizer';
import RhythmUnitControl from './RhythmUnitControl';
import { useRhythmContext } from '@/contexts/RhythmContext';

type Props = {
    label: string;
    index: number;
};

const PartPanel: React.FC<Props> = ({ label, index: partIndex }) => {
    const { displayMode, setDisplayMode, muteStates, setMuteStates, partSounds, setPartSounds } = useRhythmContext();

    const toggleMute = () => {
        const updated = [...muteStates];
        updated[partIndex] = !updated[partIndex];
        setMuteStates(updated);
    };

    const toggleDisplayMode = () => {
        const modes = ['circle', 'bar', 'wave', 'rotary'] as const;
        const next = modes[(modes.indexOf(displayMode) + 1) % modes.length];
        setDisplayMode(next);
    };

    return (
        <div className="w-full h-full bg-gray-800 text-white rounded-md p-4 flex flex-col items-center justify-between shadow">

            {/* Rhythm 設定 */}
            <div className="mt-4 flex flex-row items-center gap-2">
                <RhythmUnitControl partIndex={partIndex} />
                <select
                    value={partSounds[partIndex]}
                    onChange={(e) => {
                        const updated = [...partSounds];
                        updated[partIndex] = e.target.value;
                        setPartSounds(updated);
                    }}
                    className="bg-gray-700 text-white rounded px-2 py-1 border border-gray-500 mb-2"
                >
                    <option value="kick">Kick</option>
                    <option value="snare">Snare</option>
                </select>
            </div>

            {/* Visualizer */}
            <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
                <RhythmVisualizer partIndex={partIndex} />
            </div>

            {/* ボタン横並びに変更！ */}
            <div className="mt-4 flex flex-row items-center gap-4">
                {/* ミュートボタン */}
                <button
                    onClick={toggleMute}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-black border-2 border-gray-400 text-white text-xl flex items-center justify-center shadow hover:shadow-[0_0_12px_rgba(255,255,255,0.6)] hover:border-white transition duration-200 focus:outline-none"
                >
                    {muteStates[partIndex] ? "🔇" : "🔈"}
                </button>

                {/* モード切替ボタン */}
                <button
                    onClick={toggleDisplayMode}
                    className="w-24 h-10 rounded-full bg-gradient-to-br from-gray-700 to-black border-2 border-gray-400 text-white text-sm font-bold flex items-center justify-center shadow hover:shadow-[0_0_12px_rgba(255,255,255,0.6)] hover:border-white transition duration-200 focus:outline-none"
                >
                    {displayMode}
                </button>
            </div>
        </div>
    );
};

export default PartPanel;
