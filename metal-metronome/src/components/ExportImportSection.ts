// components/ExportImportSection.ts
import { Section, RhythmPartData } from '@/types/trainingTypes';

export function exportSingleSection(
  sectionIndex: number,
  sections: Section[],
  parts: RhythmPartData[],
  accentList: string[]
) {
  const section = sections[sectionIndex];
  const numerator = section.numerator;
  const denominator = section.denominator;
  const bpm = section.bpm;
  const name = section.name || '無し';

  // 小節のビート範囲
  const startIndex = sections.slice(0, sectionIndex).reduce((sum, s) => sum + s.numerator, 0);
  const endIndex = startIndex + numerator;

  // 連結チェック（他の小節とリズムがまたがっているか）
  for (const part of parts) {
    for (let i = startIndex; i < endIndex; i++) {
      const beat = part.beats[i];
      if (!beat?.isStart && (beat?.n ?? 1) > 1) {
        alert('この小節は他の小節と連結しているため、エクスポートできません。');
        return;
      }
    }
  }

  const exportedSection = [section];
  const exportedParts = parts.map((p) => ({
    ...p,
    beats: p.beats.slice(startIndex, endIndex),
  }));
  const exportedAccentList = accentList.slice(startIndex, endIndex);

  const data = {
    sections: exportedSection,
    parts: exportedParts,
    accentList: exportedAccentList,
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });

  const safeName = name.replace(/[\\/:*?"<>|]/g, '_');
  const fileName = `${numerator}_${denominator}_${bpm}_${safeName}.json`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export function importSingleSection(
  sectionIndex: number,
  currentSections: Section[],
  currentParts: RhythmPartData[],
  currentAccentList: string[],
  onSuccess: (newSections: Section[], newParts: RhythmPartData[], newAccentList: string[]) => void,
  data?: any // ← ★ 外部から直接渡されたデータ（オプション）
) {
  const handleImport = (data: any) => {
    try {
      const [importSection] = data.sections;
      const importParts: RhythmPartData[] = data.parts;
      const importAccentList: string[] = data.accentList;

      // 現在の小節と連結していたら拒否
      const startIndex = currentSections.slice(0, sectionIndex).reduce((sum, s) => sum + s.numerator, 0);
      const endIndex = startIndex + currentSections[sectionIndex].numerator;

      for (const part of currentParts) {
        for (let i = startIndex; i < endIndex; i++) {
          const beat = part.beats[i];
          if (!beat?.isStart && (beat?.n ?? 1) > 1) {
            alert('インポート先の小節は他の小節と連結しているため、インポートできません。');
            return;
          }
        }
      }

      // 拍子チェック
      const section = currentSections[sectionIndex];
      if (
        section.numerator !== importSection.numerator ||
        section.denominator !== importSection.denominator
      ) {
        alert('インポート元とインポート先の拍子が一致しないため、インポートできません。');
        return;
      }

      // 差し替え処理
      const newSections = [...currentSections];
      newSections[sectionIndex] = {
        ...section,
        ...importSection,
      };

      const newParts = currentParts.map((part, i) => {
        const newBeats = [...part.beats];
        const importedBeats = importParts[i]?.beats ?? [];
        newBeats.splice(startIndex, importSection.numerator, ...importedBeats);
        return { ...part, beats: newBeats };
      });

      const newAccentList = [...currentAccentList];
      newAccentList.splice(startIndex, importSection.numerator, ...importAccentList);

      onSuccess(newSections, newParts, newAccentList);
    } catch (err) {
      console.error('インポート失敗:', err);
      alert('JSONデータが正しくありません。');
    }
  };

  if (data) {
    // 外部から直接データが渡された場合
    handleImport(data);
  } else {
    // 今まで通りファイル選択で読み込む
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const result = reader.result as string;
          const data = JSON.parse(result);
          handleImport(data);
        } catch (err) {
          console.error('インポート失敗:', err);
          alert('JSONファイルが正しくありません。');
        }
      };
      reader.readAsText(file);
    };

    input.click();
  }
}
