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
    const { displayMode, setDisplayMode, muteStates, setMuteStates, partSounds, setPartSounds, isPlaying } = useRhythmContext();

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
        <div className={`gap-0 w-full h-full bg-gray-800 text-white rounded-md ${isPlaying ? 'p-2' : 'p-4'} flex flex-col items-center justify-between shadow`}>

            {/* Rhythm 設定 */}
                <div className="mt-4 flex flex-row items-center" disabled={isPlaying}>
                    <RhythmUnitControl partIndex={partIndex} />
                </div>
                <div className="mt-4 flex flex-row items-center">
                    <select
                        value={partSounds[partIndex]}
                        onChange={(e) => {
                            const updated = [...partSounds];
                            updated[partIndex] = e.target.value;
                            setPartSounds(updated);
                        }}
                        className="bg-gray-700 text-white rounded px-2 py-1 border border-gray-500 mb-2"
                        disabled={isPlaying}
                    >
                        <option value="kick">Kick</option>
                        <option value="kick_sub">Kick Sub</option>
                        <option value="snare">Snare</option>
                        <option value="snare_ghost">Snare Ghost</option>
                        <option value="snare_rim">Snare Rim</option>
                        <option value="tom_high1">Tom High 1</option>
                        <option value="tom_high2">Tom High 2</option>
                        <option value="tom_mid1">Tom Mid 1</option>
                        <option value="tom_mid2">Tom Mid 2</option>
                        <option value="tom_low1">Tom Low 1</option>
                        <option value="tom_low2">Tom Low 2</option>
                        <option value="hihat_closed">Hi-Hat Closed</option>
                        <option value="hihat_open">Hi-Hat Open</option>
                        <option value="hihat_pedal">Hi-Hat Pedal</option>
                        <option value="crash1">Crash 1</option>
                        <option value="crash2">Crash 2</option>
                        <option value="ride_bell">Ride Bell</option>
                        <option value="ride_crash">Ride Crash</option>
                        <option value="ride_tip">Ride Tip</option>
                        <option value="china">China</option>
                        <option value="splash">Splash</option>
                        <option value="bell">Bell</option>
                        <option value="click">Click</option>
                        <option value="click_high">Click High</option>
                    </select>
                </div>

            {/* Visualizer */}
            <div className="w-full flex items-center justify-center overflow-hidden" style={{ minHeight: '200px', flex: 1 }}>
                <RhythmVisualizer partIndex={partIndex} />
            </div>

            {/* ボタン横並びに変更！ */}
            <div className="mt-4 flex flex-row items-center gap-4">
                {/* ミュートボタン */}
                <button
                    onClick={toggleMute}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-black border-2 border-gray-400 text-white text-xl flex items-center justify-center shadow hover:shadow-[0_0_12px_rgba(255,255,255,0.6)] hover:border-white transition duration-200 focus:outline-none"
                    disabled={isPlaying}
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
