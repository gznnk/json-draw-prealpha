type Point = { x: number; y: number };

class Rectangle {
	private originalVertices: Point[];
	private scaleX: number;
	private scaleY: number;
	private rotation: number; // in radians
	private translation: Point;
	private cachedVertices: Point[] | null;

	constructor(
		vertices: Point[],
		scaleX = 1,
		scaleY = 1,
		rotation = 0,
		translation: Point = { x: 0, y: 0 },
	) {
		this.originalVertices = vertices;
		this.scaleX = scaleX;
		this.scaleY = scaleY;
		this.rotation = rotation;
		this.translation = translation;
		this.cachedVertices = null;
	}

	// アフィン変換を適用して現在の頂点を計算またはキャッシュから取得
	getTransformedVertices(): Point[] {
		if (this.cachedVertices) {
			return this.cachedVertices;
		}

		this.cachedVertices = this.originalVertices.map((vertex) => {
			// 拡縮を適用
			let transformedX = vertex.x * this.scaleX;
			let transformedY = vertex.y * this.scaleY;

			// 回転を適用
			const rotatedX =
				transformedX * Math.cos(this.rotation) -
				transformedY * Math.sin(this.rotation);
			const rotatedY =
				transformedX * Math.sin(this.rotation) +
				transformedY * Math.cos(this.rotation);

			// 平行移動を適用
			transformedX = rotatedX + this.translation.x;
			transformedY = rotatedY + this.translation.y;

			return { x: transformedX, y: transformedY };
		});

		return this.cachedVertices;
	}

	// 相対的な拡縮を適用
	scale(scaleX: number, scaleY: number) {
		this.scaleX *= scaleX;
		this.scaleY *= scaleY;
		this.invalidateCache();
	}

	// 絶対的な回転を設定
	setRotation(rotation: number) {
		this.rotation = rotation;
		this.invalidateCache();
	}

	// 絶対的な平行移動を設定
	setTranslation(translation: Point) {
		this.translation = translation;
		this.invalidateCache();
	}

	// キャッシュを無効にするメソッド
	private invalidateCache() {
		this.cachedVertices = null;
	}
}

/**
 * 度をラジアンに変換する関数
 * @param degrees - 度
 * @returns ラジアン
 */
const degreesToRadians = (degrees: number): number => {
	return degrees * (Math.PI / 180);
};

// 使用例
const vertices: Point[] = [
	{ x: 0, y: 0 },
	{ x: 1, y: 0 },
	{ x: 1, y: 1 },
	{ x: 0, y: 1 },
];

const rect = new Rectangle(vertices);
rect.scale(2, 2); // 相対的な拡縮
rect.setRotation(degreesToRadians(45)); // 絶対的な回転
rect.setTranslation({ x: 3, y: 4 }); // 絶対的な平行移動

console.log(rect.getTransformedVertices());
