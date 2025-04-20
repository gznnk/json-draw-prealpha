// Import React.
import type React from "react";
import { memo, useEffect, useRef } from "react";
import { Rectangle, type RectangleProps } from "../../shapes/Rectangle";
import type { ExecuteEvent } from "../../../types/EventTypes";
import { useExecutionChain } from "../../../hooks/useExecutionChain";
import { newEventId } from "../../../utils/Util";

type TextAreaProps = RectangleProps & {
	onExecute: (e: ExecuteEvent) => void;
};

const TextAreaNodeComponent: React.FC<TextAreaProps> = (props) => {
	const text = useRef<string>(props.text);

	useEffect(() => {
		if (props.text !== text.current) {
			props.onExecute({
				id: props.id,
				eventId: newEventId(),
				data: {
					text: props.text,
				},
			});
		}
		text.current = props.text;
	}, [props.text, props.onExecute, props.id]);

	useExecutionChain({
		id: props.id,
		onPropagation: (e) => {
			props.onDiagramChange?.({
				id: props.id,
				eventId: e.eventId,
				eventType: "Instant",
				changeType: "Appearance",
				startDiagram: {
					text: props.text,
				},
				endDiagram: {
					text: e.data.text,
				},
			});
		},
	});

	return <Rectangle {...props} />;
};

export const TextAreaNode = memo(TextAreaNodeComponent);
