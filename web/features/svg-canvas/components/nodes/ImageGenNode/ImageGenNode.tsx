import { OpenAI } from "openai";
import type React from "react";
import { memo, useEffect, useRef, useState } from "react";

import { OpenAiKeyManager } from "../../../../../utils/KeyManager";
import { RectangleDefaultState } from "../../../constants/state/shapes/RectangleDefaultState";
import { useAddDiagram } from "../../../hooks/useAddDiagram";
import { useExecutionChain } from "../../../hooks/useExecutionChain";
import type { ImageGenNodeProps } from "../../../types/props/nodes/ImageGenNodeProps";
import { newEventId } from "../../../utils/core/newEventId";
import { createImageState } from "../../../utils/shapes/image/createImageState";
import { IconContainer } from "../../core/IconContainer";
import { Picture } from "../../icons/Picture";
import { Rectangle } from "../../shapes/Rectangle";

/**
 * ImageGenNode component.
 */
const ImageGenNodeComponent: React.FC<ImageGenNodeProps> = (props) => {
	const addDiagram = useAddDiagram();
	const [apiKey, setApiKey] = useState<string>("");
	const [processIdList, setProcessIdList] = useState<string[]>([]);

	const refBusVal = { props };
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	useEffect(() => {
		const storedApiKey = OpenAiKeyManager.loadKey();
		if (storedApiKey) {
			setApiKey(storedApiKey);
		}
	}, []);

	useExecutionChain({
		id: props.id,
		onPropagation: async (e) => {
			if (e.data.text === "") return;
			if (e.eventPhase !== "Ended") return;

			const processId = newEventId();
			setProcessIdList((prev) => [...prev, processId]);

			const openai = new OpenAI({
				apiKey,
				dangerouslyAllowBrowser: true,
			});

			try {
				const response = await openai.images.generate({
					model: "gpt-image-1",
					prompt: e.data.text,
					size: "1024x1024",
				});

				const base64Image = response.data[0].b64_json;
				if (base64Image) {
					const eventId = newEventId();
					props.onExecute?.({
						id: props.id,
						eventId,
						eventPhase: e.eventPhase,
						data: { text: base64Image },
					});
					addDiagram(
						createImageState({
							x: props.x,
							y: props.y,
							width: 512,
							height: 512,
							base64Data: base64Image,
						}),
					);
				} else {
					alert("API response is empty.");
				}
			} catch (error) {
				console.error("Error fetching data from OpenAI API:", error);
				alert("An error occurred during API request.");
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
				<Picture
					width={props.width}
					height={props.height}
					animation={processIdList.length !== 0}
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

export const ImageGenNode = memo(ImageGenNodeComponent);
