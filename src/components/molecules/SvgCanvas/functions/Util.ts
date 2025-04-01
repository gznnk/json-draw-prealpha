/**
 * イベントIDを生成する
 *
 * @returns イベントID
 */
export const newEventId = (): string => crypto.randomUUID();

/**
 * ディープコピーを作成する
 *
 * @param obj コピー元のオブジェクト
 * @returns コピーされたオブジェクト
 */
export const deepCopy = <T>(obj: T): T => {
	return JSON.parse(JSON.stringify(obj));
};
