// src/features/trainingMode/TrainingPlayback.tsx
import React from 'react';
import MeasureHeaderPanel from './components/MeasureHeaderPanel';
import PartPlaybackPanel from './components/PartPlaybackPanel';
import { useTrainingContext } from '@/contexts/TrainingContext';

const TrainingPlayback: React.FC = () => {
  const {
    sections,
    parts,
    currentSectionIndex,
    currentBeatIndex,
  } = useTrainingContext();

  console.log(parts);
  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-900 rounded-lg p-6 shadow-lg text-white">
      {/* 小節ヘッダー */}
      <div className="mb-6">
        <MeasureHeaderPanel
          section={sections}
          currentBeatIndex={currentBeatIndex}
        />
      </div>

      {/* パートパネル（最大4つ） */}
      <div className="grid grid-cols-1 gap-4">
        {parts.map((part, i) => (
          part.beats.map((beat, j) => (
            <PartPlaybackPanel
              partIndex={i}
              beatIndex={j}
              n = {beat.n}
              m = {beat.m}
              sound = {beat.sound}
            />
          ))
        ))}
      </div>
    </div>
  );
};

export default TrainingPlayback;
