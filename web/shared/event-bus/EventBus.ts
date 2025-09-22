// canvasEventBus.ts
type Listener = (event: CustomEvent) => void;

export class EventBus {
	private listeners = new Map<string, Set<Listener>>();

	addEventListener(type: string, callback: Listener) {
		if (!this.listeners.has(type)) {
			this.listeners.set(type, new Set());
		}
		this.listeners.get(type)?.add(callback);
	}

	removeEventListener(type: string, callback: Listener) {
		this.listeners.get(type)?.delete(callback);
	}

	dispatchEvent(event: CustomEvent) {
		const callbacks = this.listeners.get(event.type);
		if (callbacks) {
			for (const cb of callbacks) {
				cb(event);
			}
		}
	}
}
