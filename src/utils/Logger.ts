import setting from "../logger.json";

interface LoggerSettings {
	[key: string]: string | undefined;
}

const typedSetting: LoggerSettings = setting;

export const getLogger = (name: string) => {
	return new Logger(name);
};

export class Logger {
	name: string;

	constructor(name: string) {
		this.name = name;
	}

	debug(...data: unknown[]) {
		if (isActivated("DEBUG", this.name)) {
			console.log("[DEBUG]", this.name, ...data);
		}
	}
	info(...data: unknown[]) {
		if (isActivated("INFO", this.name)) {
			console.log("[INFO]", this.name, ...data);
		}
	}
	warn(...data: unknown[]) {
		if (isActivated("WARN", this.name)) {
			console.warn("[WARN]", this.name, ...data);
		}
	}
	error(...data: unknown[]) {
		if (isActivated("ERROR", this.name)) {
			console.error("[ERROR]", this.name, ...data);
		}
	}
}

const isUpperLevel = (level: string, target?: string) => {
	if (target) {
		const levels = ["DEBUG", "INFO", "WARN", "ERROR"];
		return levels.indexOf(level) <= levels.indexOf(target);
	}
	return false;
};

const getLogLevel = (name: string) => {
	return typedSetting[name] || typedSetting.root || "INFO";
};

const isActivated = (level: string, name: string) => {
	return isUpperLevel(getLogLevel(name), level);
};
