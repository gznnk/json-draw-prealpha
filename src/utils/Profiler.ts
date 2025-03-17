export class Profiler {
	metrix: {
		[label: string]: {
			[key: string]: {
				calls: number;
				start: number;
				end: number;
				time: number;
				timeTotal: number;
			};
		};
	} = {};

	calls: {
		[label: string]: number;
	} = {};

	start(label: string) {
		const key = Date.now().toString();
		const m = this.metrix[label];
		if (!m) {
			this.metrix[label] = {
				[key]: {
					calls: 0,
					start: Date.now(),
					end: 0,
					time: 0,
					timeTotal: 0,
				},
			};
		} else {
			m[key] = {
				calls: 0,
				start: Date.now(),
				end: 0,
				time: 0,
				timeTotal: 0,
			};
		}
		return key;
	}

	end(label: string, key: string) {
		const m = this.metrix[label];
		if (m) {
			const item = m[key];
			if (item) {
				item.end = Date.now();
				item.calls++;
				item.time = item.end - item.start;
			}
		}
	}

	summary() {
		for (const [label, keys] of Object.entries(this.metrix)) {
			let summary = this.metrix[label].summary;
			if (!summary) {
				this.metrix[label].summary = {
					calls: 0,
					start: 0,
					end: 0,
					time: 0,
					timeTotal: 0,
				};
				summary = this.metrix[label].summary;
			}
			let labelCalls = summary.calls;
			let labelTotal = summary.timeTotal;
			for (const [key, item] of Object.entries(keys)) {
				if (key === "summary") {
					continue;
				}
				labelCalls += item.calls;
				labelTotal += item.time;
				delete this.metrix[label][key];
			}
			const avarage = labelTotal / labelCalls;
			console.log(
				`Label: ${label}, Average: ${(avarage).toFixed(4)} ms, Calls: ${labelCalls}`,
			);
			summary.calls = labelCalls;
			summary.time = avarage;
			summary.timeTotal = labelTotal;
		}

		for (const [label, calls] of Object.entries(this.calls)) {
			console.log(`Label: ${label}, Calls: ${calls}`);
		}
	}

	call(label: string) {
		const calls = this.calls[label];
		if (!calls) {
			this.calls[label] = 1;
		} else {
			this.calls[label]++;
		}
	}
}
