// FIXME: change cursor
// FIXME: add tooltips
// FIXME: apply new style function?
// FIXME: use feature properties for styling
// FIXME: no zoom on double click
// FIXME: right click to remove point while drawing ?

import { getKml } from '@/api/files.api'
import MeasureManager from '@/modules/drawing/lib/MeasureManager'
import { DrawingModes } from '@/modules/store/modules/drawing.store'
import { deserializeAnchor } from '@/utils/featureAnchor'
import { MEDIUM, RED } from '@/utils/featureStyleUtils'
import Event from 'ol/events/Event'
import { LineString, Polygon } from 'ol/geom'
import GeometryType from 'ol/geom/GeometryType'
import DrawInteraction from 'ol/interaction/Draw'
import SnapInteraction from 'ol/interaction/Snap'
import Observable from 'ol/Observable'
import { getUid } from 'ol/util'
import { drawLineStyle, drawMeasureStyle, featureStyle } from './style'

const cssPointer = 'cursor-pointer'
const cssGrab = 'cursor-grab'
const cssGrabbing = 'cursor-grabbing'

export class ClearEvent extends Event {
    constructor() {
        super('clear')
    }
}

export class ChangeEvent extends Event {
    constructor() {
        super('change')
    }
}

export class SelectEvent extends Event {
    /**
     * @param {import('ol/Feature').default | null} feature Feature
     * @param {number[]} coordinates Pointer coordinates
     * @param {boolean} modifying
     */
    constructor(feature, coordinates, modifying) {
        super('select')
        this.feature = feature
        this.coordinates = coordinates
        this.modifying = modifying
    }
}

export class DrawEndEvent extends Event {
    constructor() {
        super('drawEnd')
    }
}

export const drawingConfig = [
    {
        drawingMode: DrawingModes.LINEPOLYGON,
        geomType: GeometryType.POLYGON,
        drawOptions: {
            minPoints: 2,
            style: drawLineStyle,
        },
        properties: {
            color: RED.fill,
            description: '',
        },
    },
    {
        drawingMode: DrawingModes.MARKER,
        geomType: GeometryType.POINT,
        // These properties need to be evaluated later as the
        // availableIconSets aren't ready when this component is mounted.
        properties: (availableIconSets) => {
            const defaultIconSet = availableIconSets.find((set) => set.name === 'default')
            const defaultIcon = defaultIconSet.icons[0]

            return {
                color: RED.fill,
                font: MEDIUM.font,
                icon: defaultIcon,
                iconUrl: defaultIcon.generateURL(),
                anchor: defaultIcon.anchor,
                text: '',
                description: '',
                textScale: MEDIUM.textScale,
            }
        },
    },
    {
        drawingMode: DrawingModes.MEASURE,
        geomType: GeometryType.POLYGON,
        drawOptions: {
            minPoints: 2,
            style: drawMeasureStyle,
        },
        properties: {
            color: RED.fill,
        },
    },
    {
        drawingMode: DrawingModes.ANNOTATION,
        geomType: GeometryType.POINT,
        properties: {
            color: RED.fill,
            text: 'new text',
            font: MEDIUM.font,
            textScale: MEDIUM.textScale,
        },
    },
]

// Manages a list of drawing interaction on an Openlayers map.
// In addition to the drawing tools, this class manages a select and snap interactions.
// When a feature is drawn or modified, a `ChangeEvent` event is dispatched.
// When a feature is selected or deselected, a `SelectEvent` event is dispatched.
export default class DrawingManager extends Observable {
    /**
     * @param {Map} map OpenLayers map instance
     * @param {VectorLayer} drawingLayer The layer in which drawing will occur
     * @param {SelectInteraction} selectInteraction
     * @param {ModifyInteraction} modifyInteraction
     */
    constructor(map, drawingLayer, selectInteraction, modifyInteraction) {
        super()

        this.map = map

        this.source = drawingLayer.getSource()

        this.measureManager = new MeasureManager(this.map, drawingLayer)

        this.tools = {}

        for (const config of drawingConfig) {
            const tool = new DrawInteraction({
                style: featureStyle,
                type: config.geomType,
                source: this.source,
            })
            tool.setActive(false)
            tool.getOverlay()
                .getSource()
                .on('addfeature', (event) => this.onAddFeature_(event, config.properties))
            tool.on('change:active', (event) => this.onDrawActiveChange_(event))
            tool.on('drawstart', (event) => this.onDrawStart_(event))
            tool.on('drawend', (event) => this.onDrawEnd_(event))
            this.tools[config.drawingMode] = tool
        }

        this.select = selectInteraction
        const selected = this.select.getFeatures()
        selected.on('add', (event) => this.onSelectChange_(event))
        selected.on('remove', (event) => this.onSelectChange_(event))

        this.modify = modifyInteraction
        this.modify.on('modifystart', (event) => this.onModifyStart_(event))
        this.modify.on('modifyend', (event) => this.onModifyEnd_(event))

        this.snap = new SnapInteraction({
            source: this.source,
        })

        this.pointerCoordinate = null
        this.map.on('pointerup', (event) => (this.pointerCoordinate = event.coordinate))

        this.activeInteraction = null

        this.onKeyUpFunction_ = this.onKeyUp_.bind(this)
        this.onPointerMoveFunction_ = this.onPointerMove_.bind(this)

        /**
         * Whether the polygon was finished by a click on the first point of the geometry.
         *
         * @type {boolean}
         */
        this.isFinishOnFirstPoint_ = false
    }

    // API
    activate() {
        for (const id in this.tools) {
            this.map.addInteraction(this.tools[id])
        }
        this.map.addInteraction(this.snap)

        document.addEventListener('keyup', this.onKeyUpFunction_)

        this.map.on('pointermove', this.onPointerMoveFunction_)
    }

    // API
    deactivate() {
        for (const id in this.tools) {
            this.map.removeInteraction(this.tools[id])
        }
        this.map.removeInteraction(this.snap)
        this.map.un('pointermove', this.onPointerMoveFunction_)

        document.removeEventListener('keyup', this.onKeyUpFunction_)
    }

    /**
     * Activate a specific tool. If an other tool was already active it is deactivated.
     *
     * @param {string} tool Tool name
     */
    toggleTool(tool) {
        if (this.activeInteraction) {
            this.activeInteraction.setActive(false)
        }
        if (tool) {
            this.deselect()
            this.activeInteraction = this.tools[tool]
            if (this.activeInteraction) {
                this.activeInteraction.setActive(true)
            }
        }
    }

    // API
    deselect() {
        this.select.getFeatures().clear()
    }

    deleteSelected() {
        this.select.getFeatures().forEach((f) => {
            this.source.removeFeature(f)
        })
        this.deselect()
        this.dispatchChangeEvent_()
    }

    dispatchClearEvent_() {
        this.dispatchEvent(new ClearEvent())
    }

    dispatchChangeEvent_() {
        this.dispatchEvent(new ChangeEvent())
    }

    dispatchSelectEvent_(feature, modifying) {
        this.dispatchEvent(new SelectEvent(feature, this.pointerCoordinate, modifying))
    }

    dispatchDrawEndEvent_() {
        this.dispatchEvent(new DrawEndEvent())
    }

    onKeyUp_(event) {
        if (this.activeInteraction && event.key == 'Delete') {
            this.activeInteraction.removeLastPoint()
        }
    }

    onAddFeature_(event, properties) {
        const feature = event.feature
        const props =
            typeof properties === 'function' ? properties(this.availableIconSets) : properties
        console.log('add feature', feature, props)

        feature.setId(getUid(feature))
        feature.setProperties({
            type: this.activeInteraction.get('type'),
            ...props,
        })
    }

    onDrawStart_(event) {
        console.log('draw start')
        event.feature.set('isDrawing', true)
        if (event.target.get('type') === 'MEASURE') {
            this.measureManager.addOverlays(event.feature)
        }
    }

    onDrawEnd_(event) {
        console.log('draw end')
        event.feature.unset('isDrawing')
        event.feature.setStyle((feature) => featureStyle(feature))
        this.source.once('addfeature', (event) => {
            this.polygonToLineString(event.feature)
            if (event.feature.get('type') === 'MEASURE') {
                this.measureManager.addOverlays(event.feature)
            }
            this.dispatchChangeEvent_(event.feature)
        })

        // deactivate drawing tool
        event.target.setActive(false)
        this.select.getFeatures().push(event.feature)
        this.sketchPoints = 0

        // remove the area tooltip.
        this.measureManager.removeOverlays(event.feature)

        this.dispatchDrawEndEvent_()
    }

    onModifyStart_(event) {
        console.log('modify start')
        const features = event.features.getArray()
        const [feature] = features

        if (feature && feature.length === 1) {
            this.dispatchSelectEvent_(feature, true)
            this.map.getTarget().classList.add(cssGrabbing)
        }
    }

    onModifyEnd_(event) {
        if (!event.features) {
            return
        }

        const features = event.features.getArray()
        const [feature] = features

        if (feature && features.length === 1) {
            this.dispatchSelectEvent_(feature, false)
            this.dispatchChangeEvent_(feature)
            this.map.getTarget().classList.remove(cssGrabbing)
        }
    }

    onSelectChange_(event) {
        if (event.type === 'add') {
            this.dispatchSelectEvent_(event.element, false)
        } else if (event.type === 'remove') {
            this.dispatchSelectEvent_(null, false)
            // This property is never set to false internally. This is a problem
            // with markers when we switch directly from one feature to the next.
            this.modify.snappedToVertex_ = false
        }
    }

    onPointerMove_(event) {
        if (this.select.getActive()) {
            this.updateCursorAndTooltips(event)
        }
    }

    // transform a Polygon to a LineString if the geometry was not closed by a click on the first point
    polygonToLineString(feature) {
        const geometry = feature.getGeometry()
        if (geometry.getType() === 'Polygon' && !this.isFinishOnFirstPoint_) {
            const coordinates = geometry.getLinearRing().getCoordinates()
            coordinates.pop()
            feature.setGeometry(new LineString(coordinates))
        }
    }

    updateCursorAndTooltips(event) {
        const mapDiv = this.map.getTarget()

        if (mapDiv.classList.contains(cssGrabbing)) {
            mapDiv.classList.remove(cssGrab)
            return
        }

        let hoveringSelectableFeature = false
        let hoveringSelectedFeature = false

        const hasFeatureSelected = this.select.getFeatures().getLength() > 0
        const selectedFeatureId = this.select.getFeatures().item(0)?.getId()
        let featureUnderCursor

        this.map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
            if (!layer) {
                return
            }

            const isSelectedFeature = hasFeatureSelected && selectedFeatureId === feature.getId()

            hoveringSelectableFeature = true
            hoveringSelectedFeature = hoveringSelectedFeature || isSelectedFeature

            if (!featureUnderCursor || isSelectedFeature) {
                featureUnderCursor = feature
            }
        })

        // We suppress the "selected" state for the areas of polygons
        // as there are no interactions with a polygon via its area.
        if (
            featureUnderCursor?.getGeometry() instanceof Polygon &&
            this.modify.vertexFeature_ === null
        ) {
            hoveringSelectedFeature = false
        }

        if (hoveringSelectedFeature) {
            mapDiv.classList.add(cssGrab)
            mapDiv.classList.remove(cssPointer)
        } else if (hoveringSelectableFeature) {
            mapDiv.classList.add(cssPointer)
            mapDiv.classList.remove(cssGrab)
        } else {
            mapDiv.classList.remove(cssPointer)
            mapDiv.classList.remove(cssGrab)
        }
    }

    clearDrawing() {
        this.source.clear()
        this.deselect()
        this.dispatchClearEvent_()
    }

    async addKmlLayer(layer) {
        const kml = await getKml(layer.fileId)
        const features = this.kmlFormat.readFeatures(kml, {
            featureProjection: layer.projection,
        })
        features.forEach((f) => {
            // The following deserialization is a hack. See @module comment in file.
            deserializeAnchor(f)
            f.set('type', f.get('type').toUpperCase())
            f.setStyle((feature) => featureStyle(feature))
            if (f.get('type') === 'MEASURE') {
                this.measureManager.addOverlays(f)
            }
        })
        this.source.addFeatures(features)
    }
}
