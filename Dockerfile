# 公式のNodeイメージをベースに
FROM node:22-slim

# 作業ディレクトリ作成
WORKDIR /app

# 依存ファイルをコピー
COPY metal-metronome/package*.json ./

# 依存インストール
RUN npm install

# 残りのソースをコピー
COPY metal-metronome/ ./

# デフォルト起動コマンド（開発用サーバー起動）
CMD ["npm", "run", "dev"]
