// src/lib/trainingRhythm.ts
import * as Tone from 'tone';
import { RhythmPartData } from '@/types/training';

const beatPlayers: { [key: string]: Tone.Player[] } = {};

const SOUND_FILES: { [key: string]: string } = {
  kick: 'sounds/kick.wav',
  kick_sub: 'sounds/kick_sub.wav',
  snare: 'sounds/snare.wav',
  snare_ghost: 'sounds/snare_ghost.wav',
  snare_rim: 'sounds/snare_rim.wav',
  tom_high1: 'sounds/tom_high1.wav',
  tom_high2: 'sounds/tom_high2.wav',
  tom_mid1: 'sounds/tom_mid1.wav',
  tom_mid2: 'sounds/tom_mid2.wav',
  tom_low1: 'sounds/tom_low1.wav',
  tom_low2: 'sounds/tom_low2.wav',
  hihat_closed: 'sounds/hihat_closed.wav',
  hihat_open: 'sounds/hihat_open.wav',
  hihat_pedal: 'sounds/hihat_pedal.wav',
  crash1: 'sounds/crash1.wav',
  crash2: 'sounds/crash2.wav',
  ride_bell: 'sounds/ride_bell.wav',
  ride_crash: 'sounds/ride_crash.wav',
  ride_tip: 'sounds/ride_tip.wav',
  china: 'sounds/china.wav',
  splash: 'sounds/splash.wav',
  bell: 'sounds/bell.wav',
  click: 'sounds/click.wav',
  click_high: 'sounds/click_high.wav',
};

export const loadTrainingSamples = async (partCount: number = 4) => {
  await Tone.loaded();
  for (const soundName in SOUND_FILES) {
    beatPlayers[soundName] = [];
    for (let i = 0; i < partCount + 1; i++) {
      const player = new Tone.Player(SOUND_FILES[soundName]).toDestination();
      await player.load(SOUND_FILES[soundName]);
      beatPlayers[soundName][i] = player;
    }
  }
};

export const playBeat = (index: number, isMuted: boolean, time: number, volume: number = 1.0, sound: string) => {
  if (isMuted) return;

  const player = beatPlayers[sound]?.[index];
  if (!player || !player.buffer.loaded) {
    console.warn(`プレイヤー未ロード: ${sound}[${index}]`);
    return;
  }

  // プレイヤーが同じインスタンスだと start(time) の制約に引っかかるので clone する
  const cloned = new Tone.Player(player.buffer).toDestination();
  cloned.volume.value = Tone.gainToDb(volume);
  cloned.start(time);

  // メモリ節約のため終了後に dispose
  cloned.stop(time + 1); // 1秒後に自動停止（必要なら正確な時間に調整）
  Tone.Transport.scheduleOnce(() => cloned.dispose(), time + 2);
};

const getSecondsPerBeat = (
  bpm: number,
  denominator: 1 | 2 | 4 | 8 | 16,
  noteValue: "quarter" | "eighth"
): number => {
  const noteBase = noteValue === "quarter" ? 4 : noteValue === "eighth" ? 8 : 6;
  const beatsPerWholeNote = noteBase / denominator;
  return (60 / bpm) * beatsPerWholeNote;
};

export async function playConvertedSounds(
  convertedSounds: RhythmPartData[][][],
  setIsPlaying: (flag: boolean) => void
) {
  let currentLoop = 0;

  const scheduleNextLoop = () => {
    if (currentLoop >= convertedSounds.length) {
      stopTrainingRhythm(setIsPlaying);
      return;
    }

    const now = Tone.now() + 0.1;
    const currentLoopData = convertedSounds[currentLoop];

    const partTimes: number[] = currentLoopData.map(() => now);
    let maxEndTime = now;

    for (let partIndex = 0; partIndex < currentLoopData.length; partIndex++) {
      let partTime = partTimes[partIndex];

      for (const beat of currentLoopData[partIndex]) {
        const secondsPerBeat = getSecondsPerBeat(beat.bpm, beat.denominator, beat.noteValue);
        const beatDuration = (secondsPerBeat * beat.n) / beat.m;

        // volumeが配列でも先頭だけ使う（volume[0]）
        const vol = beat.volume;

        playBeat(partIndex, false, partTime, vol, beat.sound);

        partTime += beatDuration;
      }

      partTimes[partIndex] = partTime;
      maxEndTime = Math.max(maxEndTime, partTime);
    }

    currentLoop++;
    const loopDuration = maxEndTime - now;
    Tone.Transport.scheduleOnce(scheduleNextLoop, `+${loopDuration}`);
  };

  setIsPlaying(true);
  scheduleNextLoop();
  Tone.Transport.start();
};


/**
 * 強制停止関数
 */
export const forceStopTrainingPlayback = () => {
  Tone.Transport.stop();
  Tone.Transport.cancel();

  for (const sound in beatPlayers) {
    const players = beatPlayers[sound];
    players?.forEach((player) => {
      try {
        player.stop();
      } catch (e) {
        console.warn(`プレイヤー停止失敗: ${sound}`, e);
      }
    });
  }
};

export function stopTrainingRhythm(setIsPlaying: (flag: boolean) => void) {
  forceStopTrainingPlayback();
  setIsPlaying(false);
}
