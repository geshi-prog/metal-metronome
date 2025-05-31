// src/components/ExportImportControls.tsx
import React from 'react';
import { useTrainingContext } from '@/contexts/TrainingContext';

const ExportImportControls: React.FC = () => {
  const ctx = useTrainingContext();

  const presetRhythms = [
    { label: '選択してください', value: '' },
    { label: 'チェンジアップ', value: 'チェンジアップ.json' },
  ];

  const handleExport = () => {
    const data = {
      sections: ctx.sections,
      parts: ctx.parts,
      rhythmName: ctx.rhythmName,
      tempoSetting: ctx.tempoSetting,
      accentType: ctx.accentType,
      accentList: ctx.accentList,
      loopMode: ctx.loopMode,
      tempoStep: ctx.tempoStep,
      minTempo: ctx.minTempo,
      maxTempo: ctx.maxTempo,
      loopChangeCount: ctx.loopChangeCount,
      loopRepeatLimit: ctx.loopRepeatLimit,
      countIn: ctx.countIn,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });

    // 📅 日付を YYYYMMDD 形式で生成
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const dateStr = `${y}${m}${d}`;
    // 🎵 rhythmName + 日付
    const safeName = ctx.rhythmName.replace(/[\\/:*?"<>|]/g, '_'); // ファイル名に使えない文字の置換
    const filename = `${safeName}_${dateStr}.json`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = reader.result as string;
        const data = JSON.parse(result);

        ctx.setSections(data.sections);
        ctx.setParts(data.parts);
        ctx.setRhythmName(data.rhythmName);
        ctx.setTempoSetting(data.tempoSetting);
        ctx.setAccentType(data.accentType);
        ctx.setAccentList(data.accentList);
        ctx.setLoopMode(data.loopMode);
        ctx.setTempoStep(data.tempoStep);
        ctx.setMinTempo(data.minTempo);
        ctx.setMaxTempo(data.maxTempo);
        ctx.setLoopChangeCount(data.loopChangeCount);
        ctx.setLoopRepeatLimit(data.loopRepeatLimit);
        ctx.setCountIn(data.countIn);

        alert('設定をインポートしました✨');
      } catch (err) {
        console.error('インポート失敗:', err);
        alert('JSONファイルが正しくありません。');
      }
    };
    reader.readAsText(file);
  };

  const handlePresetImport = async (filename: string) => {
    if (!filename) return;

    try {
      const res = await fetch(`/metal-metronome/json/rhythm/${filename}`);
      const data = await res.json();

      ctx.setSections(data.sections);
      ctx.setParts(data.parts);
      ctx.setRhythmName(data.rhythmName);
      ctx.setTempoSetting(data.tempoSetting);
      ctx.setAccentType(data.accentType);
      ctx.setAccentList(data.accentList);
      ctx.setLoopMode(data.loopMode);
      ctx.setTempoStep(data.tempoStep);
      ctx.setMinTempo(data.minTempo);
      ctx.setMaxTempo(data.maxTempo);
      ctx.setLoopChangeCount(data.loopChangeCount);
      ctx.setLoopRepeatLimit(data.loopRepeatLimit);
      ctx.setCountIn(data.countIn);

      alert(`🎵 ${filename} を読み込みました`);
    } catch (err) {
      console.error('プリセット読み込み失敗:', err);
      alert('プリセットの読み込みに失敗しました');
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div>
        <label className="text-white mr-2">リズムプリセット:</label>
        <select
          onChange={(e) => handlePresetImport(e.target.value)}
          className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
        >
          {presetRhythms.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>
  
      <div>
        <button
          className="ml-4 inline-block bg-gradient-to-br from-blue-600 to-black hover:bg-green-700 text-white font-semibold px-4 py-2 rounded cursor-pointer transition duration-200"
          onClick={handleExport}
        >
          📤 エクスポート
        </button>
        <label className="ml-4 inline-block bg-gradient-to-br from-green-600 to-black hover:bg-green-700 text-white font-semibold px-4 py-2 rounded cursor-pointer transition duration-200">
          📥 インポート
          <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  );
};

export default ExportImportControls;
