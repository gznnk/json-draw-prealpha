import React, { memo, useState, useCallback } from "react";

import {
	PopoverContainer,
	PopoverContent,
	PopoverInput,
	PopoverTextarea,
	PopoverLabel,
	PopoverFieldContainer,
} from "./DiagramInfoPopoverStyled";
import type { DiagramInfoPopoverProps } from "./iagramInfoPopoverTypes";

const DiagramInfoPopoverComponent = ({
	display,
	diagram,
	position,
	onNameChange,
	onDescriptionChange,
}: DiagramInfoPopoverProps): React.JSX.Element => {
	const [localName, setLocalName] = useState(diagram?.name || "");
	const [localDescription, setLocalDescription] = useState(
		diagram?.description || "",
	);

	const handleNameBlur = useCallback(() => {
		if (localName !== (diagram?.name || "")) {
			onNameChange(localName);
		}
	}, [localName, diagram?.name, onNameChange]);

	const handleDescriptionBlur = useCallback(() => {
		if (localDescription !== (diagram?.description || "")) {
			onDescriptionChange(localDescription);
		}
	}, [localDescription, diagram?.description, onDescriptionChange]);

	const handleNameKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter") {
				e.currentTarget.blur();
			}
		},
		[],
	);

	if (!display || !diagram) {
		return <></>;
	}

	return (
		<PopoverContainer
			style={{
				left: position.x,
				top: position.y,
			}}
		>
			<PopoverContent>
				<PopoverFieldContainer>
					<PopoverLabel>Name</PopoverLabel>
					<PopoverInput
						value={localName}
						onChange={(e) => setLocalName(e.target.value)}
						onBlur={handleNameBlur}
						onKeyDown={handleNameKeyDown}
						placeholder="Enter diagram name..."
					/>
				</PopoverFieldContainer>

				<PopoverFieldContainer>
					<PopoverLabel>Description</PopoverLabel>
					<PopoverTextarea
						value={localDescription}
						onChange={(e) => setLocalDescription(e.target.value)}
						onBlur={handleDescriptionBlur}
						placeholder="Enter description..."
						rows={3}
					/>
				</PopoverFieldContainer>
			</PopoverContent>
		</PopoverContainer>
	);
};

export const DiagramInfoPopover = memo(DiagramInfoPopoverComponent);
