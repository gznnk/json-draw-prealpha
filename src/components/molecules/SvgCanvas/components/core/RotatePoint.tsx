// Reactのインポート
import type React from "react";
import { useRef } from "react";

// SvgCanvas関連カスタムフックをインポート
import type { DragProps } from "../../hooks/dragHooks";
import { useDrag } from "../../hooks/dragHooks";

/**
 * 回転ポイントコンポーネントのPropsの型定義
 */
export type RotatePointProps = Omit<DragProps, "ref"> & {
	rotation?: number;
	color?: string;
	visible?: boolean;
	hidden?: boolean;
};

/**
 * 回転ポイントコンポーネント
 */
const RotatePoint: React.FC<RotatePointProps> = ({
	id,
	type,
	x,
	y,
	allowXDecimal = false,
	allowYDecimal = false,
	onDragStart,
	onDrag,
	onDragEnd,
	onDragOver,
	onDragLeave,
	onDrop,
	onHover,
	dragPositioningFunction,
	rotation = 0,
	color = "rgba(100, 149, 237, 0.8)",
	visible = true,
	hidden = false,
}) => {
	const svgRef = useRef<SVGCircleElement>({} as SVGCircleElement);

	const dragProps = useDrag({
		id,
		type,
		x,
		y,
		allowXDecimal,
		allowYDecimal,
		ref: svgRef,
		onDragStart,
		onDrag,
		onDragEnd,
		onDragOver,
		onDragLeave,
		onDrop,
		onHover,
		dragPositioningFunction,
	});

	if (hidden) {
		return;
	}

	return (
		<>
			<g transform={`translate(${x} ${y}) rotate(${rotation}) scale(0.02)`}>
				<g transform="translate(-440 -440)">
					<path
						fill={color}
						style={{ opacity: visible ? 1 : 0 }}
						d="M803.661,613.847c21.129-49.956,31.842-102.991,31.842-157.634c0-46.664-7.883-92.431-23.43-136.031
							c-15.025-42.134-36.846-81.294-64.859-116.393c-27.734-34.751-60.746-64.539-98.117-88.534
							c-38.072-24.445-79.621-42.192-123.492-52.748c-28.191-6.782-56.543,10.571-63.326,38.761s10.572,56.542,38.762,63.325
							c64.291,15.47,122.572,52.651,164.109,104.694c20.75,26.001,36.908,54.99,48.023,86.162c11.5,32.249,17.332,66.151,17.332,100.764
							c0,80.114-31.197,155.435-87.848,212.083c-56.65,56.649-131.971,87.848-212.084,87.848c-80.114,0-155.434-31.198-212.083-87.849
							c-56.65-56.648-87.848-131.969-87.848-212.083c0-59.197,17.208-116.435,49.763-165.521c28.053-42.3,66.007-76.562,110.547-100.007
							v58.027c0,28.995,23.505,52.5,52.5,52.5s52.5-23.505,52.5-52.5V52.5c0-28.995-23.505-52.5-52.5-52.5H144.567
							c-28.995,0-52.5,23.505-52.5,52.5c0,28.995,23.505,52.5,52.5,52.5h84.328C174.456,136.276,127.939,179.822,92.9,232.655
							c-44.001,66.346-67.259,143.65-67.259,223.557c0,54.643,10.714,107.679,31.843,157.634c20.398,48.225,49.587,91.524,86.759,128.695
							c37.171,37.171,80.471,66.361,128.696,86.759c49.956,21.13,102.991,31.844,157.634,31.844c54.644,0,107.677-10.714,157.634-31.844
							c48.225-20.397,91.523-49.587,128.695-86.759C754.073,705.371,783.262,662.071,803.661,613.847z"
					/>
				</g>
			</g>
			<circle
				id={id}
				cx={x}
				cy={y}
				r={7}
				fill="transparent"
				color="rgba(100, 149, 237, 0.8)"
				cursor={"move"}
				tabIndex={0}
				ref={svgRef}
				{...dragProps}
			/>
		</>
	);
};

export default RotatePoint;
