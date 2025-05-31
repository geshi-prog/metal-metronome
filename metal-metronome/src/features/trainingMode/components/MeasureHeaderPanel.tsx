// src/features/trainingMode/components/MeasureHeaderPanel.tsx
import React from 'react';
import { Section } from '@/types/training';

type Props = {
  section: Section;
  currentBeatIndex: number; // 現在の拍（0-index）
};

const MeasureHeaderPanel: React.FC<Props> = ({ section, currentBeatIndex }) => {
  const { numerator, denominator, noteValue, bpm } = section;

  const panelSize = 150;
  const dotSize = 20;
  const radius = (panelSize / 2) - (dotSize / 2) - 5;
  const centerX = panelSize / 2;
  const centerY = panelSize / 2;

  // 針の角度と位置（ここで1回だけ計算）
  const needleAngle = ((360 / numerator) * currentBeatIndex - 90) * (Math.PI / 180);
  const needleX = radius * Math.cos(needleAngle);
  const needleY = radius * Math.sin(needleAngle);

  return (
    <div className="flex items-center justify-between w-full bg-gray-800 text-white rounded p-2">
      {/* 左側：情報表示 */}
      <div className="text-left">
        <div className="text-sm">拍子: {numerator}/{denominator}</div>
        <div className="text-sm">音価: {noteValue === 'quarter' ? '♩' : '♪'}</div>
        <div className="text-sm">BPM: {bpm}</div>
      </div>

      {/* 右側：現在の拍インジケーター */}
      <svg width={panelSize} height={panelSize} viewBox={`0 0 ${panelSize} ${panelSize}`}>
        <circle cx={centerX} cy={centerY} r={radius} stroke="gray" strokeWidth={1} fill="none" />

        {/* 拍ごとの丸 */}
        {Array.from({ length: numerator }).map((_, i) => {
          const angle = ((360 / numerator) * i - 90) * (Math.PI / 180);
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          const isActive = currentBeatIndex === i;

          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={dotSize / 2}
                fill={isActive ? 'red' : 'white'}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fill={isActive ? 'white' : 'black'}
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* 中央から伸びる針はここに1本だけ */}
        <line
          x1={centerX}
          y1={centerY}
          x2={centerX + needleX}
          y2={centerY + needleY}
          stroke="red"
          strokeWidth={2}
        />
      </svg>
    </div>
  );
};

export default MeasureHeaderPanel;
