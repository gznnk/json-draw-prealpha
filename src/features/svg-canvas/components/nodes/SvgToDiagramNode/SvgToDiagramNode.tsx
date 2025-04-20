// Import React.
import type React from "react";
import { memo } from "react";
import { Rectangle, type RectangleProps } from "../../shapes/Rectangle";
import type { ExecuteEvent, NewItemEvent } from "../../../types/EventTypes";
import { useExecutionChain } from "../../../hooks/useExecutionChain";
import { svgDataToDiagram } from "../../../utils/Diagram";

type SvgToDiagramProps = RectangleProps & {
	onExecute: (e: ExecuteEvent) => void;
	onNewItem: (e: NewItemEvent) => void;
};

const SvgToDiagramNodeComponent: React.FC<SvgToDiagramProps> = (props) => {
	useExecutionChain({
		id: props.id,
		onPropagation: (e) => {
			const data = e.data.text
				.replace("```svg", "")
				.replace("```xml", "")
				.replace("```", "");
			const item = svgDataToDiagram(data);
			if (!item) return;

			props.onNewItem({
				item,
			});
		},
	});

	return <Rectangle {...props} />;
};

export const SvgToDiagramNode = memo(SvgToDiagramNodeComponent);
