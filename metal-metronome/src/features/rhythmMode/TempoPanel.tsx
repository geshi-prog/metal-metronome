import React, { useRef, useState } from 'react';
import { useRhythmContext } from '@/contexts/RhythmContext';
import * as Tone from 'tone';
import { startAllLoops, stopAllLoops } from '@/lib/rhythmLogic';

const TempoPanel: React.FC = () => {
  const {
    numerator, denominator, noteValue, bpm, setBpm,
    currentAccentStep,
    isPlaying, setIsPlaying,
    accentLevels, setCurrentAccentStep,
    muteStates, rhythmUnits, rhythmVolumes, setCurrentRhythmSteps,
    partSounds
  } = useRhythmContext();

  const panelSize = 250;
  const dotSize = 25;
  const radius = (panelSize / 2) - (dotSize / 2) - 5;
  const centerX = panelSize / 2;
  const centerY = panelSize / 2;

  const [isDragging, setIsDragging] = useState(false);
  const lastAngleRef = useRef<number | null>(null);

  const getAngle = (x: number, y: number) => Math.atan2(y - centerY, x - centerX);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    lastAngleRef.current = getAngle(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging || lastAngleRef.current === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const angle = getAngle(x, y);
    const diff = angle - lastAngleRef.current;

    const threshold = 0.1;
    if (diff > threshold) {
      setBpm(prev => Math.min(300, prev + 1));
      lastAngleRef.current = angle;
    } else if (diff < -threshold) {
      setBpm(prev => Math.max(30, prev - 1));
      lastAngleRef.current = angle;
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    lastAngleRef.current = null;
  };

  const handleToggle = async () => {
    await Tone.start();
    if (!isPlaying) {
      startAllLoops(
        bpm,
        noteValue,
        accentLevels,
        setCurrentAccentStep,
        muteStates,
        4, // partCount 固定
        numerator,
        rhythmUnits,
        setCurrentRhythmSteps,
        rhythmVolumes,
        denominator,
        partSounds
      );
    } else {
      stopAllLoops();
      setCurrentAccentStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  const angle = ((360 / numerator) * currentAccentStep - 90) * (Math.PI / 180);
  const needleX = radius * Math.cos(angle);
  const needleY = radius * Math.sin(angle);

  return (
    <div className="w-full flex items-center justify-center">
      <svg
        width={panelSize}
        height={panelSize}
        viewBox={`0 0 ${panelSize} ${panelSize}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleToggle}
        style={{ touchAction: 'none', cursor: 'pointer' }}
      >
        {/* 円周 */}
        <circle cx={centerX} cy={centerY} r={radius} stroke="gray" strokeWidth={1} fill="none" />

        {/* 中心の背景円 */}
        <circle cx={centerX} cy={centerY} r={radius} fill={isPlaying ? '#4b5563' : '#3f3f46'}/>

        {/* 点と数字 */}
        {Array.from({ length: numerator }).map((_, i) => {
          const theta = ((360 / numerator) * i - 90) * (Math.PI / 180);
          const x = centerX + radius * Math.cos(theta);
          const y = centerY + radius * Math.sin(theta);
          const active = currentAccentStep === i;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={dotSize / 2} fill={active ? 'rgb(239, 68, 68)' : 'white'} />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="16" fill={active ? 'white' : 'black'} style={{ userSelect: 'none' }}>
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* 針 */}
        <line
          x1={centerX}
          y1={centerY}
          x2={centerX + needleX}
          y2={centerY + needleY}
          stroke="red"
          strokeWidth={2}
        />

        {/* 中央トグルラベル */}
        <foreignObject
          x={centerX - 35}
          y={centerY - 60}
          width={70}
          height={120}
        >
          <div xmlns="http://www.w3.org/1999/xhtml"
               className="flex flex-col items-center justify-center text-white font-bold leading-tight text-xl select-none">
            <span className="text-2xl">{numerator}</span>
            <span className="w-full border-t border-white my-1"></span>
            <span className="text-2xl">{denominator}</span>
            <span className="mt-2 text-xl">
              {noteValue === 'quarter' ? '♩' : '♪'} {bpm}
            </span>
          </div>
        </foreignObject>
      </svg>
    </div>
  );
};

export default TempoPanel;
