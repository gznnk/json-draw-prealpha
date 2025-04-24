// Import React.
import type React from "react";
import { memo, useEffect, useRef, useState } from "react";

// Import other libraries.
import { OpenAI } from "openai";

// Import types related to SvgCanvas.
import type { ExecuteEvent, NewItemEvent } from "../../../types/EventTypes";

// Import components related to SvgCanvas.
import { IconContainer } from "../../core/IconContainer";
import { CPU_1 } from "../../icons/CPU_1";
import { Rectangle, type RectangleProps } from "../../shapes/Rectangle";

// Import hooks related to SvgCanvas.
import { useExecutionChain } from "../../../hooks/useExecutionChain";

// Import functions related to SvgCanvas.
import { newEventId } from "../../../utils/Util";

// Import utilities.
import { OpenAiKeyManager } from "../../../../../utils/KeyManager";

// Import related to this component.
import { createImageData } from "../../shapes/Image";
import { ImageGenNodeWrapper } from "./ImageGenNodeStyled";

type ImageGenProps = RectangleProps & {
	onExecute: (e: ExecuteEvent) => void;
	onNewItem: (e: NewItemEvent) => void;
};

const ImageGenNodeComponent: React.FC<ImageGenProps> = (props) => {
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

			const processId = newEventId();
			setProcessIdList((prev) => [...prev, processId]);

			const openai = new OpenAI({
				apiKey: apiKey,
				dangerouslyAllowBrowser: true,
			});

			try {
				const response = await openai.images.generate({
					prompt: e.data.text,
					size: "512x512",
					response_format: "b64_json",
				});

				const base64Image = response.data[0].b64_json;
				if (base64Image) {
					const eventId = newEventId();
					props.onExecute({
						id: props.id,
						eventId: eventId,
						data: { text: base64Image },
					});
					props.onNewItem({
						item: createImageData({
							x: props.x,
							y: props.y,
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
			{!props.isTextEditing && (
				<IconContainer
					x={props.x}
					y={props.y}
					width={props.width}
					height={props.height}
					rotation={props.rotation}
					scaleX={props.scaleX}
					scaleY={props.scaleY}
					iconWidth={80}
					iconHeight={80}
				>
					<CPU_1 blink={processIdList.length !== 0} />
				</IconContainer>
			)}
			<ImageGenNodeWrapper visible={props.isTextEditing}>
				<Rectangle {...props} />
			</ImageGenNodeWrapper>
		</>
	);
};

export const ImageGenNode = memo(ImageGenNodeComponent);
