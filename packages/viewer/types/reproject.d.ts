declare module 'reproject' {
    import type { Geometry } from 'geojson'

    export function reproject(
        input: Geometry,
        from: string,
        to: string,
        projs?: Record<string, string>
    ): Geometry
}
