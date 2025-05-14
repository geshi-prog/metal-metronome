import React from 'react';
import { useRhythmContext } from '@/contexts/RhythmContext';

const TempoPanel: React.FC = () => {
  　　const { numerator, currentAccentStep, displayMode } = useRhythmContext();

  　　const panelSize = 200;
  　　const margin = 5;
  　　const dotSize = 30;
  　　const radius = (panelSize / 2) - (dotSize / 2) - margin;

  　　const centerX = panelSize / 2;
  　　const centerY = panelSize / 2;
  　　const angle = (360 / numerator) * currentAccentStep - 90;
  　　const rad = angle * (Math.PI / 180);
  　　const needleX = radius * Math.cos(rad);
  　　const needleY = radius * Math.sin(rad);

  　　return (
  　　  　　<div className="w-full flex items-center justify-center">
  　　  　　  　　<svg width={panelSize} height={panelSize} viewBox={`0 0 ${panelSize} ${panelSize}`}>
  　　  　　  　　  　　{/* 円周の線 */}
  　　  　　  　　  　　<circle cx={centerX} cy={centerY} r={radius} stroke="gray" strokeWidth={1} fill="none" />
  　　  　　  　　  　　{/* 点 */}
  　　  　　  　　  　　{Array.from({ length: numerator }).map((_, i) => {
  　　  　　  　　  　　  　　const theta = ((360 / numerator) * i - 90) * (Math.PI / 180);
  　　  　　  　　  　　  　　const x = centerX + radius * Math.cos(theta);
  　　  　　  　　  　　  　　const y = centerY + radius * Math.sin(theta);
  　　  　　  　　  　　  　　const active = currentAccentStep === i;
  　　  　　  　　  　　  　　return (
                                <g key={i}>
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={dotSize / 2}
                                        fill={active ? 'rgb(239, 68, 68)' : 'white'}
                                    />
                                    <text
                                        x={x}
                                        y={y}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontSize="20"
                                        fill={active ? 'white' : 'black'}
                                        fontWeight="bold"
                                    >
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
  　　  　　  　　</svg>
  　　  　　</div>
  　　);

  　　return null;
};

export default TempoPanel;
