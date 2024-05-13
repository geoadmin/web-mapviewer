export function useComponentUniqueId(name, counter) {
    // On each component creation set the current component ID and increase the counter
    const id = `${name}-${counter}`
    counter += 1
    return id
}
