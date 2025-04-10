# 命名規則（Naming Conventions）

命名スタイルと、その用途や使われる場面を以下に整理します。

| 命名スタイル              | 使われるもの                                                                 | 例                                          |
|---------------------------|------------------------------------------------------------------------------|---------------------------------------------|
| `camelCase`               | 変数、関数、フック、props、ローカルな値                                     | `textAlignValue`, `getTextAlign`, `useDrag` |
| `PascalCase`              | コンポーネント、型、クラス、辞書/マップ構造を持つ定数、構造化されたオブジェクト | `Rectangle`, `TextAlignMap`, `CanvasProps`  |
| `SCREAMING_SNAKE_CASE`    | 定数（グローバル値、環境変数、設定など）                                     | `MAX_WIDTH`, `DEFAULT_TIMEOUT`, `API_URL`   |
| `kebab-case`（ディレクトリ名など） | ディレクトリ、URLパス、非JSファイル（例: SCSS）名など                        | `connect-line`, `user-menu`, `text-style`   |

---

## 補足

- **camelCase** はローカルでよく使われるスタイルです。
- **PascalCase** は構造や概念があるもの、再利用されるものに使うと可読性が高まります。
- **SCREAMING_SNAKE_CASE** は、変更されない「設定値」「外部定義」などに向いています。
- **kebab-case** は React プロジェクトではディレクトリ名でよく使われます（Next.js, Vite など）。

---

## おすすめルール例

- フォルダ・ファイルの命名：基本的に `camelCase` または `kebab-case`
- コンポーネント名 / 型名：`PascalCase`
- 再利用関数・ローカル関数：`camelCase`
- 設定値・環境定数：`SCREAMING_SNAKE_CASE`