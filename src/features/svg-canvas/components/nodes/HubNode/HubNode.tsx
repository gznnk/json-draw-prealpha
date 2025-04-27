// Import React.
import type React from "react";
import { memo, useState } from "react";

// Import components related to SvgCanvas.
import { Ellipse, DEFAULT_ELLIPSE_DATA } from "../../shapes/Ellipse";
import { Hub } from "../../icons/Hub";
import { IconContainer } from "../../core/IconContainer";

// Import hooks related to SvgCanvas.
import { useExecutionChain } from "../../../hooks/useExecutionChain";

// Imports related to this component.
import type { HubNodeProps } from "./HubNodeTypes";

const HubNodeComponent: React.FC<HubNodeProps> = (props) => {
	const [isFlashing, setIsFlashing] = useState(false);

	useExecutionChain({
		id: props.id,
		onPropagation: (e) => {
			setIsFlashing(true);
			setTimeout(() => setIsFlashing(false), 500); // アニメ終了でリセット

			props.onExecute?.({
				id: props.id,
				eventId: e.eventId,
				eventType: e.eventType,
				data: {
					text: e.data.text,
				},
			});
		},
	});

	return (
		<>
			<IconContainer
				x={props.x}
				y={props.y}
				width={props.width}
				height={props.height}
				rotation={props.rotation}
				scaleX={props.scaleX}
				scaleY={props.scaleY}
				iconWidth={100}
				iconHeight={100}
				pointerEvents="none"
			>
				<Hub flash={isFlashing} />
			</IconContainer>
			<Ellipse
				{...DEFAULT_ELLIPSE_DATA}
				{...props}
				isTextEditing={false}
				isTransparent
				isTextEditEnabled={false}
			/>
		</>
	);
};

export const HubNode = memo(HubNodeComponent);
