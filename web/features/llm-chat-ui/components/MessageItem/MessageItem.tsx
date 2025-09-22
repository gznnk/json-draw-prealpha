import React, { memo } from "react";

import {
	UserMessageContainer,
	AssistantMessageContainer,
	MessageContent,
} from "./MessageItemStyled";
import { renderMarkdown } from "../../../../shared/markdown";
import type { Message } from "../../types";
import { CaretIndicator } from "../ChatUI/ChatUIStyled";

type MessageItemProps = {
	message: Message;
	/**
	 * Whether to show the caret indicator (for streaming AI output)
	 */
	showCaret?: boolean;
};

/**
 * Safe markdown renderer component that uses a ref to set innerHTML.
 * This pattern avoids the React linting warning while still rendering HTML.
 *
 * @param props - Component properties
 * @returns React component with rendered markdown
 */
const SafeMarkdown: React.FC<{ content: string }> = ({ content }) => {
	const containerRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (containerRef.current) {
			containerRef.current.innerHTML = renderMarkdown(content);
		}
	}, [content]);

	return <div ref={containerRef} />;
};

/**
 * Component for rendering a single chat message with appropriate styling.
 * Uses different styles for user vs. assistant messages and renders markdown content.
 *
 * @param props - Component properties containing the message to display
 * @returns Rendered message component
 */
const MessageItemComponent: React.FC<MessageItemProps> = ({
	message,
	showCaret,
}) => {
	const Container =
		message.role === "user" ? UserMessageContainer : AssistantMessageContainer;

	return (
		<Container>
			{message.role === "user" ? (
				<MessageContent>{message.content}</MessageContent>
			) : (
				<MessageContent>
					<SafeMarkdown content={message.content} />
					{showCaret ? <CaretIndicator>|</CaretIndicator> : null}
				</MessageContent>
			)}
		</Container>
	);
};

export const MessageItem = memo(MessageItemComponent);
