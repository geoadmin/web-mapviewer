
/**
 * Counter for getUid.
 * @type {number}
 */
let uidCounter_ = 0;

/**
 * Gets a unique ID for an object. This mutates the object so that further calls
 * with the same object as a parameter returns the same value. Unique IDs are generated
 * as a strictly increasing sequence. Adapted from goog.getUid. Similar to OL getUid.
 *
 * @param obj The object to get the unique ID for.
 * @return The unique ID for the object.
 */
export function getUid(obj: any): number {
    return obj.olcs_uid || (obj.olcs_uid = ++uidCounter_);
}

export function waitReady<Type>(object: Type): Promise<Type> {
    const o = object as any;
    const p = o.readyPromise;
    if (p) {
        return p;
    }
    if (o.ready !== undefined) {
        if (o.ready) {
            return Promise.resolve(object);
        }
        return new Promise((resolve, _) => {
            // FIXME: this is crazy
            // alternative: intercept _ready = true
            // altnerative: pass a timeout
            const stopper = setInterval(() => {
                if (o.ready) {
                    clearInterval(stopper);
                    resolve(object);
                }
            }, 20);
        });
    }
    return Promise.reject(new Error('Not a readyable object'));
}
