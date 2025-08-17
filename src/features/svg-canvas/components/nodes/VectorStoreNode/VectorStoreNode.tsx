// Import React.
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// Import other libraries.
import { OpenAI, toFile } from "openai";

// Import components related to SvgCanvas.
import { IconContainer } from "../../core/IconContainer";
import { VectorStore } from "../../icons/VectorStore";
import { Rectangle } from "../../shapes/Rectangle";

// Import constants.
import { RectangleDefaultState } from "../../../constants/state/shapes/RectangleDefaultState";

// Import hooks related to SvgCanvas.
import { useExecutionChain } from "../../../hooks/useExecutionChain";

// Import types related to SvgCanvas.
import type { FileDropEvent } from "../../../types/events/FileDropEvent";

// Import functions related to SvgCanvas.
import { newEventId } from "../../../utils/core/newEventId";

// Import utilities.
import { OpenAiKeyManager } from "../../../../../utils/KeyManager";

// Import related to this component.
import type { VectorStoreNodeProps } from "../../../types/props/nodes/VectorStoreNodeProps";

/**
 * VectorStoreNode component.
 */
const VectorStoreNodeComponent: React.FC<VectorStoreNodeProps> = (props) => {
	const [apiKey, setApiKey] = useState<string>("");
	const [processIdList, setProcessIdList] = useState<string[]>([]);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		apiKey,
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
	/**
	 * Process to upload file to vector store
	 */
	const uploadFileToVectorStore = useCallback(async (file: File) => {
		const processId = newEventId();
		setProcessIdList((prev) => [...prev, processId]);

		try {
			const openai = new OpenAI({
				apiKey: refBus.current.apiKey,
				dangerouslyAllowBrowser: true,
			});

			const result = await openai.vectorStores.files.uploadAndPoll(
				"vs_6813749d20a88191805111391c452b34",
				file,
			);

			console.log("File uploaded to vector store:", result);
		} catch (error) {
			console.error("Error uploading file to vector store:", error);
		} finally {
			setProcessIdList((prev) => prev.filter((id) => id !== processId));
		}
	}, []);
	/**
	 * File drop handler
	 */
	const handleFileDrop = useCallback(
		(e: FileDropEvent) => {
			if (!refBus.current.apiKey) {
				console.error("No API key available");
				return;
			}

			const { files } = e;

			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				// Process only .txt or .md files
				const extension = file.name.split(".").pop()?.toLowerCase();
				if (extension === "txt" || extension === "md") {
					uploadFileToVectorStore(file);
				}
			}
		},
		[uploadFileToVectorStore],
	);

	// Handle execution events for the VectorStore node.
	useExecutionChain({
		id: props.id,
		onPropagation: async (e) => {
			if (e.data.text === "") return;
			if (e.eventPhase !== "Instant" && e.eventPhase !== "Ended") return;

			const processId = newEventId();
			setProcessIdList((prev) => [...prev, processId]);

			const openai = new OpenAI({
				apiKey: apiKey,
				dangerouslyAllowBrowser: true, // Required for direct browser usage
			});

			const fileContent = new Blob([e.data.text], { type: "text/plain" });
			const file = await toFile(fileContent, `${new Date().getTime()}.txt`);

			const result = openai.vectorStores.files.uploadAndPoll(
				"vs_6813749d20a88191805111391c452b34",
				file,
			);

			console.log(await result);

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
				<VectorStore
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
				onFileDrop={handleFileDrop}
			/>
		</>
	);
};

export const VectorStoreNode = memo(VectorStoreNodeComponent);
