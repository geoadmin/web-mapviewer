// copied and adapted from https://github.com/geoadmin/mf-geoadmin3/blob/master/src/components/StylesFromLiteralsService.js
import { LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon } from 'ol/geom'
import { Circle, Fill, Icon, RegularShape, Stroke, Style, Text } from 'ol/style'

import log from '@/utils/logging'
import { isNumber } from '@/utils/numberUtils'

/**
 * @param {Object} vectorOptions
 * @returns {Circle | Icon | RegularShape}
 */
export function getOlImageStyleForShape(vectorOptions) {
    const style = {
        ...vectorOptions,
        ...getOlBasicStyles(vectorOptions),
        // Necessary for Cesium
        crossOrigin: 'anonymous',
    }
    if (vectorOptions.type === 'circle') {
        return new Circle(style)
    } else if (vectorOptions.type === 'icon') {
        return new Icon(style)
    } else {
        if (vectorOptions.type === 'square') {
            style.points = 4
            style.angle = Math.PI / 4
        } else if (vectorOptions.type === 'triangle') {
            style.points = 3
            style.angle = 0
        } else if (vectorOptions.type === 'pentagon') {
            style.points = 5
            style.angle = 0
        } else if (vectorOptions.type === 'star') {
            style.points = 5
            style.angle = 0
            style.radius2 = style.radius ? style.radius / 2 : undefined
        } else if (vectorOptions.type === 'cross') {
            style.points = 4
            style.angle = 0
            style.radius2 = 0
        } else if (vectorOptions.type === 'hexagon') {
            style.points = 6
            style.angle = 0
        }
        return new RegularShape(style)
    }
}

function getOlBasicStyles(vectorOptions) {
    const olStyles = {}
    Object.keys(vectorOptions).forEach((type) => {
        const style = vectorOptions[type]
        if (type === 'stroke') {
            olStyles[type] = new Stroke(style)
        } else if (type === 'fill') {
            olStyles[type] = new Fill(style)
        } else if (type === 'text') {
            let backgroundFill
            if (style.backgroundFill) {
                backgroundFill = new Fill(style.backgroundFill)
            }
            let backgroundStroke
            if (style.backgroundStroke) {
                backgroundStroke = new Stroke(style.backgroundStroke)
            }
            olStyles[type] = new Text({
                ...style,
                // replacing/overwriting literals (strings) that must be converted to objects
                stroke: new Stroke(style.stroke),
                fill: new Fill(style.fill),
                backgroundFill,
                backgroundStroke,
            })
        }
    })
    return olStyles
}

/**
 * Transforms our JSON style description into OpenLayers elements.
 *
 * Example of our JSON can be accessed here
 * https://sys-api3.dev.bgdi.ch/static/vectorStyles/ch.bafu.hydroweb-messstationen_grundwasser.json
 *
 * There isn't (at least to my knowledge) a clear definition of what we provide in this style JSON.
 * From my retro-engineering, I can say it is a way to describe style in a data-driven way. There's
 * a "key" selector at the beginning of the style, and then an entry per "value" or range of
 * values.
 *
 * The challenge is that there is a lot of things that are assumed while using it, like the fact
 * that we will be using OpenLayers, and that there are part of the style that is already set by
 * default in the code (see getOlBasicStyles function)
 *
 * @param geoadminStyleJson
 * @returns {Style}
 */
function getOlStyleFromLiterals(geoadminStyleJson) {
    const olStyles = {}
    const { vectorOptions, geomType } = geoadminStyleJson

    if (geomType === 'point') {
        olStyles.image = getOlImageStyleForShape(vectorOptions)
        if (vectorOptions.label) {
            olStyles.text = getOlBasicStyles(vectorOptions.label).text
        }
    } else {
        Object.keys(vectorOptions).forEach((key) => {
            if (key === 'label') {
                olStyles.text = getOlBasicStyles(vectorOptions.label).text
            } else if (['stroke', 'fill', 'image'].indexOf(key) !== -1) {
                olStyles[key] = getOlBasicStyles(vectorOptions)[key]
            }
        })
    }
    return new Style(olStyles)
}

function getGeomTypeFromGeometry(olGeometry) {
    if (olGeometry instanceof Point || olGeometry instanceof MultiPoint) {
        return 'point'
    } else if (olGeometry instanceof LineString || olGeometry instanceof MultiLineString) {
        return 'line'
    } else if (olGeometry instanceof Polygon || olGeometry instanceof MultiPolygon) {
        return 'polygon'
    }
}

function getLabelProperty(value) {
    if (value) {
        return value.property
    }
    return null
}

function getLabelTemplate(value) {
    if (value) {
        return value.template || ''
    }
    return null
}

function getStyleSpec(value) {
    return {
        olStyle: getOlStyleFromLiterals(value),
        minResolution: getMinResolution(value),
        maxResolution: getMaxResolution(value),
        labelProperty: getLabelProperty(value.vectorOptions.label),
        labelTemplate: getLabelTemplate(value.vectorOptions.label),
        imageRotationProperty: value.rotation,
    }
}

function getMinResolution(value) {
    return value.minResolution || 0
}

function getMaxResolution(value) {
    return value.maxResolution || Infinity
}

/**
 * Helper class to transform geoadmin's style description (also called literals) into a full-fledged
 * OpenLayers Style instance
 *
 * @class
 * @param geoadminStyleJson The output of geoadmin's API style endpoint as a JSON
 */
const OlStyleForPropertyValue = function (geoadminStyleJson) {
    this.singleStyle = null
    this.defaultVal = 'defaultVal'
    this.defaultStyle = new Style()
    this.styles = {
        point: {},
        line: {},
        polygon: {},
    }
    this.type = geoadminStyleJson.type

    this.initialize_(geoadminStyleJson)
}

OlStyleForPropertyValue.prototype.initialize_ = function (geoadminStyleJson) {
    if (this.type === 'unique' || this.type === 'range') {
        this.key = geoadminStyleJson.property
    }
    if (this.type === 'single') {
        this.singleStyle = {
            olStyle: getOlStyleFromLiterals(geoadminStyleJson),
            labelProperty: getLabelProperty(geoadminStyleJson.vectorOptions.label),
            labelTemplate: getLabelTemplate(geoadminStyleJson.vectorOptions.label),
            imageRotationProperty: geoadminStyleJson.rotation,
        }
    } else if (this.type === 'unique') {
        for (const value of geoadminStyleJson.values) {
            this.pushOrInitialize_(value.geomType, value.value, getStyleSpec(value))
        }
    } else if (this.type === 'range') {
        for (const range of geoadminStyleJson.ranges) {
            const key = range.range.toString()
            this.pushOrInitialize_(range.geomType, key, getStyleSpec(range))
        }
    }
}

OlStyleForPropertyValue.prototype.pushOrInitialize_ = function (geomType, key, styleSpec) {
    // Happens when styling is only resolution dependent (unique type only)
    if (key === undefined) {
        key = this.defaultVal
    }
    if (!this.styles[geomType][key]) {
        this.styles[geomType][key] = [styleSpec]
    } else {
        this.styles[geomType][key].push(styleSpec)
    }
}

OlStyleForPropertyValue.prototype.findOlStyleInRange_ = function (value, geomType) {
    let olStyle = null
    Object.keys(this.styles[geomType]).forEach((range) => {
        const limits = range.split(',')
        const min = parseFloat(limits[0].replace(/\s/g, ''))
        const max = parseFloat(limits[1].replace(/\s/g, ''))
        if (!olStyle && value >= min && value < max) {
            olStyle = this.styles[geomType][range]
        }
    })
    return olStyle
}

OlStyleForPropertyValue.prototype.getOlStyleForResolution_ = function (olStyles, resolution) {
    return olStyles.find(
        (style) => style.minResolution <= resolution && style.maxResolution > resolution
    )
}

OlStyleForPropertyValue.prototype.log_ = function (value, id) {
    const logValue = value === '' ? '<empty string>' : value
    log(
        'debug',
        `Feature ID: ${id}. No matching style found for key ${this.key} and value ${logValue}.`
    )
}

OlStyleForPropertyValue.prototype.setOlText_ = function (
    olStyle,
    labelProperty,
    labelTemplate,
    properties
) {
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

OlStyleForPropertyValue.prototype.setOlRotation_ = function (
    olStyle,
    imageRotationProperty,
    properties
) {
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

OlStyleForPropertyValue.prototype.getOlStyle_ = function (feature, resolution, properties) {
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
OlStyleForPropertyValue.prototype.getFeatureStyle = function (feature, resolution) {
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

export default OlStyleForPropertyValue
