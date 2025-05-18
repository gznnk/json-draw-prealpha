// SampleContent.tsx
import { memo } from "react";
import type { ReactNode } from "react";
import { SampleContainer } from "./SampleContentStyled";

type SampleContentProps = {
	title: string;
	bgColor?: string;
};

/**
 * サンプルコンテンツを表示するシンプルなコンポーネント
 *
 * @param title - 表示するタイトル
 * @param bgColor - 背景色 (オプション)
 * @returns コンポーネント
 */
const SampleContentComponent = ({
	title,
	bgColor = "#f5f5f5",
}: SampleContentProps): ReactNode => {
	return (
		<SampleContainer style={{ backgroundColor: bgColor }}>
			<h2>{title}</h2>
			<p>このエリアにはサンプルコンテンツが表示されます。</p>
		</SampleContainer>
	);
};

export const SampleContent = memo(SampleContentComponent);
