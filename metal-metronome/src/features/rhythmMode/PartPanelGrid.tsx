/**
 * ファイル名：src/features/rhythmMode/PartPanelGrid.tsx
 * 目的：パネル数（1〜4）を動的に調整し、レイアウト表示するグリッド
 */

import React, { useState } from 'react';
import PartPanel from './PartPanel';

const labels = ['右手', '左手', '右足', '左足'];

const PartPanelGrid: React.FC = () => {
    const [panelCount, setPanelCount] = useState(1);

    const addPanel = () => {
        if (panelCount < 4) setPanelCount(panelCount + 1);
    };

    const removePanel = () => {
        if (panelCount > 1) setPanelCount(panelCount - 1);
    };

    const gridClass =
        panelCount === 1
            ? 'grid-cols-1 grid-rows-1'
            : panelCount === 2
            ? 'grid-cols-2 grid-rows-1'
            : 'grid-cols-2 grid-rows-2';

    return (
        <div className="flex flex-col items-center gap-4">
            {/* パネル増減ボタン */}
            <div className="flex gap-4">
                <button
                    onClick={removePanel}
                    disabled={panelCount <= 1}
                    className={`w-10 h-10 rounded-full text-white text-xl flex items-center justify-center 
                        transition duration-200 focus:outline-none 
                        border-2 border-gray-400 bg-gradient-to-br from-gray-700 to-black
                        ${panelCount <= 1 ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    −
                </button>
                <button
                    onClick={addPanel}
                    disabled={panelCount >= 4}
                    className={`w-10 h-10 rounded-full text-white text-xl flex items-center justify-center 
                        transition duration-200 focus:outline-none 
                        border-2 border-gray-400 bg-gradient-to-br from-gray-700 to-black
                        ${panelCount >= 4 ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    ＋
                </button>
            </div>

            {/* パネル表示部分（幅・高さ固定、内部で調整） */}
            <div className={`grid ${gridClass} gap-4 w-[500px] h-[800px]`}>
                {Array.from({ length: panelCount }).map((_, i) => (
                    <div key={i} className="w-full h-full">
                        <PartPanel label={labels[i]} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PartPanelGrid;
