# Chatty - リアルタイムチャットアプリ

シンプルで美しいリアルタイムチャットアプリケーションです。

## 特徴

- 🚀 **リアルタイム通信**: WebSocketを使用した高速なメッセージング
- 📱 **モバイルファースト**: レスポンシブデザインでモバイルに最適化
- 🎨 **美しいUI**: 紫のグラデーションとモダンなデザイン
- 📁 **ファイル共有**: 画像・動画ファイルの共有に対応
- ⏰ **24時間制限**: ルームは24時間で自動削除
- 👥 **参加者表示**: Zoom風の参加者リスト

## 技術スタック

- **フロントエンド**: Next.js 14, React, TypeScript
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: Radix UI
- **リアルタイム通信**: WebSocket
- **デプロイ**: Vercel

## セットアップ

### 必要な環境

- Node.js 18以上
- pnpm

### インストール

```bash
# 依存関係をインストール
pnpm install

# 開発サーバーを起動（Next.js + WebSocket）
pnpm dev:full

# または個別に起動
pnpm dev        # Next.js開発サーバー
pnpm websocket  # WebSocketサーバー
```

### アクセス

- **フロントエンド**: http://localhost:3000
- **WebSocketサーバー**: ws://localhost:8080

## 使用方法

1. ホームページでニックネームを入力
2. 「新しいルームを作成」をクリック
3. 生成されたURLを他の人と共有
4. リアルタイムでチャットを楽しむ

## デプロイ

### Vercelでのデプロイ

1. GitHubリポジトリをVercelに接続
2. 環境変数を設定（必要に応じて）
3. デプロイを実行

### WebSocketサーバーのデプロイ

WebSocketサーバーは別途デプロイが必要です。以下のオプションがあります：

- **Railway**: Node.jsアプリケーションとしてデプロイ
- **Heroku**: WebSocket対応のプラットフォーム
- **DigitalOcean App Platform**: フルスタックアプリケーション

## プロジェクト構造

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── room/              # ルームページ
│   └── page.tsx           # ホームページ
├── components/            # Reactコンポーネント
│   ├── ui/               # UIコンポーネント
│   ├── chat-input.tsx    # チャット入力
│   ├── chat-message.tsx  # メッセージ表示
│   └── user-list.tsx     # 参加者リスト
├── hooks/                # カスタムフック
├── lib/                  # ユーティリティ
├── scripts/              # WebSocketサーバー
└── public/               # 静的ファイル
```

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します！
