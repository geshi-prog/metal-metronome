// types/training.ts

export type NoteValue = 'quarter' | 'eighth';
export type AccentType = 'strong' | 'normal' | 'weak' | 'none';

export type Rhythm = {
    n: number;    // 拍数
    m: number;    // 分割数
    sound: string;    // 音色名（例: "snare", "kick"）
    volumes: number[];    // 各音の音量
};

export type RhythmPart = {
    label: string;    // 表示用（例: "右足"）
    rhythms: Rhythm[];
};

export type Section = {
    numerator: number;
    denominator: 1 | 2 | 4 | 8 | 16;
    noteValue: NoteValue;
    bpm: number;
    loopCount: number;
    parts: RhythmPart[];    // 最大4パート
};
