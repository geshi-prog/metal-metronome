/**
 * ファイル名：src/features/rhythmMode/RhythmModePage.tsx
 * 目的：リズムモードの全体画面構成を定義するトップレベルコンポーネント
 *
 * 機能概要：
 * - テンポ欄、パネル一覧、再生・モード切替ボタンを配置
 * - RhythmContext から設定を読み込んで各子コンポーネントに渡す
 *
 * 今後の拡張予定：
 * - レスポンシブ対応（スマホ⇔PC）
 * - モード切替時のアニメーション演出
 */
import React, { useEffect } from 'react';
import TempoControl from '@/components/tempo/TempoControl';
import PartPanelGrid from '@/features/rhythmMode/PartPanelGrid';
import PlaybackControls from '@/components/playback/PlaybackControls';
//import ModeSwitch from '@/components/control/ModeSwitch';

import { useRhythmContext } from '@/contexts/RhythmContext';
import { playTempoClick, loadSamples } from '@/lib/rhythmLogic';

const RhythmModePage: React.FC = () => {
    const {
        isPlaying,
        bpm,
        noteValue,
        numerator,
        accentLevels,
        currentAccentStep,
        setCurrentAccentStep,
    } = useRhythmContext();

    // 音価に応じた係数（♩=1, ♪=0.5, ♪.=0.75）
    const noteValueFactor =
        noteValue === 'quarter' ? 1 :
        noteValue === 'eighth' ? 0.5 :
        0.75;

    const interval = (60_000 / bpm) * noteValueFactor;

    // 再生中：テンポに応じてアクセントの音とステップ更新
    useEffect(() => {
        loadSamples();
        if (!isPlaying) return;

        const timer = setInterval(() => {
            const next = (currentAccentStep + 1) % numerator;
            setCurrentAccentStep(next);
            const accent = accentLevels[next];
            playTempoClick(accent); // 音を鳴らす
        }, interval);

        return () => clearInterval(timer);
    }, [isPlaying, bpm, noteValue, numerator, accentLevels, currentAccentStep, setCurrentAccentStep]);

    return (
        <div className="flex flex-col gap-8 p-6 bg-black text-white min-h-screen items-center">
            {/* 🎼 テンポ設定 */}
            <TempoControl />

            {/* 🥁 リズムパネル表示（1〜4） */}
            <PartPanelGrid />

            {/* ▶️ 再生・停止ボタン */}
            <PlaybackControls />

            {/* 🔁 モード切替（仮） */}
            {/* <ModeSwitch /> */}
        </div>
    );
};

export default RhythmModePage;