/**
 * Debounce function to delay execution if called repeatedly.
 *
 * @param {Function} target The actual function to execute.
 * @param {Number} delay The time to wait for another call.
 * @returns The function that can be called repeatedly.
 */

export default function debounce<T extends (...args: any[]) => any>(target: T, delay: number): (...args: any[]) => void {
    let timeout: number

    return function (this: T, ...args: any[]) {
        clearTimeout(timeout)
        timeout = window.setTimeout(() => {
            // Call the target function the way the debounced function was called.
            // Passing `this` isn't necessary with arrow-functions but it doesn't hurt.
            return target.apply(this, args)
        }, delay)
    }
}
