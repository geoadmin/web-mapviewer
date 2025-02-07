export function useComponentUniqueId(name) {
    return `${name}-${Date.now() + Math.random()}`
}
