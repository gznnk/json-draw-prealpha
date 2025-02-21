import React from "react";
import { memo } from "react";
import RectangleBase from "../core/RectangleBase";
import type { Diagram } from "../../types";
import type { RectangleProps } from "./Rectangle";
import Rectangle from "./Rectangle";

import { ITEM_TYPE_COMPONENT_MAP } from "../SvgCanvas";

type GroupProps = RectangleProps & {
	items?: Diagram[];
};

const Group: React.FC<GroupProps> = memo(
	({
		id,
		point,
		width,
		height,
		keepProportion = false,
		tabIndex = 0,
		isSelected = false,
		onPointerDown,
		onChangeEnd,
		items = [],
	}) => {
		const createDiagram = (item: Diagram): React.ReactNode => {
			const itemType = ITEM_TYPE_COMPONENT_MAP[item.type];
			const props = {
				...item,
				key: item.id,
			};

			return React.createElement(itemType, props);
		};

		const children = items.map((item) => {
			return createDiagram(item);
		});

		return (
			<Rectangle
				id={id}
				point={point}
				width={width}
				height={height}
				tabIndex={tabIndex}
				strokeWidth={"0px"}
				keepProportion={keepProportion}
				isSelected={isSelected}
				onPointerDown={onPointerDown}
				onChangeEnd={onChangeEnd}
			>
				{children}
			</Rectangle>
		);
	},
);

export default Group;
