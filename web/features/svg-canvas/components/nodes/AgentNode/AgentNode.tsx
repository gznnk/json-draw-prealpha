import type React from "react";
import { memo, useState } from "react";

import { RectangleDefaultState } from "../../../constants/state/shapes/RectangleDefaultState";
import { useEventBus } from "../../../context/EventBusContext";
import { useExecutionChain } from "../../../hooks/useExecutionChain";
import { useWorkflowAgentHandler } from "../../../tools/workflow_agent/hook";
import type { AgentNodeProps } from "../../../types/props/nodes/AgentNodeProps";
import { IconContainer } from "../../core/IconContainer";
import { Agent } from "../../icons/Agent";
import { Rectangle } from "../../shapes/Rectangle";

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
			if (e.eventPhase !== "Ended") return;

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
				{...RectangleDefaultState}
				{...props}
				isTransparent
				isTextEditing={false}
				isTextEditEnabled={false}
			/>
		</>
	);
};

export const AgentNode = memo(AgentNodeComponent);
