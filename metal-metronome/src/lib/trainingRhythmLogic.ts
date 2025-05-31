// src/lib/trainingRhythmLogic.ts
import * as Tone from 'tone';
import { ClickTrackData, RhythmPartData } from '@/types/training';

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
      await player.load(SOUND_FILES[soundName]); // 🔥 ここが超重要！
      beatPlayers[soundName][i] = player;
    }
  }
};

export const playTrack = (
  data: ClickTrackData | RhythmPartData,
  index: number,
  startTime: number
) => {
  if ('accent' in data) {
    // ClickTrackData
    let sound = 'click';
    let volume = 1.0;
    switch (data.accent) {
      case 'bell':
        sound = 'bell';
        break;
      case 'strong':
        sound = 'click_high';
        break;
      case 'normal':
        sound = 'click';
        break;
      case 'weak':
        sound = 'click';
        volume = 0.5;
        break;
      case 'none':
        sound = 'click';
        volume = 0.0;
        break;
    }
    const player = beatPlayers[sound]?.[index];
    if (player) {
      console.log(volume);
      const volDb = volume <= 0 ? -96 : Tone.gainToDb(volume);
      player.volume.value = Tone.gainToDb(volume);
      player.start(startTime);
    }
  } else {
    // RhythmPartData
    const player = beatPlayers[data.sound]?.[index];
    if (!player) return;

    const totalBeats = data.n;
    const beatLength = (60 / data.bpm); // 1拍の長さ
    const duration = totalBeats * beatLength; // 全体の長さ
    const stepCount = data.m;
    const interval = duration / stepCount;

    let currentTime = startTime;
    for (let i = 0; i < stepCount; i++) {
      const vol = Array.isArray(data.volume) ? data.volume[i] : data.volume ?? 1.0;
      player.volume.value = Tone.gainToDb(vol);
      player.start(currentTime);
      currentTime += interval;
    }
  }
};

export const startTrainingPlayback = (
  clickTracks: ClickTrackData[][],
  rhythmTracks: RhythmPartData[][][],
  onLoopEnd?: () => void
) => {
  const partCount = rhythmTracks[0].length;
  const loopCount = clickTracks.length;
  let currentLoop = 0;

  const scheduleLoop = () => {
    if (currentLoop >= loopCount) {
      Tone.Transport.stop();
      onLoopEnd?.();
      return;
    }

    const now = Tone.now();
    const clickStep = clickTracks[currentLoop];
    const rhythmStep = rhythmTracks[currentLoop];

    // Click 再生
    let clickTime = now;
    clickStep.forEach((click) => {
      playTrack(click, 0, clickTime);
      clickTime += (60 / click.bpm);
    });

    // Rhythm 再生（各パート）
    for (let part = 0; part < partCount; part++) {
      let partTime = now;
      rhythmStep[part].forEach((beat) => {
        playTrack(beat, part + 1, partTime);
        partTime += (60 / beat.bpm) * beat.n;
      });
    }

    currentLoop++;
    const clickDuration = clickStep.reduce((sum, c) => sum + (60 / c.bpm), 0);
    const rhythmDuration = Math.max(
      ...rhythmStep.map(part =>
        part.reduce((sum, beat) => sum + (60 / beat.bpm) * beat.n, 0)
      )
    );
    const loopDuration = Math.max(clickDuration, rhythmDuration);
    Tone.Transport.scheduleOnce(scheduleLoop, `+${loopDuration}`);
  };

  scheduleLoop();
  Tone.Transport.start();
};

export const stopTrainingPlayback = () => {
  Tone.Transport.stop();
  Tone.Transport.cancel();
};

export function playTrainingRhythm(
  clickTracksWithCountIn: ClickTrackData[][],
  rhythmTracksWithCountIn: RhythmPartData[][][],
  setIsPlaying: (flag: boolean) => void
) {
  if (!clickTracksWithCountIn || !rhythmTracksWithCountIn) {
    console.warn("音源が生成されていません！");
    return;
  }
  setIsPlaying(true);
  startTrainingPlayback(clickTracksWithCountIn, rhythmTracksWithCountIn, () => {
    setIsPlaying(false);
  });
}

export function stopTrainingRhythm(setIsPlaying: (flag: boolean) => void) {
  stopTrainingPlayback();
  setIsPlaying(false);
}
/*
export function playRhythm({
  bpm,
  noteValue,
  denominator,
  n,
  m,
  sound,
  volumes,
}: {
  bpm: number;
  noteValue: 'quarter' | 'eighth'; // 拡張用
  denominator: number;
  n: number;
  m: number;
  sound: string;
  volumes: number[];
}) {
  const step: RhythmPartData = {
    bpm,
    n,
    sound,
    volume: volumes,
  };

  const rhythmTracks: RhythmPartData[][][] = [[[step]]]; // [loop][part][beat]

  startSingleRhythmPlayback(rhythmTracks);
}

export const startSingleRhythmPlayback = async (
  rhythmTracks: RhythmPartData[][][],
  onComplete?: () => void
) => {
  const partCount = rhythmTracks[0].length;
  const now = Tone.now();

  for (let part = 0; part < partCount; part++) {
    let partTime = now;
    for (const beat of rhythmTracks[0][part]) {
      await playSingleBeat(beat, part + 1, partTime);
      partTime += (60 / beat.bpm) * beat.n;
    }
  }

  const rhythmDuration = Math.max(
    ...rhythmTracks[0].map(part =>
      part.reduce((sum, beat) => sum + (60 / beat.bpm) * beat.n, 0)
    )
  );

  Tone.Transport.scheduleOnce(() => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    onComplete?.();
  }, now + rhythmDuration);

  Tone.Transport.start();
};

export const playSingleBeat = async (
  data: RhythmPartData,
  partIndex: number,
  startTime: number
) => {
  console.log(data);
  const url = SOUND_FILES[data.sound];
  console.log(url);
  if (!url) return;

  console.log(url);
  const player = new Tone.Player({ url }).toDestination();
  console.log(1);
  await player.load(url);
  console.log(2);

  const totalBeats = data.n;
  const beatLength = 60 / data.bpm;
  const duration = totalBeats * beatLength;
  const stepCount = Array.isArray(data.volume) ? data.volume.length : 1;
  const interval = duration / stepCount;

  for (let i = 0; i < stepCount; i++) {
    const vol = Array.isArray(data.volume) ? data.volume[i] : data.volume ?? 1.0;
    const volDb = Tone.gainToDb(vol);

    // スケジューリングタイムで設定
    const triggerTime = startTime + interval * i;
    player.volume.value = volDb;
    player.start(triggerTime);
    console.log(player);
  }
};
*/
