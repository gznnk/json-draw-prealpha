# AIワークフロー・キャンバス・エディター

このプロジェクトは、AIを活用したビジュアルワークフローエディターです。SVGベースのインタラクティブなキャンバス上で、AIノード、テキストノード、画像生成ノードなどを配置し、それらを接続してワークフローを構築することができます。

## 🌟 主な機能

### ✨ SVGキャンバス
- **インタラクティブなキャンバス**: ドラッグ&ドロップによる直感的な操作
- **複数ノードタイプ**: テキスト、AI、画像生成、Webサーチ、ハブノードなど
- **ノード接続**: ビジュアルな接続線によるデータフロー表現
- **変形機能**: リサイズ、回転、スケーリング
- **選択機能**: 単一選択、複数選択、エリア選択
- **ミニマップ**: キャンバス全体の俯瞰表示とナビゲーション

### 🤖 AI統合
- **OpenAI API統合**: GPT-4を使用したAI機能
- **LLMクライアント**: 統一されたLLMインターフェース
- **ワークフローエージェント**: 自然言語からワークフロー自動生成
- **ファンクションコール**: AIツールとの連携

### 💬 チャットUI
- **マークダウン対応**: リアルタイムレンダリング
- **数式表示**: KaTeX による LaTeX 数式サポート
- **コードハイライト**: highlight.js によるシンタックスハイライト
- **ストリーミング**: リアルタイム応答表示

### 📝 マークダウンエディター
- **デュアルペイン**: エディター・プレビューの分割表示
- **数式サポート**: インライン・ブロック数式
- **シンタックスハイライト**: 多言語対応
- **セキュリティ**: DOMPurifyによるサニタイズ

## 🏗️ アーキテクチャ

### フォルダ構成
```
src/
├── app/                    # メインアプリケーション
│   ├── components/         # UI コンポーネント
│   ├── hooks/             # アプリケーションフック
│   ├── models/            # データモデル
│   └── tools/             # アプリケーションツール
├── features/              # 機能モジュール
│   ├── svg-canvas/        # SVGキャンバス機能
│   ├── llm-chat-ui/       # チャットUI機能
│   └── markdown-editor/   # マークダウンエディター
├── shared/                # 共有ユーティリティ
│   ├── llm-client/        # LLM クライアント
│   ├── event-bus/         # イベントバス
│   └── markdown/          # マークダウン処理
└── utils/                 # ユーティリティ
```

### 依存関係ルール
- `app` → `features` → `shared`
- `shared` モジュールは他に依存しない
- フィーチャー間の直接依存は制限

## 🚀 クイックスタート

### 必要条件
- Node.js 18+
- npm または yarn
- OpenAI API キー（AI機能を使用する場合）

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd react-vite-project

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

### ビルド

```bash
# プロダクションビルド
npm run build

# ビルドのプレビュー
npm run preview

# デプロイ（GitHub Pages）
npm run deploy
```

## 🛠️ 開発ツール

### コード品質
- **Biome**: リンティング・フォーマッティング
- **ESLint**: 追加のリンティングルール
- **TypeScript**: 型安全性
- **Jest**: ユニットテスト

### 依存関係管理
```bash
# 依存関係グラフ生成
npm run dep

# 循環依存関係チェック
npm run dep:check

# 依存関係リスト出力
npm run dep:list
```

### テスト
```bash
# テスト実行
npm test
```

## 📦 主要な技術スタック

### フロントエンド
- **React 19**: UIライブラリ
- **TypeScript**: 型安全性
- **Emotion**: CSS-in-JS スタイリング
- **Vite**: ビルドツール

### AI・ML
- **OpenAI API**: GPT-4統合
- **@anthropic-ai/sdk**: Claude統合

### マークダウン・数式
- **markdown-it**: マークダウンパーサー
- **KaTeX**: 数式レンダリング
- **highlight.js**: シンタックスハイライト
- **DOMPurify**: XSSプロテクション

## 🎨 デザインシステム

### カラーパレット（ダークテーマ）
- **メインバックグラウンド**: `#0C0F1C`
- **セクションバックグラウンド**: `#1A1F33`
- **要素バックグラウンド**: `#2A2F4C`
- **プライマリテキスト**: `#C0C4D2`
- **アクセントカラー**: `#3A79B8` / `#4EA1FF`

### コンポーネント規約
- アロー関数による関数コンポーネント
- `memo()` によるメモ化
- 名前付きエクスポート（デフォルトエクスポート禁止）
- 明示的な型定義

## 🔧 設定

### 環境変数
AI機能を使用する場合は、アプリケーション内でAPIキーを設定してください。

### VS Code設定
推奨拡張機能：
- React Developer Tools（含む）
- Biome
- TypeScript Importer

## 📖 コーディング規約

詳細なコーディング規約は `.github/copilot-instructions.md` を参照してください。

### 主要なルール
- ダブルクォート使用
- セミコロン必須
- Node.js組み込みモジュールは `node:` プレフィックス
- コメントは英語で記述
- JSDoc形式のドキュメント

## 🐛 トラブルシューティング

### よくある問題

**ビルドエラー**
```bash
npm run build
```
でエラーが発生する場合は、型エラーやリンティングエラーを確認してください。

**依存関係エラー**
```bash
npm run dep:check
```
で循環依存がないか確認してください。

## 📜 ライセンス

このソフトウェアは proprietary ライセンスの下で提供されています。詳細は `vite.config.ts` を参照してください。

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📚 追加リソース

- [Vite ドキュメント](https://vitejs.dev/)
- [React ドキュメント](https://react.dev/)
- [TypeScript ドキュメント](https://www.typescriptlang.org/)
- [OpenAI API ドキュメント](https://platform.openai.com/docs)
