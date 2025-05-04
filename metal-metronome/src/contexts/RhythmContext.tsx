/**
 * ファイル名：src/contexts/RhythmContext.tsx
 * 目的：リズムモード全体で共有する状態（テンポ・再生中・設定など）を管理するためのContext
 *
 * 機能概要：
 * - テンポ設定（BPM・拍子・音価）
 * - 再生中フラグ（isPlaying）
 * - ミュート／アクセント情報（各パートごとに管理）
 * - グローバルでの状態参照・変更が可能
 *
 * 今後の拡張予定：
 * - ループ／テンポ変化モードの共有状態追加
 * - 保存時のプリセットデータと連携
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

type NoteValue = 'quarter' | 'eighth' | 'dotted-eighth';
type DisplayMode = 'circle' | 'bar' | 'wave';
type AccentType = 'accent' | 'normal' | 'ghost' | 'none';

type RhythmContextType = {
    numerator: number;
    setNumerator: (value: number) => void;
    denominator: 1 | 2 | 4 | 8 | 16;
    setDenominator: (value: 1 | 2 | 4 | 8 | 16) => void;
    noteValue: NoteValue;
    setNoteValue: (value: NoteValue) => void;
    displayMode: DisplayMode;
    setDisplayMode: (value: DisplayMode) => void;
    bpm: number;
    setBpm: (value: number) => void;
    isPlaying: boolean;
    setIsPlaying: (value: boolean) => void;
    accentLevels: AccentType[];
    setAccentLevels: (levels: AccentType[]) => void;
    currentAccentStep: number;
    setCurrentAccentStep: (step: number) => void;
};

const RhythmContext = createContext<RhythmContextType | null>(null);

export const useRhythmContext = () => {
    const ctx = useContext(RhythmContext);
    if (!ctx) throw new Error('RhythmContext must be used within RhythmProvider');
    return ctx;
};

export const RhythmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [numerator, setNumerator] = useState(4);
    const [denominator, setDenominator] = useState<1 | 2 | 4 | 8 | 16>(4);
    const [noteValue, setNoteValue] = useState<NoteValue>('quarter');
    const [displayMode, setDisplayMode] = useState<DisplayMode>('circle');
    const [bpm, setBpm] = useState(120);
    const [isPlaying, setIsPlaying] = useState(false);
    const [accentLevels, setAccentLevels] = useState<AccentType[]>(
        Array(numerator).fill('normal')
    );
    const [currentAccentStep, setCurrentAccentStep] = useState(0);

    useEffect(() => {
        setAccentLevels((prev) => {
            const updated = [...prev];
            while (updated.length < numerator) updated.push('normal');
            return updated.slice(0, numerator);
        });
    }, [numerator]);

    return (
        <RhythmContext.Provider
            value={{
                numerator,
                setNumerator,
                denominator,
                setDenominator,
                noteValue,
                setNoteValue,
                displayMode,
                setDisplayMode,
                bpm,
                setBpm,
                isPlaying,
                setIsPlaying,
                accentLevels,
                setAccentLevels,
                currentAccentStep,
                setCurrentAccentStep,
            }}
        >
            {children}
        </RhythmContext.Provider>
    );
};