/**
 * ファイル名：src/components/tempo/TempoControl.tsx
 * 目的：テンポ／拍子／音価をユーザーが設定するためのUI
 *
 * 機能概要：
 * - 分子（1〜20）／分母（1, 2, 4, 8, 16）の拍子選択
 * - 音価（♩, ♪, ♪.）によるテンポ基準の選択
 * - BPM数値入力／±ボタン／TAPテンポボタン
 *
 * 今後の拡張予定：
 * - TAPテンポの実装
 * - エラーチェック／不整合バリデーション
 */
import React, { useState, useRef } from "react";
import { useRhythmContext } from "@/contexts/RhythmContext";
import TempoAccentSelector from "./TempoAccentSelector";

const TempoControl = () => {
    const {
        numerator, setNumerator,
        denominator, setDenominator,
        noteValue, setNoteValue,
        bpm, setBpm,
        isPlaying
    } = useRhythmContext();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const increment = () => setBpm((prev) => Math.min(prev + 1, 300));
    const decrement = () => setBpm((prev) => Math.max(prev - 1, 30));
    const handleBpmChange = (amount: number) => {
        setBpm(prev => Math.min(300, Math.max(30, prev + amount)));
    };

    const handleTap = () => {
        // 今後：TAPテンポを実装予定
        alert('TAPテンポ機能はまだ実装されていません。');
    };

    const handlePressStart = (action: () => void) => {
        timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(action, 100);
        }, 300); // 300ms以上押してたら連打開始
    };

    const handlePressEnd = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    return (
        <div className="flex flex-col gap-2 p-4 bg-gray-900 text-white rounded-xl shadow">
            <div className="flex gap-4 items-center">
                <label>拍子：</label>
                <select
                    value={numerator}
                    onChange={e => setNumerator(parseInt(e.target.value))}
                    disabled={isPlaying}
                    className="bg-gray-800 p-1 rounded"
                >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>{num}</option>
                    ))}
                </select>
                <span>/</span>
                <select
                    value={denominator}
                    onChange={e => setDenominator(parseInt(e.target.value) as 1 | 2 | 4 | 8 | 16)}
                    disabled={isPlaying}
                    className="bg-gray-800 p-1 rounded"
                >
                    {[1, 2, 4, 8, 16].map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>

            <div className="flex gap-4 items-center">
                <label>音価：</label>
                <select
                    value={noteValue}
                    onChange={e => setNoteValue(e.target.value as any)}
                    disabled={isPlaying}
                    className="bg-gray-800 p-1 rounded"
                >
                    <option value="quarter">♩</option>
                    <option value="eighth">♪</option>
                    <option value="dotted-eighth">♪.</option>
                </select>
            </div>

            <div className="flex gap-4 items-center">
                <label>BPM：</label>
                <button 
                    onMouseDown={() => handlePressStart(decrement)}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={handlePressEnd}
                    onTouchStart={() => handlePressStart(decrement)}
                    onTouchEnd={handlePressEnd}
                    onClick={() => handleBpmChange(-1)} className="
                        w-10 h-10 rounded-full 
                        bg-gradient-to-br from-gray-700 to-black 
                        border-2 border-gray-400 
                        text-white text-xl 
                        flex items-center justify-center 
                        shadow-[0_4px_8px_rgba(0,0,0,0.5)] 
                        hover:shadow-[0_0_12px_rgba(255,255,255,0.6)] 
                        hover:border-white 
                        transition duration-200
                        focus:outline-none focus-visible:outline-white"
                >-</button>
                <input
                    type="number"
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="
                        w-24 text-center text-white text-xl
                        bg-gray-800 rounded-md
                        border-none
                        focus:outline-none focus:ring-0
                        [appearance:textfield]
                        [&::-webkit-inner-spin-button]:appearance-none
                        [&::-webkit-outer-spin-button]:appearance-none
                        shadow
                    "
                />
                <button 
                        onMouseDown={() => handlePressStart(increment)}
                        onMouseUp={handlePressEnd}
                        onMouseLeave={handlePressEnd}
                        onTouchStart={() => handlePressStart(increment)}
                        onTouchEnd={handlePressEnd}
                        onClick={() => handleBpmChange(1)} className="
                        w-10 h-10 rounded-full 
                        bg-gradient-to-br from-gray-700 to-black 
                        border-2 border-gray-400 
                        text-white text-xl 
                        flex items-center justify-center 
                        shadow-[0_4px_8px_rgba(0,0,0,0.5)] 
                        hover:shadow-[0_0_12px_rgba(255,255,255,0.6)] 
                        hover:border-white 
                        transition duration-200
                        focus:outline-none focus-visible:outline-white">＋</button>
                <button onClick={handleTap} className="
                        w-10 h-10 rounded-full 
                        bg-gradient-to-br from-gray-700 to-black 
                        border-2 border-gray-400 
                        text-white text-xl 
                        flex items-center justify-center 
                        shadow-[0_4px_8px_rgba(0,0,0,0.5)] 
                        hover:shadow-[0_0_12px_rgba(255,255,255,0.6)] 
                        hover:border-white 
                        transition duration-200
                        focus:outline-none focus-visible:outline-white">TAP</button>
            </div>
            <TempoAccentSelector />
        </div>
    );
};

export default TempoControl;
