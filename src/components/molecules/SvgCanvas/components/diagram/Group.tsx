// Reactのインポート
import React, { memo, useCallback, useRef } from "react";

// SvgCanvas関連型定義をインポート
import type { Diagram, DiagramRef } from "../../types/DiagramTypes";
import type { DiagramChangeEvent } from "../../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import type { RectangleProps } from "./Rectangle";
import Rectangle from "./Rectangle";

// TODO
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
		onDiagramChangeEnd,
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
				onDiagramChangeEnd: onDiagramChangeEnd,
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
			(e: DiagramChangeEvent) => {
				if (e.width && e.height) {
					const scaleX = e.width / width;
					const scaleY = e.height / height;
					for (const item of items) {
						itemsRef.current[item.id]?.onParentDiagramResize?.({
							scaleX,
							scaleY,
						});
					}
				}
			},
			[items, width, height],
		);

		const handleChangeEnd = useCallback(
			(e: DiagramChangeEvent) => {
				onDiagramChangeEnd?.(e);
				if (e.width && e.height) {
					const scaleX = e.width / width;
					const scaleY = e.height / height;
					for (const item of items) {
						itemsRef.current[item.id]?.onParentDiagramResizeEnd?.({
							scaleX,
							scaleY,
						});
					}
				}
			},
			[onDiagramChangeEnd, items, width, height],
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
				onDiagramChange={handleChange}
				onDiagramChangeEnd={handleChangeEnd}
			>
				{children}
			</Rectangle>
		);
	},
);

export default Group;
