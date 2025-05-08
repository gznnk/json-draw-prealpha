// Import React.
import type React from "react";
import { memo, useEffect, useRef, useState } from "react";

// Import other libraries.
import { OpenAI } from "openai";

// Import components related to SvgCanvas.
import { IconContainer } from "../../core/IconContainer";
import { Picture } from "../../icons/Picture";
import { DEFAULT_RECTANGLE_DATA, Rectangle } from "../../shapes/Rectangle";

// Import hooks related to SvgCanvas.
import { useExecutionChain } from "../../../hooks/useExecutionChain";

// Import functions related to SvgCanvas.
import { dispatchNewItemEvent } from "../../../canvas/observers/addNewItem";
import { newEventId } from "../../../utils";

// Import utilities.
import { OpenAiKeyManager } from "../../../../../utils/KeyManager";

// Import related to this component.
import { createImageData } from "../../shapes/Image";
import type { ImageGenNodeProps } from "./ImageGenNodeTypes";

/**
 * ImageGenNode component.
 */
const ImageGenNodeComponent: React.FC<ImageGenNodeProps> = (props) => {
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
			if (e.eventType !== "Instant" && e.eventType !== "End") return;

			const processId = newEventId();
			setProcessIdList((prev) => [...prev, processId]);

			const openai = new OpenAI({
				apiKey: apiKey,
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
						eventType: e.eventType,
						data: { text: base64Image },
					});
					dispatchNewItemEvent({
						eventId,
						item: createImageData({
							x: props.x,
							y: props.y,
							width: 512,
							height: 512,
							base64Data: base64Image,
						}),
					});
				} else {
					alert("APIからの応答が空です。");
				}
			} catch (error) {
				console.error("Error fetching data from OpenAI API:", error);
				alert("APIリクエスト中にエラーが発生しました。");
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
				{...DEFAULT_RECTANGLE_DATA}
				{...props}
				isTransparent
				isTextEditing={false}
				isTextEditEnabled={false}
			/>
		</>
	);
};

export const ImageGenNode = memo(ImageGenNodeComponent);
