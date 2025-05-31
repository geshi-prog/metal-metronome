// src/features/trainingMode/TrainingLoopSetting.tsx

import React from 'react';
import { useTrainingContext } from '@/contexts/TrainingContext';

const TrainingLoopSetting: React.FC = () => {
  const {
    loopMode,
    setLoopMode,
    tempoStep,
    setTempoStep,
    maxTempo,
    setMaxTempo,
    minTempo,
    setMinTempo,
    loopChangeCount,
    setLoopChangeCount,
    loopRepeatLimit,
    setLoopRepeatLimit,
    countIn,
    setCountIn,
    setCurrentPage,
  } = useTrainingContext();

  const loopModes = [
    'endless',
    'accelerate',
    'decelerate',
    'repeat-accel-decel',
    'repeat-decel-accel',
  ];

  return (
    <div className="space-y-4 p-4 bg-gray-900 rounded-lg shadow-lg text-white">
      <h2 className="text-xl font-bold">ループ設定</h2>

      <div>
        <label className="block mb-1">ループパターン</label>
        <select
          value={loopMode}
          onChange={(e) => setLoopMode(e.target.value)}
          className="w-full bg-gray-800 p-2 rounded"
        >
          <option value="endless">ひたすら繰り返す</option>
          <option value="accelerate">上昇</option>
          <option value="decelerate">下降</option>
          <option value="repeat-accel-decel">繰り返し上昇</option>
          <option value="repeat-decel-accel">繰り返し下降</option>
        </select>
      </div>

      {!loopMode.startsWith('endless') && (
        <div>
          <label className="block mb-1">テンポの変化刻み（BPM）</label>
          <input
            type="number"
            value={tempoStep}
            onChange={(e) => setTempoStep(Number(e.target.value))}
            className="w-full bg-gray-800 p-2 rounded"
          />
        </div>
      )}

      {!loopMode.startsWith('endless') && (
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1">最小テンポ</label>
            <input
              type="number"
              value={minTempo}
              onChange={(e) => setMinTempo(Number(e.target.value))}
              className="w-full bg-gray-800 p-2 rounded"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1">最大テンポ</label>
            <input
              type="number"
              value={maxTempo}
              onChange={(e) => setMaxTempo(Number(e.target.value))}
              className="w-full bg-gray-800 p-2 rounded"
            />
          </div>
        </div>
      )}

      {!loopMode.startsWith('endless') && (
        <div>
          <label className="block mb-1">何回繰り返しでテンポを変化させるか</label>
          <input
            type="number"
            value={loopChangeCount}
            onChange={(e) => setLoopChangeCount(Number(e.target.value))}
            className="w-full bg-gray-800 p-2 rounded"
          />
        </div>
      )}

      {loopMode.startsWith('repeat') && (
        <div>
          <label className="block mb-1">ループの繰り返し回数</label>
          <input
            type="number"
            value={loopRepeatLimit}
            onChange={(e) => setLoopRepeatLimit(Number(e.target.value))}
            className="w-full bg-gray-800 p-2 rounded"
          />
        </div>
      )}

      {loopMode.startsWith('endless') && (
        <div>
          <label className="block mb-1">繰り返し回数</label>
          <input
            type="number"
            value={loopRepeatLimit}
            onChange={(e) => setLoopRepeatLimit(Number(e.target.value))}
            className="w-full bg-gray-800 p-2 rounded"
          />
        </div>
      )}

      {!loopMode.startsWith('endless') && (
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            checked={countIn}
            onChange={(e) => setCountIn(e.target.checked)}
            className="mr-2"
          />
          <label>テンポ変化時に空小節を1小節追加する<br />※テンポが変わったタイミングでベルが鳴ります</label>
        </div>
      )}

      <div className="flex justify-between mt-6">
          <button
              onClick={() => setCurrentPage('part')}
              className="bg-gradient-to-br from-gray-600 to-black hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
              ← パート設定に戻る
          </button>
          <button
              onClick={() => setCurrentPage('base')}
              className="bg-gradient-to-br from-blue-600 to-black hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
              設定へ進む →
          </button>
      </div>
    </div>
  );
};

export default TrainingLoopSetting;
