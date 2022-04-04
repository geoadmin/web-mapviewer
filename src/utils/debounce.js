/**
 * Debounce function to delay execution if called repeatedly.
 *
 * @param {Function} target The actual function to execute.
 * @param {Number} delay The time to wait for another call.
 * @returns The function that can be called repeatedly.
 */
export default function debounce(target, delay) {
    let timeout
    return function () {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            // Call the target function the way the debounced function was called.
            // Passing `this` isn't necessary with arrow-functions but it doesn't hurt.
            target.apply(this, arguments)
        }, delay)
    }
}
