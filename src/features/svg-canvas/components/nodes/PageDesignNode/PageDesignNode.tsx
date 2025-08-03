// Import React.
import type React from "react";
import { memo, useEffect, useRef, useState } from "react";

// Import other libraries.
import { OpenAI } from "openai";

// Import components related to SvgCanvas.
import { IconContainer } from "../../core/IconContainer";
import { PageDesign } from "../../icons/PageDesign";
import { Rectangle } from "../../shapes/Rectangle";

// Import constants.
import { DEFAULT_RECTANGLE_STATE } from "../../../constants/DefaultState";

// Import hooks related to SvgCanvas.
import { useExecutionChain } from "../../../hooks/useExecutionChain";

// Import functions related to SvgCanvas.
import { useAddDiagram } from "../../../hooks/useAddDiagram";
import { newEventId } from "../../../utils/core/newEventId";

// Import utilities.
import { OpenAiKeyManager } from "../../../../../utils/KeyManager";

// Import related to this component.
import {
	PAGE_DESIGN_AGENT_INSTRUCTIONS,
	PAGE_DESIGN_TOOLS,
} from "./PageDesignConstants";
import {
	createPageDesignRectangle,
	createPageDesignCircle,
	createPageDesignText,
} from "./PageDesignShapeUtils";
import type { PageDesignNodeProps } from "../../../types/props/nodes/PageDesignNodeProps";

/**
 * PageDesignNode component.
 */
const PageDesignNodeComponent: React.FC<PageDesignNodeProps> = (props) => {
	const addDiagram = useAddDiagram();
	const [apiKey, setApiKey] = useState<string>("");
	const [processIdList, setProcessIdList] = useState<string[]>([]);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	// Load the API key from local storage when the component mounts.
	useEffect(() => {
		const storedApiKey = OpenAiKeyManager.loadKey();
		if (storedApiKey) {
			setApiKey(storedApiKey);
		}
	}, []);

	// Handle execution events for the PageDesign node.
	useExecutionChain({
		id: props.id,
		onPropagation: async (e) => {
			if (e.data.text === "") return;
			if (e.eventType !== "Instant" && e.eventType !== "End") return;

			const processId = newEventId();
			setProcessIdList((prev) => [...prev, processId]);
			const openai = new OpenAI({
				apiKey: apiKey,
				dangerouslyAllowBrowser: true, // Required for direct browser usage
			});

			// Initialize the input for the OpenAI API.
			const input = [
				{
					role: "system",
					content: PAGE_DESIGN_AGENT_INSTRUCTIONS,
				},
			] as OpenAI.Responses.ResponseInput;

			try {
				input.push({
					role: "user",
					content: e.data.text,
				});

				let fullOutput = "";

				const eventId = newEventId();

				props.onExecute?.({
					id: props.id,
					eventId,
					eventType: "Start",
					data: {
						text: "",
					},
				});

				let count = 0;
				while (count < 10) {
					const stream = await openai.responses.create({
						model: "gpt-4o",
						input,
						stream: true, // Required!
						tools: PAGE_DESIGN_TOOLS,
					});

					let foundFunctionCall = false;

					for await (const event of stream) {
						console.log(event);

						if (event.type === "response.output_text.delta") {
							const delta = event.delta;
							fullOutput += delta;

							props.onExecute?.({
								id: props.id,
								eventId,
								eventType: "InProgress",
								data: {
									text: fullOutput,
								},
							});
						}

						if (event.type === "response.output_text.done") {
							props.onExecute?.({
								id: props.id,
								eventId,
								eventType: "End",
								data: {
									text: fullOutput,
								},
							});
						}

						if (
							event.type === "response.output_item.done" &&
							event.item?.type === "function_call"
						) {
							foundFunctionCall = true;
							const functionName = event.item.name;
							const functionCallArguments = JSON.parse(event.item.arguments);

							if (functionName === "add_rectangle_shape") {
								const rectangleShape = createPageDesignRectangle({
									x: functionCallArguments.x,
									y: functionCallArguments.y,
									width: functionCallArguments.width,
									height: functionCallArguments.height,
									fill: functionCallArguments.fill,
									stroke: functionCallArguments.stroke || "transparent",
									strokeWidth: functionCallArguments.strokeWidth || 1,
									rx: functionCallArguments.rx || 0,
								});
								addDiagram(rectangleShape);
								input.push(event.item);
								input.push({
									type: "function_call_output",
									call_id: event.item.call_id,
									output: JSON.stringify({
										id: rectangleShape.id,
										type: "Rectangle",
										width: rectangleShape.width,
										height: rectangleShape.height,
									}),
								});
							}

							if (functionName === "add_circle_shape") {
								const circleShape = createPageDesignCircle({
									cx: functionCallArguments.cx,
									cy: functionCallArguments.cy,
									r: functionCallArguments.r,
									fill: functionCallArguments.fill,
									stroke: functionCallArguments.stroke || "transparent",
									strokeWidth: functionCallArguments.strokeWidth || 1,
								});
								addDiagram(circleShape);
								input.push(event.item);
								input.push({
									type: "function_call_output",
									call_id: event.item.call_id,
									output: JSON.stringify({
										id: circleShape.id,
										type: "Ellipse",
										width: circleShape.width,
										height: circleShape.height,
									}),
								});
							}

							if (functionName === "add_text_element") {
								const textElement = createPageDesignText({
									x: functionCallArguments.x,
									y: functionCallArguments.y,
									text: functionCallArguments.text,
									fontSize: functionCallArguments.fontSize,
									fill: functionCallArguments.fill,
									fontFamily: functionCallArguments.fontFamily || "Segoe UI",
								});
								addDiagram(textElement);
								input.push(event.item);
								input.push({
									type: "function_call_output",
									call_id: event.item.call_id,
									output: JSON.stringify({
										id: textElement.id,
										type: "Svg",
										text: functionCallArguments.text,
									}),
								});
							}
						}
					}

					count++;

					if (!foundFunctionCall) {
						break;
					}

					console.log("Function call found, continuing to next iteration.");
				}
			} catch (error) {
				console.error("Error fetching data from OpenAI API:", error);
				alert("An error occurred during the API request.");
			}

			setProcessIdList((prev) => prev.filter((id) => id !== processId));
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
				<PageDesign
					width={props.width}
					height={props.height}
					animation={processIdList.length !== 0}
				/>
			</IconContainer>
			<Rectangle
				{...DEFAULT_RECTANGLE_STATE}
				{...props}
				isTransparent
				isTextEditing={false}
				isTextEditEnabled={false}
			/>
		</>
	);
};

export const PageDesignNode = memo(PageDesignNodeComponent);
