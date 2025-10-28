import type React from "react";
import { memo } from "react";

import { MULTI_SELECT_GROUP } from "../../../../canvas/SvgCanvasConstants";
import { useKeepProportionChange } from "../../../../hooks/useKeepProportionChange";
import type { Diagram } from "../../../../types/state/core/Diagram";
import { newEventId } from "../../../../utils/core/newEventId";
import { AspectRatio } from "../../../icons/AspectRatio";
import { DiagramMenuItemNew } from "../DiagramMenuItem/DiagramMenuItemNew";

type KeepAspectRatioMenuProps = {
	isActive: boolean;
	selectedItems: Diagram[];
	isHidden?: boolean;
};

const KeepAspectRatioMenuComponent: React.FC<KeepAspectRatioMenuProps> = ({
	isActive,
	selectedItems,
	isHidden = false,
}) => {
	const onKeepProportionChange = useKeepProportionChange();

	const handleClick = () => {
		const eventId = newEventId();
		if (1 < selectedItems.length) {
			onKeepProportionChange({
				eventId,
				id: MULTI_SELECT_GROUP,
				keepProportion: !isActive,
			});
		} else {
			for (const item of selectedItems) {
				onKeepProportionChange({
					eventId,
					id: item.id,
					keepProportion: !isActive,
				});
			}
		}
	};

	return (
		<DiagramMenuItemNew
			isActive={isActive}
			onClick={handleClick}
			isHidden={isHidden}
		>
			<AspectRatio width={22} height={22} title="Keep Aspect Ratio" />
		</DiagramMenuItemNew>
	);
};

export const KeepAspectRatioMenu = memo(KeepAspectRatioMenuComponent);
