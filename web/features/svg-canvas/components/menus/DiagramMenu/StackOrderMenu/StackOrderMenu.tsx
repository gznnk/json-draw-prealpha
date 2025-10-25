import type React from "react";
import { memo } from "react";

import { DiagramMenuControl } from "../DiagramMenuControl";
import {
	StackOrderMenuWrapper,
	StackOrderButton,
} from "./StackOrderMenuStyled";
import type { StackOrderChangeEvent } from "../../../../types/events/StackOrderChangeEvent";
import { newEventId } from "../../../../utils/core/newEventId";
import { BringForward } from "../../../icons/BringForward";
import { BringToFront } from "../../../icons/BringToFront";
import { SendBackward } from "../../../icons/SendBackward";
import { SendToBack } from "../../../icons/SendToBack";

type StackOrderMenuProps = {
	selectedItemId: string;
	onStackOrderChange: (event: StackOrderChangeEvent) => void;
};

const StackOrderMenuComponent: React.FC<StackOrderMenuProps> = ({
	selectedItemId,
	onStackOrderChange,
}) => {
	return (
		<DiagramMenuControl>
			<StackOrderMenuWrapper>
				<StackOrderButton
					isActive={false}
					onClick={() =>
						onStackOrderChange({
							eventId: newEventId(),
							changeType: "bringToFront",
							id: selectedItemId,
						})
					}
					title="Bring to Front"
				>
					<BringToFront />
				</StackOrderButton>
				<StackOrderButton
					isActive={false}
					onClick={() =>
						onStackOrderChange({
							eventId: newEventId(),
							changeType: "bringForward",
							id: selectedItemId,
						})
					}
					title="Bring Forward"
				>
					<BringForward />
				</StackOrderButton>
				<StackOrderButton
					isActive={false}
					onClick={() =>
						onStackOrderChange({
							eventId: newEventId(),
							changeType: "sendBackward",
							id: selectedItemId,
						})
					}
					title="Send Backward"
				>
					<SendBackward />
				</StackOrderButton>
				<StackOrderButton
					isActive={false}
					onClick={() =>
						onStackOrderChange({
							eventId: newEventId(),
							changeType: "sendToBack",
							id: selectedItemId,
						})
					}
					title="Send to Back"
				>
					<SendToBack />
				</StackOrderButton>
			</StackOrderMenuWrapper>
		</DiagramMenuControl>
	);
};

export const StackOrderMenu = memo(StackOrderMenuComponent);
