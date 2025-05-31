// src/features/trainingMode/components/PartPlaybackPanel.tsx
import React from 'react';
import TrainingRhythmVisualizer from './TrainingRhythmVisualizer';

type Props = {
  partIndex: number;
  beatIndex: number;
  n: number;
  m: number;
  sound: string;
};

const PartPlaybackPanel: React.FC<Props> = ({ partIndex, beatIndex, n, m, sound }) => {
  return (
    <div className="flex flex-col items-center justify-start w-full h-60 bg-gray-800 rounded-lg shadow-md mb-4 p-2">
      {/* 上半分：n拍m連と楽器名 */}
      <div className="w-full text-center mb-2">
        <div className="text-sm text-gray-400">{sound}</div>
        <div className="text-base font-bold">{n}拍{m}連</div>
      </div>

      {/* 下半分：リズム視覚化 */}
      <div className="flex justify-center items-center flex-1 w-full">
        <TrainingRhythmVisualizer partIndex={partIndex} />
      </div>
    </div>
  );
};

export default PartPlaybackPanel;
