import { memo } from "react";
import type { ReactElement } from "react";

// Import components
import { MarkdownEditor } from "../../../features/markdown-editor";
import { SandboxedIframe } from "../../../features/sandboxed-iframe";
import { CanvasView } from "../CanvasView";

// Import types and constants
import { ContentType } from "../../types/ContentType";
import type { ContentViewProps } from "./ContentViewTypes";
import type { SvgCanvasData } from "../../../features/svg-canvas/canvas/SvgCanvasTypes";
import {
	EMPTY_CONTENT_MESSAGE,
	NO_SELECTION_MESSAGE,
} from "./ContentViewConstants";

// Import styled components
import { Container, EmptyContent } from "./ContentViewStyled";

/**
 * 様々な種類のコンテンツを表示するビューコンポーネント
 * マークダウン、キャンバス、サンドボックスなど異なるタイプのコンテンツを
 * 統一されたインターフェースで表示します
 */
const ContentViewComponent = ({
	type,
	content,
	id,
	onChange,
}: ContentViewProps): ReactElement => {
	return (
		<Container>
			{" "}
			{!type ? (
				<EmptyContent>{NO_SELECTION_MESSAGE}</EmptyContent>
			) : (
				(() => {
					switch (type) {
						case ContentType.MARKDOWN:
							return (
								<MarkdownEditor
									markdown={(content as string) || ""}
									onChange={onChange}
								/>
							);
						case ContentType.CANVAS:
							// contentを直接SvgCanvasDataとして渡す
							return <CanvasView content={content as SvgCanvasData} id={id} />;
						case ContentType.SANDBOX:
							return <SandboxedIframe srcdoc={(content as string) || ""} />;
						default:
							return <EmptyContent>{EMPTY_CONTENT_MESSAGE}</EmptyContent>;
					}
				})()
			)}
		</Container>
	);
};

export const ContentView = memo(ContentViewComponent);
