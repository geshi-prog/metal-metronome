// types/training.ts

export type NoteValue = 'quarter' | 'eighth';
export type AccentType = 'strong' | 'normal' | 'weak' | 'none';
export type TempoChangeMode = 'endless' | 'accelerate' | 'decelerate' | 'repeat-accel-decel' | 'repeat-decel-accel';
export type TrainingPage = 'base' | 'measure' | 'part' | 'loop';

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
    name?: string;
    description?: string;
    numerator: number;
    denominator: 1 | 2 | 4 | 8 | 16;
    noteValue: NoteValue;
    bpm: number;
    loopCount: number;
    parts: RhythmPart[];    // 最大4パート
};

export type Beat = {
    isStart?: boolean;
    n?: number;
    m?: number;
    sound?: string;
    volumes?: number[];
};

export type Part = {
    beats: Beat[];
};

export type TempoSetting = {
    loopCountPerStep: number;
    tempoStep: number;
    minTempo: number;
    maxTempo: number;
    mode: TempoChangeMode;
    includeCountIn: boolean;
};

export type ClickTrackData = {
    bpm: number;
    noteValue: "quarter" | "eighth";
    denominator: 1 | 2 | 4 | 8 | 16;
    accent: "bell" | "strong" | "normal" | "weak" | "none";
};

export type RhythmPartData = {
    bpm: number;
    noteValue: "quarter" | "eighth";
    denominator: 1 | 2 | 4 | 8 | 16;
    n: number;    // 拍数
    m: number;    // 分割数
    sound: string; // ex. "kick", "snare", ...
    volume: number;
};

export type RhythmSoundSource = {
    clickTracks: ClickTrackData[][];        // 各テンポステップごとに配列
    rhythmTracks: RhythmPartData[][][];     // [tempoStep][part][note]
    countInTrack?: ClickTrackData[][];        // オプション：カウントイン用
};
