import React from "react";
import { useCallback, useRef, memo } from "react";
import RectangleBase from "../core/RectangleBase";
import type { ChangeEvent, Diagram, DiagramRef } from "../../types";
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
		onPointerDown, // TODO: わかりづらい
		onChangeEnd,
		items = [],
	}) => {
		const itemsRef = useRef<{
			[key: string]: DiagramRef | undefined;
		}>({});

		const createDiagram = (item: Diagram): React.ReactNode => {
			const itemType = ITEM_TYPE_COMPONENT_MAP[item.type];
			const props = {
				...item,
				key: item.id,
				onChangeEnd: onChangeEnd,
				ref: (r: DiagramRef) => {
					itemsRef.current[item.id] = r;
				},
			};

			return React.createElement(itemType, props);
		};

		const children = items.map((item) => {
			return createDiagram(item);
		});

		const handleChange = useCallback(
			(e: ChangeEvent) => {
				if (e.width && e.height) {
					const scaleX = e.width / width;
					const scaleY = e.height / height;
					for (const item of items) {
						itemsRef.current[item.id]?.onParentResize?.({
							scaleX,
							scaleY,
						});
					}
				}
			},
			[items, width, height],
		);

		const handleChangeEnd = useCallback(
			(e: ChangeEvent) => {
				onChangeEnd?.(e);
				if (e.width && e.height) {
					const scaleX = e.width / width;
					const scaleY = e.height / height;
					for (const item of items) {
						itemsRef.current[item.id]?.onParentResizeEnd?.({
							scaleX,
							scaleY,
						});
					}
				}
			},
			[onChangeEnd, items, width, height],
		);

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
				onChange={handleChange}
				onChangeEnd={handleChangeEnd}
			>
				{children}
			</Rectangle>
		);
	},
);

export default Group;
