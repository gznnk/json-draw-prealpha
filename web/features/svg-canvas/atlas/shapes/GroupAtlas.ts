import { Group, GroupMinimap } from "../../components/shapes/Group";
import { GroupDefaultData } from "../../constants/data/shapes/GroupDefaultData";
import { GroupDefaultState } from "../../constants/state/shapes/GroupDefaultState";
import type { GroupData } from "../../types/data/shapes/GroupData";
import { GroupFeatures } from "../../types/data/shapes/GroupData";
import type { GroupProps } from "../../types/props/shapes/GroupProps";
import type { GroupState } from "../../types/state/shapes/GroupState";
import { mapGroupDataToState } from "../../utils/shapes/group/mapGroupDataToState";
import { groupStateToData } from "../../utils/shapes/group/mapGroupStateToData";
import type {
	DiagramAtlas,
	DataToStateMapper,
	StateToDataMapper,
} from "../DiagramAtlas";

/**
 * Group Shape Atlas
 *
 * Complete index and registry for Group shape-related components.
 * This atlas provides centralized access to all Group-related types,
 * default values, components, and utility functions.
 *
 * This file serves both as a developer reference and as a programmatic
 * registry for the DiagramRegistry system.
 */

/**
 * Group Shape Atlas Type Definition
 */
type GroupAtlas = DiagramAtlas<GroupData, GroupState, GroupProps>;

/**
 * Group Shape Atlas Implementation
 */
export const GroupAtlas: GroupAtlas = {
	// ============================================================================
	// Types
	// ============================================================================

	type: "Group",
	features: GroupFeatures,

	// ============================================================================
	// Defaults
	// ============================================================================

	defaultData: GroupDefaultData,
	defaultState: GroupDefaultState,

	// ============================================================================
	// Components
	// ============================================================================

	component: Group,
	minimapComponent: GroupMinimap,

	// ============================================================================
	// Utility Functions
	// ============================================================================

	createState: (props: { x: number; y: number }) => ({
		...GroupDefaultState,
		x: props.x,
		y: props.y,
	}),
	export: undefined,
	calcConnectPointPosition: () => [],
	transformItems: undefined,
	dataToState: mapGroupDataToState as DataToStateMapper,
	stateToData: groupStateToData as StateToDataMapper,
};
