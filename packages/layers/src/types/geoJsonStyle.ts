// @microsoft/api-extractor struggles to export only types from a file, so we need to export a dummy variable to make it happy
export const _SOME_DUMMY_EXPORT: string = 'just so that it is not only type exports...'

interface GeoAdminGeoJSONLabel {
    template: string
    text: {
        textAlign: CanvasTextAlign
        textBaseline: CanvasTextBaseline
        font: string
        scale: number
        offsetX?: number
        offsetY?: number
        padding: [number, number, number, number]
        fill: {
            color: string
        }
        stroke: {
            color: string
            width: number
        }
        backgroundFill?: {
            color: string
        }
        backgroundStroke?: {
            color: string
            width: number
        }
    }
}

// Base for all vector options, only includes the optional label
interface GeoAdminGeoJSONVectorOptionsBase<
    Type extends
    | 'icon'
    | 'circle'
    | 'square'
    | 'triangle'
    | 'pentagon'
    | 'star'
    | 'cross'
    | 'hexagon',
> {
    type: Type
    label?: GeoAdminGeoJSONLabel
}

// Common paint options for non-icon shapes
interface Paint {
    fill: { color: string }
    stroke: { color: string; width: number }
}

// Icon: no fill/stroke, different props
export interface GeoAdminGeoJSONVectorOptionsIcon extends GeoAdminGeoJSONVectorOptionsBase<'icon'> {
    src: string
    scale?: number
    anchor?: [number, number]
}

// Shapes that share fill/stroke and STOP there (no radius)
export type GeoAdminGeoJSONVectorOptionsFinite =
    | (GeoAdminGeoJSONVectorOptionsBase<'square'> & Paint)
    | (GeoAdminGeoJSONVectorOptionsBase<'triangle'> & Paint)
    | (GeoAdminGeoJSONVectorOptionsBase<'pentagon'> & Paint)
    | (GeoAdminGeoJSONVectorOptionsBase<'cross'> & Paint)
    | (GeoAdminGeoJSONVectorOptionsBase<'hexagon'> & Paint)

// Shapes that “decorate” with an extra radius on top of common paint
export type GeoAdminGeoJSONVectorOptionsWithRadius =
    | (GeoAdminGeoJSONVectorOptionsBase<'circle'> & Paint & { radius: number })
    | (GeoAdminGeoJSONVectorOptionsBase<'star'> & Paint & { radius: number })

// Union of all vector options we use elsewhere
export type GeoAdminGeoJSONVectorOptions =
    | GeoAdminGeoJSONVectorOptionsIcon
    | GeoAdminGeoJSONVectorOptionsWithRadius
    | GeoAdminGeoJSONVectorOptionsFinite

export type GeoAdminGeoJSONStyleType = 'single' | 'unique' | 'range'

export type GeoAdminGeoJSONGeometryType = 'point' | 'line' | 'polygon'

export interface GeoAdminGeoJSONStyle<Type extends GeoAdminGeoJSONStyleType> {
    type: Type
    /** Key to the property from which the style is applied/determined. */
    property: string
}

interface CommonRangeDefinition {
    geomType: GeoAdminGeoJSONGeometryType
    minResolution?: number
    maxResolution?: number
    vectorOptions?: GeoAdminGeoJSONVectorOptions
}

export interface GeoAdminGeoJSONStyleRangedBaseDefinition extends CommonRangeDefinition {
    range: [number, number]
}

export interface GeoAdminGeoJSONStyleValueRangeDefinition extends CommonRangeDefinition {
    value: number | string
}

export type GeoAdminGeoJSONRangeDefinition =
    | GeoAdminGeoJSONStyleRangedBaseDefinition
    | GeoAdminGeoJSONStyleValueRangeDefinition

export type GeoAdminGeoJSONStyleSingle = GeoAdminGeoJSONStyle<'single'> & CommonRangeDefinition

export interface GeoAdminGeoJSONStyleUnique extends GeoAdminGeoJSONStyle<'unique'> {
    values: GeoAdminGeoJSONStyleValueRangeDefinition[]
}

export interface GeoAdminGeoJSONStyleRange extends GeoAdminGeoJSONStyle<'range'> {
    ranges: GeoAdminGeoJSONStyleRangedBaseDefinition[]
}

export type GeoAdminGeoJSONStyleDefinition =
    | GeoAdminGeoJSONStyleSingle
    | GeoAdminGeoJSONStyleUnique
    | GeoAdminGeoJSONStyleRange
