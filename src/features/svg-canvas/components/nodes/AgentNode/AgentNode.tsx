// Import React.

import type React from "react";
import { memo, useState } from "react";
import { IconContainer } from "../../core/IconContainer";
import { Agent } from "../../icons/Agent";
import { Rectangle } from "../../shapes/Rectangle";
import { DefaultRectangleState } from "../../../constants/state/shapes/DefaultRectangleState";
import { useExecutionChain } from "../../../hooks/useExecutionChain";
import type { AgentNodeProps } from "../../../types/props/nodes/AgentNodeProps";
import { useEventBus } from "../../../context/EventBusContext";
import { useWorkflowAgentHandler } from "../../../tools/workflow_agent/hook";

/**
 * AgentNode component.
 */

const AgentNodeComponent: React.FC<AgentNodeProps> = (props) => {
	const [isProcessing, setIsProcessing] = useState(false);
	// eventBusはuseEventBusフックで取得
	const eventBus = useEventBus();
	const workflowAgentHandler = useWorkflowAgentHandler(eventBus);

	useExecutionChain({
		id: props.id,
		onPropagation: async (e) => {
			if (e.data.text === "") return;
			if (e.eventPhase !== "Instant" && e.eventPhase !== "Ended") return;

			setIsProcessing(true);
			props.onExecute?.({
				id: props.id,
				eventId: e.eventId,
				eventPhase: "Started",
				data: { text: "" },
			});

			try {
				// FunctionCallInfo型のcallIdは必須。ここではeventIdを流用。
				const result = await workflowAgentHandler({
					name: "workflow_agent",
					arguments: { user_goal: e.data.text },
					callId: e.eventId,
				});
				props.onExecute?.({
					id: props.id,
					eventId: e.eventId,
					eventPhase: "Ended",
					data: {
						text: typeof result?.content === "string" ? result.content : "",
					},
				});
			} catch (error) {
				// eslint-disable-next-line no-console
				console.error("Error in AgentNode workflow agent:", error);
				props.onExecute?.({
					id: props.id,
					eventId: e.eventId,
					eventPhase: "Ended",
					data: { text: "Error generating workflow." },
				});
			} finally {
				setIsProcessing(false);
			}
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
			>
				<Agent
					width={props.width}
					height={props.height}
					animation={isProcessing}
				/>
			</IconContainer>
			<Rectangle
				{...DefaultRectangleState}
				{...props}
				isTransparent
				isTextEditing={false}
				isTextEditEnabled={false}
			/>
		</>
	);
};

export const AgentNode = memo(AgentNodeComponent);
