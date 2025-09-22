import { memo } from "react";
import type { ReactElement } from "react";

import {
	EMPTY_CONTENT_MESSAGE,
	NO_SELECTION_MESSAGE,
} from "./ContentViewConstants";
import { Container, EmptyContent } from "./ContentViewStyled";
import type { ContentViewProps } from "./ContentViewTypes";
import { MarkdownEditor } from "../../../features/markdown-editor";
import type { SvgCanvasData } from "../../../features/svg-canvas/canvas/types/SvgCanvasData";
import { ContentType } from "../../types/ContentType";
import { CanvasView } from "../CanvasView";

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
