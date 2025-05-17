import { memo, useState, type ReactElement } from "react";
import styled from "@emotion/styled";
import { MarkdownEditor } from "../../../features/markdown-editor";

const sampleMarkdown = `# マークダウンエディタのサンプル

これは**マークダウンエディタ**のサンプルです。

## 機能
- マークダウンの編集
- リアルタイムプレビュー
- 表示モードの切り替え
  - 分割表示
  - エディタのみ
  - プレビューのみ

## コードサンプル

\`\`\`javascript
// サンプルコード
function hello() {
  console.log("Hello, Markdown!");
}
\`\`\`

## 数式サポート
以下は数式の例です：

$E = mc^2$

$$
\\frac{d}{dx}\\left( \\int_{0}^{x} f(u)\\,du\\right) = f(x)
$$

## 表
| 名前 | 説明 |
| ---- | ---- |
| マークダウン | テキストを整形するための軽量マークアップ言語 |
| エディタ | テキストを編集するためのツール |

## リンク
[Markdown 公式サイト](https://daringfireball.net/projects/markdown/)`;

const Container = styled.div`
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
`;

const Title = styled.h1`
  margin-bottom: 20px;
`;

const StatusBar = styled.div`
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
`;

const MarkdownEditorSampleComponent = (): ReactElement => {
	const [markdown, setMarkdown] = useState(sampleMarkdown);

	const handleChange = (newMarkdown: string) => {
		setMarkdown(newMarkdown);
	};

	return (
		<Container>
			<Title>マークダウンエディタサンプル</Title>
			<div style={{ height: "600px" }}>
				<MarkdownEditor
					initialMarkdown={markdown}
					onChange={handleChange}
					minHeight={500}
				/>
			</div>
			<StatusBar>
				<p>文字数: {markdown.length}</p>
			</StatusBar>
		</Container>
	);
};

export const MarkdownEditorSample = memo(MarkdownEditorSampleComponent);
