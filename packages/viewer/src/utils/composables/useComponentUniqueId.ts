export function useComponentUniqueId(name: string): string {
    return `${name}-${Date.now() + Math.random()}`
}
