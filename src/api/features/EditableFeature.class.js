import { Icon as olIcon } from 'ol/style'

import { extractOlFeatureGeodesicCoordinates } from '@/api/features/features.api'
import SelectableFeature from '@/api/features/SelectableFeature.class'
import { DEFAULT_ICON_URL_PARAMS } from '@/api/icon.api'
import { DEFAULT_TEXT_OFFSET } from '@/api/icon.api'
import { allStylingColors, allStylingSizes, MEDIUM, RED } from '@/utils/featureStyleUtils'

/** @enum */
export const EditableFeatureTypes = {
    MARKER: 'MARKER',
    ANNOTATION: 'ANNOTATION',
    LINEPOLYGON: 'LINEPOLYGON',
    MEASURE: 'MEASURE',
}

/** Describe a feature that can be edited by the user, such as feature from the current drawing */
export default class EditableFeature extends SelectableFeature {
    /**
     * @param {String | Number} featureData.id Unique identifier for this feature (unique in the
     *   context it comes from, not for the whole app)
     * @param {Number[][]} featureData.coordinates Coordinates [[x,y],[x2.y2],...] or [x,y] if point
     *   geometry coordinates of this feature
     * @param {Object} featureData.geometry GeoJSON representation of this feature
     * @param {String} featureData.title Title of this feature
     * @param {String} featureData.description A description of this feature, can not be HTML
     *   content (only text)
     * @param {EditableFeatureTypes} featureData.featureType Type of this editable feature
     * @param {Array} featureData.textOffset Offset for the text of this feature
     * @param {FeatureStyleColor} featureData.textColor Color for the text of this feature
     * @param {FeatureStyleSize} featureData.textSize Size of the text for this feature
     * @param {FeatureStyleColor} featureData.fillColor Color of the icon (if defined)
     * @param {DrawingIcon} featureData.icon Icon that will be covering this feature, can be null
     * @param {FeatureStyleSize} featureData.iconSize Size of the icon (if defined) that will be
     *   covering this feature
     */
    constructor(featureData) {
        const {
            id,
            coordinates,
            geometry,
            title = '',
            description = '',
            featureType,
            textOffset = DEFAULT_TEXT_OFFSET,
            textColor = RED,
            textSize = MEDIUM,
            fillColor = RED,
            icon = null,
            iconSize = MEDIUM,
        } = featureData
        super({ id, coordinates, title, description, geometry, isEditable: true })
        this._featureType = featureType
        this._textOffset = featureType === EditableFeatureTypes.MARKER ? textOffset : [0, 0]
        this._textColor = textColor
        this._textSize = textSize
        this._fillColor = fillColor
        this._icon = icon
        this._iconSize = iconSize
        this._geodesicCoordinates = null
        this._isDragged = false
    }

    /**
     * Set the coordinates from the ol Feature
     *
     * @param {ol/Feature} olFeature Ol Feature to get the coordinate from
     */
    setCoordinatesFromFeature(olFeature) {
        super.setCoordinatesFromFeature(olFeature)
        this.geodesicCoordinates = extractOlFeatureGeodesicCoordinates(olFeature)
    }

    isLineOrMeasure() {
        return (
            this.featureType === EditableFeatureTypes.MEASURE ||
            this.featureType === EditableFeatureTypes.LINEPOLYGON
        )
    }

    // getters and setters for all properties (with event emit for setters)
    get featureType() {
        return this._featureType
    }
    // no setter for featureType, immutable

    /** @returns {FeatureStyleColor} */
    get textOffset() {
        return this._textOffset
    }

    /** @param textOffset {Array} */
    set textOffset(newOffset) {
        this._textOffset = newOffset
        this.emitStylingChangeEvent('textOffset')
    }

    /** @returns {FeatureStyleColor} */
    get textColor() {
        return this._textColor
    }

    /** @param newColor {FeatureStyleColor} */
    set textColor(newColor) {
        if (newColor && allStylingColors.find((color) => color.name === newColor.name)) {
            this._textColor = newColor
            this.emitStylingChangeEvent('textColor')
        }
    }

    /** @returns {FeatureStyleSize} */
    get textSize() {
        return this._textSize
    }

    /** @returns {Number} */
    get textSizeScale() {
        return this._textSize?.textScale
    }

    /** @param newSize {FeatureStyleSize} */
    set textSize(newSize) {
        if (newSize && allStylingSizes.find((size) => size.textScale === newSize.textScale)) {
            this._textSize = newSize
            this.emitStylingChangeEvent('textSize')
        }
    }

    get font() {
        return this._textSize?.font
    }

    /** @returns {DrawingIcon | null} */
    get icon() {
        return this._icon
    }

    /** @param newIcon {DrawingIcon} */
    set icon(newIcon) {
        this._icon = newIcon
        this.emitStylingChangeEvent('icon')
    }

    /** @returns {String} */
    get iconUrl() {
        // For simplification and backward compatibility with the old viewer
        // as well as to use browser cache more efficiently we get all the
        // icons at the default scale of 1 (48x48px) and do the scaling
        // on the client
        return this._icon?.generateURL(this.fillColor, DEFAULT_ICON_URL_PARAMS.scale)
    }

    generateOpenlayersIcon() {
        return this.icon
            ? new olIcon({
                  src: this.iconUrl,
                  crossOrigin: 'Anonymous',
                  anchor: this.icon.anchor,
                  scale: this.iconSizeScale,
                  size: DEFAULT_ICON_URL_PARAMS.size,
              })
            : null
    }

    /** @returns {FeatureStyleColor} */
    get fillColor() {
        return this._fillColor
    }

    /** @param newColor {FeatureStyleColor} */
    set fillColor(newColor) {
        if (newColor && allStylingColors.find((color) => color.name === newColor.name)) {
            this._fillColor = newColor
            this.emitStylingChangeEvent('fillColor')
        }
    }

    /** @returns {FeatureStyleSize} */
    get iconSize() {
        return this._iconSize
    }

    /** @returns {Number} */
    get iconSizeScale() {
        return this._iconSize?.iconScale
    }

    /** @param newSize {FeatureStyleSize} */
    set iconSize(newSize) {
        if (newSize && allStylingSizes.find((size) => size.iconScale === newSize.iconScale)) {
            this._iconSize = newSize
            this.emitStylingChangeEvent('iconSize')
        }
    }

    /**
     * Tells if the feature is currently being dragged (and later dropped) by the user
     *
     * @returns {boolean}
     */
    get isDragged() {
        return this._isDragged
    }

    set isDragged(flag) {
        this._isDragged = flag
        this.emitChangeEvent('isDragged')
    }

    /**
     * Get/Set the Geodesic Coordinates. Those coordinates are used with a geodesic filling between
     * the coordinates. Those coordinates are used to draw the feature and for the height profile.
     */
    get geodesicCoordinates() {
        return this._geodesicCoordinates
    }

    set geodesicCoordinates(coordinates) {
        this._geodesicCoordinates = coordinates
    }
}
