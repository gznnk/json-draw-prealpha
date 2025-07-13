import { memo } from "react";
import type { ReactElement } from "react";

// Import components
import { MarkdownEditor } from "../../../features/markdown-editor";
import { CanvasView } from "../CanvasView";

// Import types and constants
import { ContentType } from "../../types/ContentType";
import type { ContentViewProps } from "./ContentViewTypes";
import type { SvgCanvasData } from "../../../features/svg-canvas/canvas/types/SvgCanvasData";
import {
	EMPTY_CONTENT_MESSAGE,
	NO_SELECTION_MESSAGE,
} from "./ContentViewConstants";

// Import styled components
import { Container, EmptyContent } from "./ContentViewStyled";

/**
 * View component that displays various types of content.
 * Supports markdown, canvas, sandbox, and other types through a unified interface.
 */
const ContentViewComponent = ({
	type,
	content,
	id,
	onChange,
}: ContentViewProps): ReactElement => {
	return (
		<Container>
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
							// Pass content directly as SvgCanvasData
							return <CanvasView content={content as SvgCanvasData} id={id} />;
						default:
							return <EmptyContent>{EMPTY_CONTENT_MESSAGE}</EmptyContent>;
					}
				})()
			)}
		</Container>
	);
};

export const ContentView = memo(ContentViewComponent);
