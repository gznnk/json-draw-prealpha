import type React from "react";
import { memo } from "react";

import { useGroup } from "../../../../hooks/useGroup";
import { useUngroup } from "../../../../hooks/useUngroup";
import type { Diagram } from "../../../../types/state/core/Diagram";
import { Group } from "../../../icons/Group";
import { DiagramMenuItemNew } from "../DiagramMenuItem/DiagramMenuItemNew";

type GroupMenuProps = {
	isActive: boolean;
	selectedDiagrams: Diagram[];
	isHidden?: boolean;
};

const GroupMenuComponent: React.FC<GroupMenuProps> = ({
	isActive,
	selectedDiagrams,
	isHidden = false,
}) => {
	const onGroup = useGroup();
	const onUngroup = useUngroup();

	const handleClick = () => {
		if (isActive) {
			onUngroup();
		} else {
			const diagramIds = selectedDiagrams.map((d) => d.id);
			onGroup({ diagramIds });
		}
	};

	return (
		<DiagramMenuItemNew
			isActive={isActive}
			onClick={handleClick}
			isHidden={isHidden}
		>
			<Group width={22} height={22} title={isActive ? "Ungroup" : "Group"} />
		</DiagramMenuItemNew>
	);
};

export const GroupMenu = memo(GroupMenuComponent);
