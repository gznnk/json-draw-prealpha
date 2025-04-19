// Import React.
import type React from "react";
import { memo, useEffect, useRef } from "react";
import { Rectangle, type RectangleProps } from "../../shapes/Rectangle";
import type { ExecuteEvent } from "../../../types/EventTypes";
import { usePropagation } from "../../../hooks/usePropagation";

type TextAreaProps = RectangleProps & {
	onExecute: (e: ExecuteEvent) => void;
};

const TextAreaNodeComponent: React.FC<TextAreaProps> = (props) => {
	const text = useRef<string>(props.text);

	useEffect(() => {
		if (props.text !== text.current) {
			props.onExecute({
				id: props.id,
				data: {
					text: props.text,
				},
			});
		}
		text.current = props.text;
	}, [props.text, props.onExecute, props.id]);

	usePropagation({
		id: props.id,
		onPropagation: (e) => {
			if (e.data.text && typeof e.data.text === "string") {
				props.onDiagramChange?.({
					id: props.id,
					eventId: "temp", // TOOD: ここは一時的なIDを使用しているが、後で適切なIDに変更する必要がある。
					eventType: "Instant",
					changeType: "Appearance",
					startDiagram: {
						text: props.text,
					},
					endDiagram: {
						text: e.data.text,
					},
				});
			}
		},
	});

	return <Rectangle {...props} />;
};

export const TextAreaNode = memo(TextAreaNodeComponent);
