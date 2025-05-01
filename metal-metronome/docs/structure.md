# 📦 metal-metronome ディレクトリ構成（2025年版）

このドキュメントは、メトロノームアプリのディレクトリ構造を開発途中でもすぐに把握できるようにするための備忘録です。

---

## 📂 全体構成

```
metal-metronome/
├── public/                        # 公開ファイル（manifest, iconなど）
├── src/
│   ├── assets/                    # 音素材や画像などの静的リソース
│   ├── components/               # 汎用UIパーツ
│   │   ├── tempo/                # テンポ・音価・拾子関連
│   │   │   └── TempoControl.tsx
│   │   ├── playback/             # 再生コントロール関連
│   │   │   └── PlaybackControls.tsx
│   │   ├── control/              # 各パネルの操作系UI
│   │   │   ├── AccentSelector.tsx
│   │   │   ├── MuteToggle.tsx
│   │   │   └── ModeSwitch.tsx
│   ├── features/
│   │   └── rhythmMode/           # 🌟 リズムモード専用の機能群
│   │       ├── PartPanel.tsx
│   │       ├── RhythmVisualizer.tsx
│   │       └── RhythmModePage.tsx
│   ├── lib/                       # 計算ロジック・ユーティリティ
│   │   └── rhythmLogic.ts        # BPM→ms, 点配置など
│   ├── contexts/                 # グローバル状態管理
│   │   └── RhythmContext.tsx
│   ├── hooks/                    # カスタムフック
│   │   └── useTapTempo.ts
│   ├── styles/                   # グローバルCSSやTailwind設定
│   ├── sandbox/                  # テスト用画面/コンポーネント確認
│   │   ├── TestTempo.tsx
│   │   ├── TestPlayback.tsx
│   │   └── index.tsx
│   ├── App.tsx                   # アプリのルート構成
│   └── main.tsx                  # エントリーポイント
├── docs/                         # ドキュメント（このファイルなど）
│   └── structure.md
├── README.md
├── tsconfig.json
├── tailwind.config.ts
└── vite.config.ts
```

---

## 🔁 再利用対象コンポーネント一覧（他モードでも共通使用）

- `components/tempo/TempoControl.tsx`
- `components/playback/PlaybackControls.tsx`
- `components/control/AccentSelector.tsx`
- `components/control/MuteToggle.tsx`
- `components/control/ModeSwitch.tsx`
- `lib/rhythmLogic.ts`

今後、小節モード・ガイド機能・プリセットなどにも利用予定。

---

## ✍️ 更新メモ
- この構成はリズムモードの設計確定時点（2025/05/01）での最新構成です。
- 機能追加の際はこのファイルを更新してください。
