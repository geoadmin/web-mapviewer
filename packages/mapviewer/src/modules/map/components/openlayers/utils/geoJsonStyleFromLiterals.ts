import type {
    GeoAdminGeoJSONStyleType,
    GeoAdminGeoJSONRangeDefinition,
    GeoAdminGeoJSONVectorOptions,
    GeoAdminGeoJSONStyleDefinition,
    GeoAdminGeoJSONStyleSingle,
} from '@swissgeo/layers'
import type { Feature } from 'ol'
import type { SimpleGeometry } from 'ol/geom'
import type { Options as RegularShapeOptions } from 'ol/style/RegularShape'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import { isNumber } from '@swissgeo/numbers'
import { LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon } from 'ol/geom'
import { Circle, Fill, Icon, RegularShape, Stroke, Style, Text } from 'ol/style'

// TODO I don't know enough about styles to do this right now...

// copied and adapted from https://github.com/geoadmin/mf-geoadmin3/blob/master/src/components/StylesFromLiteralsService.js

export function getOlImageStyleForShape(
    vectorOptions: GeoAdminGeoJSONVectorOptions
): Circle | Icon | RegularShape {
    const basicStyles: OLBasicStyles = getOlBasicStyles(vectorOptions)
    if (vectorOptions.type === 'circle') {
        return new Circle({
            ...basicStyles,
            radius: vectorOptions.radius,
        })
    } else if (vectorOptions.type === 'icon') {
        return new Icon({
            ...basicStyles,
            src: vectorOptions.src,
            scale: vectorOptions.scale,
            anchor: vectorOptions.anchor,
            // Necessary for Cesium
            crossOrigin: 'anonymous',
        })
    } else {
        const regularShapeOptions: Partial<RegularShapeOptions> = {
            ...basicStyles,
        }
        if (vectorOptions.type === 'square') {
            regularShapeOptions.points = 4
            regularShapeOptions.angle = Math.PI / 4
        } else if (vectorOptions.type === 'triangle') {
            regularShapeOptions.points = 3
            regularShapeOptions.angle = 0
        } else if (vectorOptions.type === 'pentagon') {
            regularShapeOptions.points = 5
            regularShapeOptions.angle = 0
        } else if (vectorOptions.type === 'star') {
            regularShapeOptions.points = 5
            regularShapeOptions.angle = 0
            regularShapeOptions.radius2 = regularShapeOptions.radius
                ? regularShapeOptions.radius / 2
                : undefined
        } else if (vectorOptions.type === 'cross') {
            regularShapeOptions.points = 4
            regularShapeOptions.angle = 0
            regularShapeOptions.radius2 = 0
        } else if (vectorOptions.type === 'hexagon') {
            regularShapeOptions.points = 6
            regularShapeOptions.angle = 0
        } else {
            log.error({
                title: 'getOlImageStyleForShape',
                titleColor: LogPreDefinedColor.Orange,
                messages: ['Unsupported shape type', vectorOptions],
            })
            regularShapeOptions.points = 0
            regularShapeOptions.angle = 0
            regularShapeOptions.radius = 0
        }
        return new RegularShape(regularShapeOptions as RegularShapeOptions)
    }
}

interface OLBasicStyles {
    fill?: Fill
    stroke?: Stroke
    text?: Text
    image?: Circle | Icon | RegularShape
    minResolution?: number
    maxResolution?: number
}

interface StyleSpec extends OLBasicStyles {
    olStyle?: Style
    labelProperty?: string | undefined
    labelTemplate?: string | undefined
    imageRotationProperty?: string
}

function getOlBasicStyles(vectorOptions: GeoAdminGeoJSONVectorOptions): OLBasicStyles {
    const olStyles: OLBasicStyles = {}

    if (vectorOptions.type === 'icon') {
        // nothing to do, the icon styles itself already
        return olStyles
    }

    if (vectorOptions.fill) {
        olStyles.fill = new Fill(vectorOptions.fill)
    }
    if (vectorOptions.stroke) {
        olStyles.stroke = new Stroke(vectorOptions.stroke)
    }
    if (vectorOptions.label) {
        let backgroundFill: Fill | undefined
        if (vectorOptions.label.text.backgroundFill) {
            backgroundFill = new Fill(vectorOptions.label.text.backgroundFill)
        }
        let backgroundStroke: Stroke | undefined
        if (vectorOptions.label.text.backgroundStroke) {
            backgroundStroke = new Stroke(vectorOptions.label.text.backgroundStroke)
        }
        olStyles.text = new Text({
            textAlign: vectorOptions.label.text.textAlign,
            textBaseline: vectorOptions.label.text.textBaseline,
            font: vectorOptions.label.text.font,
            scale: vectorOptions.label.text.scale,
            offsetX: vectorOptions.label.text.offsetX,
            offsetY: vectorOptions.label.text.offsetY,
            padding: vectorOptions.label.text.padding,
            // replacing/overwriting literals (strings) that must be converted to objects
            stroke: new Stroke(vectorOptions.label.text.stroke),
            fill: new Fill(vectorOptions.label.text.fill),
            backgroundFill,
            backgroundStroke,
        })
    }
    return olStyles
}

/**
 * Transforms our JSON style description into OpenLayers elements.
 *
 * Example of our JSON can be accessed here
 * https://sys-api3.dev.bgdi.ch/static/vectorStyles/ch.bafu.hydroweb-messstationen_grundwasser.json
 */
function getOlStyleFromLiterals(
    geoadminStyleJson: GeoAdminGeoJSONRangeDefinition | GeoAdminGeoJSONStyleSingle
): Style {
    const { vectorOptions, geomType } = geoadminStyleJson

    const olStyles: OLBasicStyles = vectorOptions ? getOlBasicStyles(vectorOptions) : {}

    if (vectorOptions && geomType === 'point') {
        olStyles.image = getOlImageStyleForShape(vectorOptions)
    }
    return new Style(olStyles)
}

function getGeomTypeFromGeometry(olGeometry: SimpleGeometry): string | undefined {
    if (olGeometry instanceof Point || olGeometry instanceof MultiPoint) {
        return 'point'
    } else if (olGeometry instanceof LineString || olGeometry instanceof MultiLineString) {
        return 'line'
    } else if (olGeometry instanceof Polygon || olGeometry instanceof MultiPolygon) {
        return 'polygon'
    }
}

function getLabelTemplate(value: GeoAdminGeoJSONVectorOptions['label']): string | undefined {
    if (value?.template) {
        return value.template
    }
    return undefined
}

function getStyleSpec(value: GeoAdminGeoJSONRangeDefinition): StyleSpec {
    const rotation = 'rotation' in value ? (value as { rotation: string }).rotation : undefined
    return {
        olStyle: getOlStyleFromLiterals(value),
        minResolution: getMinResolution(value),
        maxResolution: getMaxResolution(value),
        labelTemplate: getLabelTemplate(value.vectorOptions?.label),
        imageRotationProperty: rotation,
    }
}

function getMinResolution(value: GeoAdminGeoJSONRangeDefinition) {
    return value.minResolution || 0
}

function getMaxResolution(value: GeoAdminGeoJSONRangeDefinition) {
    return value.maxResolution || Infinity
}

/**
 * Helper class to transform geoadmin's style description (also called literals) into a full-fledged
 * OpenLayers Style instance
 *
 * @class
 * @param geoadminStyleJson The output of geoadmin's API style endpoint as a JSON
 */
class OlStyleForPropertyValue {
    private readonly key: string
    private readonly type: GeoAdminGeoJSONStyleType

    singleStyle:
        | {
              type: GeoAdminGeoJSONStyleType
              property: string
              olStyle?: Style
              labelProperty?: string | undefined
              labelTemplate?: string | undefined
              imageRotationProperty?: string
          }
        | undefined
    defaultVal: string
    defaultStyle: Style
    styles: Record<string, Record<string, StyleSpec[]>>

    constructor(geoadminStyleJson: GeoAdminGeoJSONStyleDefinition) {
        this.key = geoadminStyleJson.property
        this.defaultVal = 'defaultVal'
        this.defaultStyle = new Style()
        this.styles = {
            single: {},
            unique: {},
            range: {},
        }
        // this.styles: [key in Language]GeoAdminGeoJSONStyleType //{
        //  point: {},
        //  line: {},
        //  polygon: {},
        //
        // }
        this.type = geoadminStyleJson.type

        const isStyleSingle = (
            style: GeoAdminGeoJSONStyleDefinition
        ): style is GeoAdminGeoJSONStyleSingle => {
            return style.type === 'single'
        }

        // if (geoadminStyleJson.type === 'single') {
        if (isStyleSingle(geoadminStyleJson)) {
            // TODO I don't get it. The code tests for 'single', but then getOlStyleFromLiterals
            // demands a range. Range is below though!
            this.singleStyle = {
                type: geoadminStyleJson.type,
                property: geoadminStyleJson.property,
                olStyle: getOlStyleFromLiterals(geoadminStyleJson),
                labelTemplate: getLabelTemplate(geoadminStyleJson.vectorOptions?.label),
                imageRotationProperty:
                    'rotation' in geoadminStyleJson
                        ? (geoadminStyleJson as { rotation?: string }).rotation
                        : undefined,
            }
        } else if (geoadminStyleJson.type === 'unique') {
            for (const value of geoadminStyleJson.values) {
                this.pushOrInitialize_(value.geomType, value.value, getStyleSpec(value))
            }
        } else if (geoadminStyleJson.type === 'range') {
            for (const range of geoadminStyleJson.ranges) {
                const key = range.range.toString()
                this.pushOrInitialize_(range.geomType, key, getStyleSpec(range))
            }
        }
    }

    pushOrInitialize_(geomType: string, key: string | number, styleSpec: StyleSpec): void {
        // Happens when styling is only resolution dependent (unique type only)
        const keyStr = key?.toString() ?? this.defaultVal

        if (!this.styles[geomType]) {
            this.styles[geomType] = {}
        }

        if (keyStr in this.styles[geomType]) {
            this.styles[geomType][keyStr]?.push(styleSpec)
        } else {
            this.styles[geomType][keyStr] = [styleSpec]
        }
    }

    findOlStyleInRange_(value: number, geomType: string): StyleSpec[] | undefined {
        let olStyleSpecs: StyleSpec[] | undefined

        const geomStyles = this.styles[geomType]
        if (!geomStyles) {
            return undefined
        }

        Object.keys(geomStyles).forEach((range) => {
            const limits = range.split(',')
            if (limits.length < 2) {
                return
            }

            const min = parseFloat(limits[0]?.replace(/\s/g, '') || '0')
            const max = parseFloat(limits[1]?.replace(/\s/g, '') || '0')

            if (!olStyleSpecs && value >= min && value < max) {
                olStyleSpecs = geomStyles[range]
            }
        })
        return olStyleSpecs
    }

    getOlStyleForResolution_(olStyles: StyleSpec[], resolution: number): StyleSpec | undefined {
        return olStyles.find(
            (style) =>
                (style.minResolution ?? 0) <= resolution &&
                (style.maxResolution ?? Infinity) > resolution
        )
    }

    log_(value: string, id: string) {
        const logValue = value === '' ? '<empty string>' : value
        log.debug({
            title: 'GeoJSON style from litrals',
            titleColor: LogPreDefinedColor.Orange,
            messages: [
                `Feature ID: ${id}. No matching style found for key ${this.key} and value ${logValue}.`,
            ],
        })
    }

    setOlText_(
        olStyle: Style,
        labelProperty: string | undefined,
        labelTemplate: string | undefined,
        properties: Record<string, unknown>
    ): Style {
        let text: string | undefined
        properties = properties || {}
        if (labelProperty) {
            text = properties[labelProperty] as string
            if (text !== undefined) {
                text = text.toString()
            }
        } else if (labelTemplate) {
            text = labelTemplate
            Object.keys(properties).forEach((prop) => {
                const value = properties[prop]
                let stringValue: string | undefined
                if (typeof value === 'object') {
                    stringValue = JSON.stringify(value)
                } else {
                    stringValue = String(value as string | number | boolean)
                }
                text = text.replace('${' + prop + '}', stringValue)
            })
        }
        if (text) {
            const textStyle = olStyle.getText()
            if (textStyle) {
                textStyle.setText(text)
            }
        }
        return olStyle
    }

    setOlRotation_(
        olStyle: Style,
        imageRotationProperty: string | undefined,
        properties: Record<string, unknown>
    ): Style {
        if (imageRotationProperty) {
            const rotation = properties[imageRotationProperty]
            if (rotation && isNumber(rotation)) {
                const image = olStyle.getImage()
                if (image) {
                    image.setRotation(Number(rotation))
                }
            }
        }
        return olStyle
    }

    getOlStyle_(feature: Feature, resolution: number, properties: Record<string, unknown>): Style {
        // Use default value if key is not found in properties
        const value = properties[this.key] ?? this.defaultVal
        const geomType = getGeomTypeFromGeometry(feature.getGeometry() as SimpleGeometry)

        let olStyles: StyleSpec[] | undefined
        if (this.type === 'unique' && geomType) {
            const geomStyles = this.styles[geomType]
            olStyles = geomStyles?.[value as string]
        } else if (this.type === 'range' && geomType) {
            olStyles = this.findOlStyleInRange_(value as number, geomType)
        }
        if (!olStyles) {
            let valueStr: string
            if (value === null || value === undefined) {
                valueStr = String(value as null | undefined)
            } else if (typeof value === 'object') {
                valueStr = Array.isArray(value) ? value.join(',') : JSON.stringify(value)
            } else {
                valueStr = (value as string | number | boolean).toString()
            }
            this.log_(valueStr, String(feature.getId()))
            return this.defaultStyle
        }
        const styleSpec = this.getOlStyleForResolution_(olStyles, resolution)
        if (styleSpec && styleSpec.olStyle) {
            const olStyle = this.setOlText_(
                styleSpec.olStyle,
                undefined,
                styleSpec.labelTemplate,
                properties
            )
            return this.setOlRotation_(olStyle, styleSpec.imageRotationProperty, properties)
        }
        return this.defaultStyle
    }

    /**
     * Returns an OpenLayers style for the feature and the current map resolution (as style can be
     * different depending on the zoom level --> resolution)
     *
     * @param {ol.Feature} feature
     * @param {Number} resolution
     * @returns {Style}
     */
    getFeatureStyle(feature: Feature, resolution: number): Style {
        let properties: Record<string, unknown> = {}
        if (feature) {
            properties = feature.getProperties()
        }
        if (this.type === 'single' && this.singleStyle) {
            if (!this.singleStyle.olStyle) {
                return this.defaultStyle
            }
            const olStyle = this.setOlText_(
                this.singleStyle.olStyle,
                undefined,
                this.singleStyle.labelTemplate,
                properties
            )
            return this.setOlRotation_(olStyle, this.singleStyle.imageRotationProperty, properties)
        } else if (this.type === 'unique') {
            return this.getOlStyle_(feature, resolution, properties)
        } else if (this.type === 'range') {
            return this.getOlStyle_(feature, resolution, properties)
        }
        return this.defaultStyle
    }
}

export default OlStyleForPropertyValue
