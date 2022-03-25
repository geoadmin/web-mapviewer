export default function debounce(target, delay) {
    let timeout
    return function () {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            target.apply(this, arguments)
        }, delay)
    }
}
