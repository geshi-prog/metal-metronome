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
import { useRhythmContext } from '@/contexts/RhythmContext';

type Props = {
    label: string;
    index: number;
};

const PartPanel: React.FC<Props> = ({ label, index }) => {
    const { displayMode, setDisplayMode, muteStates, setMuteStates, } = useRhythmContext();

    const toggleMute = () => {
        const updated = [...muteStates];
        updated[index] = !updated[index];
        setMuteStates(updated);
    }
    return (
        <div className="w-full h-full bg-gray-800 text-white rounded-md p-4 flex flex-col items-center justify-between shadow">
    
            {/* Visualizer 部分に高さ制限とflex調整を追加！ */}
            <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
                <RhythmVisualizer />
            </div>

            {/* ボタンエリア */}
            <div className="mt-4 flex flex-col items-center gap-2">
                <button
                    onClick={toggleMute}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-black border-2 border-gray-400 text-white text-xl flex items-center justify-center shadow hover:shadow-[0_0_12px_rgba(255,255,255,0.6)] hover:border-white transition duration-200 focus:outline-none"
                >
                    {muteStates[index] ? "🔇" : "🔈"}
                </button>

                <button
                    onClick={() => {
                        const next =
                            displayMode === 'circle' ? 'bar' :
                            displayMode === 'bar' ? 'wave' : 'circle';
                        setDisplayMode(next);
                    }}
                    className="w-24 h-10 rounded-full bg-gradient-to-br from-gray-700 to-black border-2 border-gray-400 text-white text-sm font-bold flex items-center justify-center shadow hover:shadow-[0_0_12px_rgba(255,255,255,0.6)] hover:border-white transition duration-200 focus:outline-none"
                >
                    {displayMode}
                </button>
            </div>
        </div>
    );
};

export default PartPanel;
