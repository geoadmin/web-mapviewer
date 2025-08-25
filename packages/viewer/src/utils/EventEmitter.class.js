// from https://gist.github.com/mudge/5830382#gistcomment-2691957
/** Enables an instance of a class to emit its own events (and be listened to) */
export default class EventEmitter {
    constructor() {
        this.events = {}
    }

    _getEventListByName(eventName) {
        if (typeof this.events[eventName] === 'undefined') {
            this.events[eventName] = new Set()
        }
        return this.events[eventName]
    }

    on(eventName, fn) {
        this._getEventListByName(eventName).add(fn)
    }

    once(eventName, fn) {
        const onceFn = (...args) => {
            this.removeListener(eventName, onceFn)
            fn?.apply(this, args)
        }
        this.on(eventName, onceFn)
    }

    emit(eventName, ...args) {
        this._getEventListByName(eventName).forEach(
            function (fn) {
                fn?.apply(this, args)
            }.bind(this)
        )
    }

    removeListener(eventName, fn) {
        this._getEventListByName(eventName).delete(fn)
    }
}
