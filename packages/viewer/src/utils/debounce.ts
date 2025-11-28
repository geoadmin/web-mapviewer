/**
 * Debounce a function to delay execution if called repeatedly.
 *
 * @param callback The actual function to execute.
 * @param delay The time to wait for another call.
 * @returns The function that can be called repeatedly.
 */
export default function debounce<T extends unknown[]>(
    callback: (...args: T) => void,
    delay: number
): (...args: T) => void {
    let timeout: ReturnType<typeof setTimeout>

    return (...args: T) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            return callback(...args)
        }, delay)
    }
}
