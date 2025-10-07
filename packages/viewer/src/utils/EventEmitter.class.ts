// from https://gist.github.com/mudge/5830382#gistcomment-2691957

type EventHandler = (...args: any[]) => void

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
        const onceFn = (...args: any[]) => {
            this.removeListener(eventName, onceFn)
            fn?.apply(this, args)
        }
        this.on(eventName, onceFn)
    }

    emit(eventName: string, ...args: any[]): void {
        this._getEventListByName(eventName).forEach(
            function (fn) {
                fn?.apply(this, args)
            }.bind(this)
        )
    }

    removeListener(eventName: string, fn: EventHandler): void {
        this._getEventListByName(eventName).delete(fn)
    }
}
