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
type AccentType = 'strong' | 'normal' | 'weak' | 'none';
type RhythmUnit = { n: number; m: number };

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
    currentStep: number;
    setCurrentStep: (value: number) => void;
    currentAccentStep: number;
    setCurrentAccentStep: (step: number) => void;
    muteStates: boolean[];
    setMuteStates: (states: boolean[]) => void;
    rhythmUnits: { n: number; m: number }[];
    setRhythmUnits: (units: { n: number; m: number }[]) => void;
    currentRhythmSteps: number[];
    setCurrentRhythmSteps: (steps: number[]) => void;
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
    const [accentLevels, setAccentLevels] = useState<AccentType[]>(Array(numerator).fill('normal'));
    const [currentStep, setCurrentStep] = useState(0);
    const [currentAccentStep, setCurrentAccentStep] = useState(0);
    const [muteStates, setMuteStates] = useState<boolean[]>(Array(4).fill(true));
    const [rhythmUnits, setRhythmUnits] = useState<RhythmUnit[]>(Array(4).fill({ n: 5, m: 3 }));
    const [currentRhythmSteps, setCurrentRhythmSteps] = useState<number[]>(Array(4).fill(0));

    useEffect(() => {
        setAccentLevels((prev) => {
            const updated = [...prev];
            while (updated.length < numerator) updated.push('normal');
            return updated.slice(0, numerator);
        });
    }, [numerator]);

    useEffect(() => {
        setRhythmUnits((prev) => {
            const updated = [...prev];
            while (updated.length < 4) updated.push({ n: 1, m: 1 });
            return updated.slice(0, 4);
        });
    }, []);

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
                currentStep,
                setCurrentStep,
                currentAccentStep,
                setCurrentAccentStep,
                muteStates,
                setMuteStates,
                rhythmUnits,
                setRhythmUnits,
                currentRhythmSteps,
                setCurrentRhythmSteps,
            }}
        >
            {children}
        </RhythmContext.Provider>
    );
};