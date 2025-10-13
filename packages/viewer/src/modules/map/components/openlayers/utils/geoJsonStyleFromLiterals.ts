import type {
    GeoAdminGeoJSONStyleType,
    GeoAdminGeoJSONRangeDefinition,
    GeoAdminGeoJSONStyle,
    GeoAdminGeoJSONVectorOptions,
    GeoAdminGeoJSONStyleDefinition,
    GeoAdminGeoJSONStyleSingle,
} from '@swissgeo/layers'
import type { Options as RegularShapeOptions } from 'ol/style/RegularShape'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import { isNumber } from '@swissgeo/numbers'
import {
    LineString,
    MultiLineString,
    MultiPoint,
    MultiPolygon,
    Point,
    Polygon,
    type SimpleGeometry,
} from 'ol/geom'
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
                message: ['Unsupported shape type', vectorOptions],
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
        let backgroundFill: Fill | undefined = undefined
        if (vectorOptions.label.text.backgroundFill) {
            backgroundFill = new Fill(vectorOptions.label.text.backgroundFill)
        }
        let backgroundStroke: Stroke | undefined = undefined
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
function getOlStyleFromLiterals(rangeDefinition: GeoAdminGeoJSONRangeDefinition): Style {
    const olStyles: OLBasicStyles = {}

    if (!rangeDefinition.vectorOptions) {
        return new Style(olStyles)
    }

    return new Style(getOlBasicStyles(rangeDefinition.vectorOptions))
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

function getLabelProperty(value: GeoAdminGeoJSONStyle<GeoAdminGeoJSONStyleType>) {
    if (value) {
        return value.property
    }
    return null
}

function getLabelTemplate(value: GeoAdminGeoJSONStyle<GeoAdminGeoJSONStyleType>) {
    if (value) {
        return value.template || ''
    }
    return null
}

function getStyleSpec(value: GeoAdminGeoJSONRangeDefinition) {
    return {
        olStyle: getOlStyleFromLiterals(value),
        minResolution: getMinResolution(value),
        maxResolution: getMaxResolution(value),
        labelProperty: getLabelProperty(value.vectorOptions?.label),
        labelTemplate: getLabelTemplate(value.vectorOptions?.label),
        imageRotationProperty: value.rotation,
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

    singleStyle: GeoAdminGeoJSONStyle<GeoAdminGeoJSONStyleType> | null
    defaultVal: string
    defaultStyle: Style
    styles: Record<GeoAdminGeoJSONStyleType, Record<string, Style[]>>

    constructor(geoadminStyleJson: GeoAdminGeoJSONStyleDefinition) {
        this.key = geoadminStyleJson.property
        this.singleStyle = null
        this.defaultVal = 'defaultVal'
        this.defaultStyle = new Style()
        this.styles = {
            single: {},
            unique: {},
            range: {},
        }
        // this.styles: [key in Language]GeoAdminGeoJSONStyleType //{
        //     // point: {},
        //     // line: {},
        //     // polygon: {},
        // //}
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
                olStyle: getOlStyleFromLiterals(geoadminStyleJson),
                labelProperty: getLabelProperty(geoadminStyleJson.vectorOptions.label),
                labelTemplate: getLabelTemplate(geoadminStyleJson.vectorOptions.label),
                imageRotationProperty: geoadminStyleJson.rotation,
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

    pushOrInitialize_(geomType: GeoAdminGeoJSONStyleType, key: string, styleSpec) {
        // Happens when styling is only resolution dependent (unique type only)
        if (key === undefined) {
            key = this.defaultVal
        }

        if (key in this.styles[geomType]) {
            this.styles[geomType][key]?.push(styleSpec)
        } else {
            this.styles[geomType][key] = [styleSpec]
        }
    }

    findOlStyleInRange_(value: number, geomType: GeoAdminGeoJSONStyleType) {
        let olStyle: Style | null = null

        Object.keys(this.styles[geomType]).forEach((range) => {
            const limits = range.split(',')
            const min = parseFloat(limits[0].replace(/\s/g, ''))
            const max = parseFloat(limits[1].replace(/\s/g, ''))

            if (!olStyle && value >= min && value < max) {
                if (this.styles[geomType][range]) {
                    olStyle = this.styles[geomType][range] // TODO this is a list. what should go here?
                }
            }
        })
        return olStyle
    }

    getOlStyleForResolution_(olStyles: OLBasicStyles[], resolution: number) {
        return olStyles.find(
            (style) => style.minResolution <= resolution && style.maxResolution > resolution
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

    setOlText_(olStyle, labelProperty, labelTemplate, properties) {
        let text = null
        properties = properties || []
        if (labelProperty) {
            text = properties[labelProperty]
            if (text !== undefined && text !== null) {
                text = text.toString()
            }
        } else if (labelTemplate) {
            text = labelTemplate
            Object.keys(properties).forEach(
                (prop) => (text = text.replace('${' + prop + '}', properties[prop]))
            )
        }
        if (text) {
            olStyle.getText().setText(text)
        }
        return olStyle
    }

    setOlRotation_(olStyle, imageRotationProperty, properties) {
        if (imageRotationProperty) {
            const rotation = properties[imageRotationProperty]
            if (rotation && isNumber(rotation)) {
                const image = olStyle.getImage()
                if (image) {
                    image.setRotation(rotation)
                }
            }
        }
        return olStyle
    }

    getOlStyle_(feature, resolution, properties) {
        // Use default value if key is not found in properties
        const value = properties[this.key] ?? this.defaultVal
        const geomType = getGeomTypeFromGeometry(feature.getGeometry())

        let olStyles = null
        if (this.type === 'unique') {
            olStyles = this.styles[geomType][value]
        } else if (this.type === 'range') {
            olStyles = this.findOlStyleInRange_(value, geomType)
        }
        if (!olStyles) {
            this.log_(value, feature.getId())
            return this.defaultStyle
        }
        const styleSpec = this.getOlStyleForResolution_(olStyles, resolution)
        if (styleSpec) {
            const olStyle = this.setOlText_(
                styleSpec.olStyle,
                styleSpec.labelProperty,
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
    getFeatureStyle(feature, resolution) {
        let properties
        if (feature) {
            properties = feature.getProperties()
        }
        if (this.type === 'single') {
            const olStyle = this.setOlText_(
                this.singleStyle.olStyle,
                this.singleStyle.labelProperty,
                this.singleStyle.labelTemplate,
                properties
            )
            return this.setOlRotation_(olStyle, this.singleStyle.imageRotationProperty, properties)
        } else if (this.type === 'unique') {
            return this.getOlStyle_(feature, resolution, properties)
        } else if (this.type === 'range') {
            return this.getOlStyle_(feature, resolution, properties)
        }
    }
}

export default OlStyleForPropertyValue
