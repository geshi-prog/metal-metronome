/**
 * ファイル名：src/features/trainingMode/TrainingModePage.tsx
 * 目的：トレーニングモードの全体画面構成を定義するトップレベルコンポーネント
 *
 * 機能概要：
 * - テンポや拍子のトレーニング設定UI（TrainingSetting）
 * - 小節編集・追加（TrainingMeasureList）
 * - 再生・停止ボタン（TrainingPlaybackControls）
 * - モード切替ボタン（ModeSwitch）
 *
 * 今後の拡張予定：
 * - 小節ごとのテンポ変化・視覚化
 * - タブ切替による再生画面／設定画面の分離
 */

import React, { useState } from 'react';
import TrainingTabs from './TrainingTabs';
import TrainingSetting from './TrainingSetting';
import TrainingPlayback from './TrainingPlayback';
import ModeSwitch from '@/components/control/ModeSwitch';

const TrainingModePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'setting' | 'playback'>('setting');
    return (
        <div className="flex flex-col gap-8 p-6 bg-black text-white min-h-screen items-center">
            {/* タブ切り替え */}
            {/*<TrainingTabs activeTab={activeTab} onTabChange={setActiveTab} />*/}
            {/* 中身 */}
            {/*{activeTab === 'setting' ? <TrainingSetting /> : <TrainingPlayback />}*/}
            <TrainingSetting />

            {/* 🔁 モード切替 */}
            <ModeSwitch />
        </div>
    );
};

export default TrainingModePage;
