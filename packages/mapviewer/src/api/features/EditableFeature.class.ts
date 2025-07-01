import type { Feature } from 'ol'

import { Icon as olIcon } from 'ol/style'

import SelectableFeature, {
    type SelectableFeatureData,
} from '@/api/features/SelectableFeature.class'
import { DEFAULT_ICON_URL_PARAMS, DEFAULT_TITLE_OFFSET, DrawingIcon } from '@/api/icon.api'
import {
    allStylingColors,
    allStylingSizes,
    allStylingTextPlacementsWithUnknown,
    FeatureStyleColor,
    FeatureStyleSize,
    MEDIUM,
    RED,
} from '@/utils/featureStyleUtils'

export enum EditableFeatureTypes {
    MARKER = 'MARKER',
    ANNOTATION = 'ANNOTATION',
    LINEPOLYGON = 'LINEPOLYGON',
    MEASURE = 'MEASURE',
}

export enum EditableFeatureTextPlacement {
    TOP = 'top',
    TOP_LEFT = 'top-left',
    TOP_RIGHT = 'top-right',
    BOTTOM = 'bottom',
    BOTTOM_LEFT = 'bottom-left',
    BOTTOM_RIGHT = 'bottom-right',
    CENTER = 'center',
    LEFT = 'left',
    RIGHT = 'right',
    UNKNOWN = 'unknown',
}

interface EditableFeatureData extends Omit<SelectableFeatureData, 'isEditable'> {
    featureType: EditableFeatureTypes
    textOffset: number[]
    textColor: FeatureStyleColor
    textSize: FeatureStyleSize
    fillColor: FeatureStyleColor
    icon?: DrawingIcon
    /** Size of the icon (if defined) that will be covering this feature */
    iconSize: FeatureStyleSize
    /** Anchor of the text around the feature. Only useful for markers */
    textPlacement: EditableFeatureTextPlacement
    showDescriptionOnMap: boolean
}

/** Describe a feature that can be edited by the user, such as feature from the current drawing */
export default class EditableFeature extends SelectableFeature {
    readonly _featureType: EditableFeatureTypes
    private _textOffset: number[]
    private _textColor: FeatureStyleColor
    private _textSize: FeatureStyleSize
    private _fillColor: FeatureStyleColor
    private _icon: DrawingIcon | undefined
    private _iconSize: FeatureStyleSize
    private _isDragged: boolean
    private _textPlacement: EditableFeatureTextPlacement
    private _showDescriptionOnMap: boolean

    constructor(featureData: EditableFeatureData) {
        super({ ...featureData, isEditable: true })
        const {
            featureType,
            textOffset = DEFAULT_TITLE_OFFSET,
            textColor = RED,
            textSize = MEDIUM,
            fillColor = RED,
            icon,
            iconSize = MEDIUM,
            textPlacement = EditableFeatureTextPlacement.TOP,
            showDescriptionOnMap = false,
        } = featureData
        this._featureType = featureType
        this._textOffset = textOffset
        this._textColor = textColor
        this._textSize = textSize
        this._fillColor = fillColor
        this._icon = icon
        this._iconSize = iconSize
        this._isDragged = false
        this._textPlacement = textPlacement
        this._showDescriptionOnMap = showDescriptionOnMap
    }

    /**
     * Set the coordinates from the ol Feature
     *
     * @param olFeature Ol Feature to get the coordinate from
     */
    setCoordinatesFromFeature(olFeature: Feature): void {
        super.setCoordinatesFromFeature(olFeature)
    }

    isLineOrMeasure(): boolean {
        return (
            this.featureType === EditableFeatureTypes.MEASURE ||
            this.featureType === EditableFeatureTypes.LINEPOLYGON
        )
    }

    // getters and setters for all properties (with event emit for setters)
    get featureType(): EditableFeatureTypes {
        return this._featureType
    }
    // no setter for featureType, immutable

    get textOffset(): number[] {
        return this._textOffset
    }

    set textOffset(newOffset: number[]) {
        this._textOffset = newOffset
        this.emitStylingChangeEvent('textOffset')
    }

    get textColor(): FeatureStyleColor {
        return this._textColor
    }

    set textColor(newColor: FeatureStyleColor) {
        if (newColor && allStylingColors.find((color) => color.name === newColor.name)) {
            this._textColor = newColor
            this.emitStylingChangeEvent('textColor')
        }
    }

    get textPlacement(): EditableFeatureTextPlacement {
        return this._textPlacement
    }

    set textPlacement(newPlacement: EditableFeatureTextPlacement) {
        if (
            newPlacement &&
            allStylingTextPlacementsWithUnknown.find((placement) => placement === newPlacement)
        ) {
            this._textPlacement = newPlacement
            this.emitStylingChangeEvent('textPlacement')
        }
    }

    get textSize(): FeatureStyleSize {
        return this._textSize
    }

    get textSizeScale(): number | undefined {
        return this._textSize?.textScale
    }

    set textSize(newSize: FeatureStyleSize) {
        if (newSize && allStylingSizes.find((size) => size.textScale === newSize.textScale)) {
            this._textSize = newSize
            this.emitStylingChangeEvent('textSize')
        }
    }

    get font(): string | undefined {
        return this._textSize?.font
    }

    get icon(): DrawingIcon | undefined {
        return this._icon
    }

    set icon(newIcon: DrawingIcon | undefined) {
        this._icon = newIcon
        this.emitStylingChangeEvent('icon')
    }

    get iconUrl(): string | undefined {
        // For simplification and backward compatibility with the old viewer
        // as well as to use browser cache more efficiently we get all the
        // icons at the default scale of 1 (48x48px) and do the scaling
        // on the client
        return this._icon?.generateURL(this.fillColor, DEFAULT_ICON_URL_PARAMS.scale)
    }

    generateOpenlayersIcon(): olIcon | undefined {
        return this.icon
            ? new olIcon({
                  src: this.iconUrl,
                  crossOrigin: 'Anonymous',
                  anchor: this.icon.anchor,
                  scale: this.iconSizeScale,
                  size: this.icon.size,
              })
            : undefined
    }

    get fillColor(): FeatureStyleColor {
        return this._fillColor
    }

    set fillColor(newColor: FeatureStyleColor) {
        if (newColor && allStylingColors.find((color) => color.name === newColor.name)) {
            this._fillColor = newColor
            this.emitStylingChangeEvent('fillColor')
        }
    }

    get iconSize(): FeatureStyleSize {
        return this._iconSize
    }

    get iconSizeScale(): number | undefined {
        return this._iconSize?.iconScale
    }

    set iconSize(newSize: FeatureStyleSize) {
        if (newSize && allStylingSizes.find((size) => size.iconScale === newSize.iconScale)) {
            this._iconSize = newSize
            this.emitStylingChangeEvent('iconSize')
        }
    }

    /** Tells if the feature is currently being dragged (and later dropped) by the user */
    get isDragged(): boolean {
        return this._isDragged
    }

    set isDragged(flag: boolean) {
        this._isDragged = flag
        this.emitChangeEvent('isDragged')
    }

    get showDescriptionOnMap(): boolean {
        return this._showDescriptionOnMap
    }

    set showDescriptionOnMap(newValue: boolean) {
        this._showDescriptionOnMap = newValue
        this.emitStylingChangeEvent('showDescriptionOnMap')
    }
}
