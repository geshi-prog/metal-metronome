// src/features/trainingMode/components/TrainingRhythmVisualizer.tsx
import React from 'react';
import { useTrainingContext } from '@/contexts/TrainingContext';

type Props = {
  partIndex: number;
};

const TrainingRhythmVisualizer: React.FC<Props> = ({ partIndex }) => {
  const { rhythmTracksWithCountIn, currentStepIndex } = useTrainingContext();
console.log(rhythmTracksWithCountIn, currentStepIndex);
  const currentPartTrack = rhythmTracksWithCountIn.flatMap(loop => loop[partIndex]);
  const m = currentPartTrack.length;

  const panelSize = 160;
  const centerX = panelSize / 2;
  const centerY = panelSize / 2;
  const radius = panelSize / 2 - 16;
  const anglePerStep = 360 / m;
  const needleAngle = (anglePerStep * currentStepIndex - 90) * (Math.PI / 180);
  const needleX = radius * Math.cos(needleAngle);
  const needleY = radius * Math.sin(needleAngle);

  return (
    <svg width={panelSize} height={panelSize} viewBox={`0 0 ${panelSize} ${panelSize}`}>
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        stroke="gray"
        strokeWidth={1}
        fill="none"
      />
      {currentPartTrack.map((step, i) => {
        const angle = (anglePerStep * i - 90) * (Math.PI / 180);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const isActive = currentStepIndex === i;

        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={10}
            fill={isActive ? 'red' : 'white'}
            stroke="black"
            strokeWidth={1}
          />
        );
      })}
      <line
        x1={centerX}
        y1={centerY}
        x2={centerX + needleX}
        y2={centerY + needleY}
        stroke="red"
        strokeWidth={2}
      />
    </svg>
  );
};

export default TrainingRhythmVisualizer;
