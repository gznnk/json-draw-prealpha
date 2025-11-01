import type React from "react";
import { memo } from "react";

import { useGroup } from "../../../../hooks/useGroup";
import { useUngroup } from "../../../../hooks/useUngroup";
import type { Diagram } from "../../../../types/state/core/Diagram";
import type { GroupState } from "../../../../types/state/shapes/GroupState";
import { Group } from "../../../icons/Group";
import { DiagramMenuItemNew } from "../DiagramMenuItem/DiagramMenuItemNew";

type GroupMenuProps = {
	multiSelectGroup: GroupState | undefined;
	singleSelectedItem: Diagram | undefined;
};

const GroupMenuComponent: React.FC<GroupMenuProps> = ({
	multiSelectGroup,
	singleSelectedItem,
}) => {
	const onGroup = useGroup();
	const onUngroup = useUngroup();

	// Determine if the menu should be shown and if it's active
	const shouldShow = Boolean(
		multiSelectGroup || (singleSelectedItem && singleSelectedItem.type === "Group"),
	);
	const isActive = Boolean(
		singleSelectedItem && singleSelectedItem.type === "Group",
	);

	const handleClick = () => {
		if (isActive) {
			onUngroup();
		} else {
			onGroup();
		}
	};

	return (
		<DiagramMenuItemNew
			isActive={isActive}
			onClick={handleClick}
			isHidden={!shouldShow}
		>
			<Group width={22} height={22} title={isActive ? "Ungroup" : "Group"} />
		</DiagramMenuItemNew>
	);
};

export const GroupMenu = memo(GroupMenuComponent);
