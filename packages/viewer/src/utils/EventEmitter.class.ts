// TODO(IS): this file is not used anywhere, consider removing it
// from https://gist.github.com/mudge/5830382#gistcomment-2691957

type EventHandler = (...args: unknown[]) => void

/** Enables an instance of a class to emit its own events (and be listened to) */
export default class EventEmitter {
    private events: Record<string, Set<EventHandler>>

    constructor() {
        this.events = {}
    }

    private _getEventListByName(eventName: string): Set<EventHandler> {
        if (typeof this.events[eventName] === 'undefined') {
            this.events[eventName] = new Set()
        }
        return this.events[eventName]
    }

    on(eventName: string, fn: EventHandler): void {
        this._getEventListByName(eventName).add(fn)
    }

    once(eventName: string, fn: EventHandler): void {
        const onceFn = (...args: unknown[]) => {
            this.removeListener(eventName, onceFn)
            fn?.(...args)
        }
        this.on(eventName, onceFn)
    }

    emit(eventName: string, ...args: unknown[]): void {
        this._getEventListByName(eventName).forEach((fn: EventHandler) => {
            fn?.(...args)
        })
    }

    removeListener(eventName: string, fn: EventHandler): void {
        this._getEventListByName(eventName).delete(fn)
    }
}
