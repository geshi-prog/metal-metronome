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
import React, { useEffect, useRef } from 'react';
import TempoControl from '@/components/tempo/TempoControl';
import PartPanelGrid from '@/features/rhythmMode/PartPanelGrid';
import PlaybackControls from '@/components/playback/PlaybackControls';
//import ModeSwitch from '@/components/control/ModeSwitch';

const RhythmModePage: React.FC = () => {
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