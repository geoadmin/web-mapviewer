// from https://gist.github.com/mudge/5830382#gistcomment-2691957
/** Enables an instance of a class to emit its own events (and be listened to) */
export default abstract class EventEmitter {
    readonly events: { [key: string]: Set<Function> }

    protected constructor() {
        this.events = {}
    }

    _getEventListByName(eventName: string): Set<Function> {
        if (typeof this.events[eventName] === 'undefined') {
            this.events[eventName] = new Set()
        }
        return this.events[eventName]
    }

    on(eventName: string, fn: Function) {
        this._getEventListByName(eventName).add(fn)
    }

    once(eventName: string, fn: Function) {
        const onceFn = (...args: any[]) => {
            this.removeListener(eventName, onceFn)
            fn?.apply(this, args)
        }
        this.on(eventName, onceFn)
    }

    emit(eventName: string, ...args: any[]) {
        this._getEventListByName(eventName).forEach((fn: Function) => {
            fn?.apply(this, args)
        })
    }

    removeListener(eventName: string, fn: Function) {
        this._getEventListByName(eventName).delete(fn)
    }
}
