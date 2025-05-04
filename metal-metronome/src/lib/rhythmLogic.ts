/**
 * ファイル名：src/lib/rhythmLogic.ts
 * 目的：リズム再生に必要な数値ロジック・タイミング計算を行うユーティリティ
 *
 * 機能概要：
 * - BPM／音価から1拍の長さ（ms）を算出
 * - 円周上の点配置座標を計算
 * - 各拍・各音符のタイミング／強弱→音量の変換
 *
 * 今後の拡張予定：
 * - 自動テンポ変化（チェンジアップ／往復）
 * - 表示密度チェックによる描画最適化
 */

import * as Tone from 'tone';

let tempoLoopId: NodeJS.Timeout | null = null;

// シンセを定義（基本は1音だけ鳴らす）
const synth = new Tone.Synth().toDestination();
const accentSynth = new Tone.MembraneSynth().toDestination(); // アクセント
const normalSynth = new Tone.MembraneSynth().toDestination(); // 通常
const ghostSynth = new Tone.MembraneSynth().toDestination(); // ゴーストノート
const kickPlayer = new Tone.Player('/sounds/kick.wav').toDestination();

export const loadSamples = async () => {
    await Tone.loaded();
};

export const playKick = () => {
    kickPlayer.start();
};

/**
 * 1音だけ鳴らす
 */
export const playBeat = async () => {
    await Tone.start();
    kickPlayer.start();
};

export const playTempoClick = (accent: "accent" | "normal" | "ghost" | "none") => {
    switch (accent) {
        case "accent":
            accentSynth.triggerAttackRelease("C4", "16n", Tone.now() + 0.000001, 1); // 大きく
            break;
        case "normal":
            normalSynth.triggerAttackRelease("C4", "16n", Tone.now() + 0.000001, 0.6);
            break;
        case "ghost":
            ghostSynth.triggerAttackRelease("C4", "16n", Tone.now() + 0.000001, 0.3);
            break;
        case "none":
            // 無音：なにもしない
            break;
    }
};

export const startTempoLoop = (
    bpm: number,
    noteValue: "quarter" | "eighth" | "dotted-eighth",
    accents: ("accent" | "normal" | "ghost" | "none")[],
    setCurrentAccentStep: (step: number) => void
) => {
    const noteFactor = noteValue === "quarter" ? 1 : noteValue === "eighth" ? 0.5 : 0.75;
    const interval = (60_000 / bpm) * noteFactor;
    let step = 0;

    tempoLoopId = setInterval(() => {
        setCurrentAccentStep(step);
        playTempoClick(accents[step]);
        step = (step + 1) % accents.length;
    }, interval);
};

export const stopTempoLoop = () => {
    if (tempoLoopId) {
        clearInterval(tempoLoopId);
        tempoLoopId = null;
    }
};
