// FIXME: change cursor
// FIXME: add tooltips
// FIXME: apply new style function?
// FIXME: use feature properties for styling
// FIXME: no zoom on double click
// FIXME: right click to remove point while drawing ?

import { noModifierKeys, singleClick } from 'ol/events/condition'
import Event from 'ol/events/Event'
import DrawInteraction from 'ol/interaction/Draw'
import ModifyInteraction from 'ol/interaction/Modify'
import SelectInteraction from 'ol/interaction/Select'
import SnapInteraction from 'ol/interaction/Snap'
import VectorLayer from 'ol/layer/Vector'
import Observable from 'ol/Observable'
import VectorSource from 'ol/source/Vector'
import { getUid } from 'ol/util'
import { featureStyle } from './style'
import Overlay from 'ol/Overlay'
import i18n from '@/modules/i18n'
import { Polygon, LineString } from 'ol/geom'
import MeasureManager from '@/modules/drawing/lib/MeasureManager'
import { Circle, Icon } from 'ol/style'
import Feature from 'ol/Feature'
import Style from 'ol/style/Style'
import { GPX, KML, GeoJSON } from 'ol/format'
import { getKml } from '@/api/files.api'

const typesInTranslation = {
    MARKER: 'marker',
    TEXT: 'annotation',
    LINE: 'linepolygon',
    MEASURE: 'measure',
}

const cssPointer = 'cursor-pointer'
const cssGrab = 'cursor-grab'
const cssGrabbing = 'cursor-grabbing'

const nameInKml = 'Drawing'

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

// Manages a list of drawing interaction on an Openlayers map.
// In addition to the drawing tools, this class manages a select and snap interactions.
// When a feature is drawn or modified, a `ChangeEvent` event is dispatched.
// When a feature is selected or deselected, a `SelectEvent` event is dispatched.
export default class DrawingManager extends Observable {
    /**
     * @param {Map} map OpenLayers map instance
     * @param {Object[]} tools Tools configuration
     * @param {Object} Options
     */
    constructor(map, tools, options = {}) {
        super()

        this.map = map

        this.geojsonFormat = new GeoJSON({
            featureProjection: this.map.getView().getProjection(),
        })

        this.kmlFormat = new KML()

        this.gpxFormat = new GPX()

        this.options = options

        this.layer = new VectorLayer({
            source: new VectorSource({ useSpatialIndex: false }),
        })
        this.source = this.layer.getSource()

        this.measureManager = new MeasureManager(this.map, this.layer)

        this.tools = {}
        this.sketchPoints = 0
        for (let [type, options] of Object.entries(tools)) {
            // use the default styling if no specific draw style is set
            const drawOptions = Object.assign(
                {
                    style: (feature) => featureStyle(feature),
                },
                options.drawOptions
            )
            const tool = new DrawInteraction({
                ...drawOptions,
                source: this.source,
            })
            tool.set('type', type)
            tool.setActive(false)
            const overlaySource = tool.getOverlay().getSource()
            overlaySource.on('addfeature', (event) => this.onAddFeature_(event, options.properties))
            tool.on('change:active', (event) => this.onDrawActiveChange_(event))
            tool.on('drawstart', (event) => this.onDrawStart_(event))
            tool.on('drawend', (event) => this.onDrawEnd_(event))
            this.tools[type] = tool
        }

        this.select = new SelectInteraction({
            style: this.options.editingStyle,
            toggleCondition: () => false,
            layers: [this.layer],
        })
        const selected = this.select.getFeatures()
        selected.on('add', (event) => this.onSelectChange_(event))
        selected.on('remove', (event) => this.onSelectChange_(event))

        this.modify = new ModifyInteraction({
            features: selected,
            style: this.options.editingStyle,
            deleteCondition: (event) => noModifierKeys(event) && singleClick(event),
        })
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
        this.tooltipOverlay = new Overlay({
            element: this.options.helpPopupElement,
            offset: [15, 15],
            positioning: 'top-left',
            // so that the tooltip is not on top of the style popup (and its children popup)
            stopEvent: false,
            insertFirst: true,
        })

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
        if (!this.options.noModify) {
            this.map.addInteraction(this.select)
            this.map.addInteraction(this.modify)
        }
        this.map.addLayer(this.layer)
        this.map.addInteraction(this.snap)

        document.addEventListener('keyup', this.onKeyUpFunction_)

        this.map.addOverlay(this.tooltipOverlay)
        this.map.on('pointermove', this.onPointerMoveFunction_)
    }

    // API
    deactivate() {
        for (const id in this.tools) {
            this.map.removeInteraction(this.tools[id])
        }
        this.map.removeInteraction(this.select)
        this.map.removeInteraction(this.modify)
        this.map.removeInteraction(this.snap)
        this.map.removeLayer(this.layer)
        this.map.un('pointermove', this.onPointerMoveFunction_)
        this.map.removeOverlay(this.tooltipOverlay)

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
            this.updateHelpTooltip(tool, false)
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

    createGeoJSON() {
        // todo Do we need overlays in geoJson? it makes loop during state update
        const features = this.source.getFeatures().map((f) => {
            const feature = f.clone()
            feature.set('overlays', undefined)
            return feature
        })
        return this.geojsonFormat.writeFeaturesObject(features)
    }

    createGPX() {
        const features = this.source.getFeatures().map((feature) => {
            const clone = feature.clone()
            const geom = clone.getGeometry()
            // convert polygon to line because gpx doesn't support polygons
            if (geom instanceof Polygon) {
                const coordinates = geom.getLinearRing().getCoordinates()
                clone.setGeometry(new LineString(coordinates))
            }
            return clone
        })
        return this.gpxFormat.writeFeatures(features, {
            featureProjection: this.map.getView().getProjection(),
        })
    }

    createKML() {
        let kmlString = '<kml></kml>'
        let exportFeatures = []
        this.source.forEachFeature(function (f) {
            const clone = f.clone()
            clone.set('type', clone.get('type').toLowerCase())
            clone.setId(f.getId())
            clone.getGeometry().setProperties(f.getGeometry().getProperties())
            clone.getGeometry().transform('EPSG:3857', 'EPSG:4326')
            let styles = clone.getStyleFunction() || this.layer.getStyleFunction()
            styles = styles(clone)
            const newStyle = {
                fill: styles[0].getFill(),
                stroke: styles[0].getStroke(),
                text: styles[0].getText(),
                image: styles[0].getImage(),
                zIndex: styles[0].getZIndex(),
            }
            if (newStyle.image instanceof Circle) {
                newStyle.image = null
            }

            // If only text is displayed we must specify an image style with scale=0
            if (newStyle.text && !newStyle.image) {
                newStyle.image = new Icon({
                    src: 'noimage',
                    scale: 0,
                })
            }

            const myStyle = new Style(newStyle)
            clone.setStyle(myStyle)
            exportFeatures.push(clone)
        })

        if (exportFeatures.length > 0) {
            if (exportFeatures.length === 1) {
                // force the add of a <Document> node
                exportFeatures.push(new Feature())
            }
            kmlString = this.kmlFormat.writeFeatures(exportFeatures)
            // Remove no image hack
            kmlString = kmlString.replace(/<Icon>\s*<href>noimage<\/href>\s*<\/Icon>/g, '')

            // Remove empty placemark added to have <Document> tag
            kmlString = kmlString.replace(/<Placemark\/>/g, '')

            kmlString = kmlString.replace(/<Document>/, `<Document><name>${nameInKml}</name>`)
        }
        return kmlString
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

        feature.setId(getUid(feature))
        feature.setProperties(
            Object.assign({ type: this.activeInteraction.get('type') }, properties)
        )

        this.updateDrawHelpTooltip(feature)
    }

    onDrawActiveChange_(event) {
        this.select.setActive(!event.target.getActive())
    }

    onDrawStart_(event) {
        event.feature.set('isDrawing', true)
        if (event.target.get('type') === 'MEASURE') {
            this.measureManager.addOverlays(event.feature)
        }
    }

    onDrawEnd_(event) {
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
        const features = event.features.getArray()
        if (features.length) {
            console.assert(features.length == 1)
            const feature = features[0]
            this.dispatchSelectEvent_(feature, true)
            this.map.getTarget().classList.add('cursor-grabbing')
        }
    }

    onModifyEnd_(event) {
        if (event && event.features && event.features.getArray().length) {
            const features = event.features.getArray()
            console.assert(features.length == 1)
            const feature = features[0]
            this.dispatchSelectEvent_(feature, false)
            this.dispatchChangeEvent_(feature)
            this.map.getTarget().classList.remove('cursor-grabbing')
        }
    }

    onSelectChange_(event) {
        if (event.type === 'add') {
            this.dispatchSelectEvent_(event.element, false)
        } else if (event.type === 'remove') {
            this.dispatchSelectEvent_(null, false)
        }
    }

    onPointerMove_(event) {
        this.tooltipOverlay.setPosition(event.coordinate)
        if (this.select.get('active')) {
            this.updateCursorAndTooltips(event)
        }
    }

    // transform a Polygon to a LineString if the geometry was not closed by a click on the first point
    polygonToLineString(feature) {
        const geometry = feature.getGeometry()
        if (geometry.getType() == 'Polygon' && !this.isFinishOnFirstPoint_) {
            const coordinates = geometry.getLinearRing().getCoordinates()
            coordinates.pop()
            feature.setGeometry(new LineString(coordinates))
        }
    }

    // Display an help tooltip when drawing
    updateHelpTooltip(type, drawStarted, hasMinNbPoints, onFirstPoint, onLastPoint) {
        if (!this.tooltipOverlay) {
            return
        }
        type = typesInTranslation[type]
        let helpMsgId = 'draw_start_'
        if (drawStarted) {
            if (type !== 'marker' && type !== 'annotation') {
                helpMsgId = 'draw_next_'
            }
            if (onLastPoint) {
                helpMsgId = 'draw_snap_last_point_'
            }
            if (onFirstPoint) {
                helpMsgId = 'draw_snap_first_point_'
            }
        }
        let msg = i18n.global.t(helpMsgId + type)

        if (drawStarted && hasMinNbPoints) {
            msg += '<br/>' + i18n.global.t('draw_delete_last_point')
        }
        this.tooltipOverlay.getElement().innerHTML = msg
    }

    // Display an help tooltip when drawing
    updateDrawHelpTooltip(feature) {
        const type = this.activeInteraction.get('type')
        const geom = feature.getGeometry()
        if (geom instanceof Polygon) {
            // The sketched polygon is always closed, so we remove the last coordinate.
            const lineCoords = geom.getCoordinates()[0].slice(0, -1)
            if (this.sketchPoints !== lineCoords.length) {
                // A point is added or removed
                this.sketchPoints = lineCoords.length
            } else if (lineCoords.length > 1) {
                const firstPoint = lineCoords[0]
                const lastPoint = lineCoords[lineCoords.length - 1]
                const sketchPoint = lineCoords[lineCoords.length - 2]

                // Checks is snapped to first point of geom
                const isSnapOnFirstPoint =
                    lastPoint[0] === firstPoint[0] && lastPoint[1] === firstPoint[1]

                // Checks is snapped to last point of geom
                const isSnapOnLastPoint =
                    lastPoint[0] === sketchPoint[0] && lastPoint[1] === sketchPoint[1]

                this.isFinishOnFirstPoint_ = !isSnapOnLastPoint && isSnapOnFirstPoint

                this.updateHelpTooltip(
                    type,
                    true,
                    this.tools[type].minPoints_ < lineCoords.length,
                    this.isFinishOnFirstPoint_,
                    isSnapOnLastPoint
                )
            }
        }
    }

    // Display an help tooltip when modifying
    updateModifyHelpTooltip(type, onExistingVertex) {
        if (!this.tooltipOverlay) {
            return
        }
        type = typesInTranslation[type]
        let helpMsgId = 'modify_new_vertex_'
        if (onExistingVertex) {
            helpMsgId = 'modify_existing_vertex_'
        }
        this.tooltipOverlay.getElement().innerHTML = i18n.global.t(helpMsgId + type)
    }

    // Display an help tooltip when selecting
    updateSelectHelpTooltip(type) {
        if (!this.tooltipOverlay) {
            return
        }

        type = typesInTranslation[type]
        let helpMsgId = 'select_no_feature'
        if (type) {
            helpMsgId = 'select_feature_' + type
        }
        this.tooltipOverlay.getElement().innerHTML = i18n.global.t(helpMsgId)
    }

    updateCursorAndTooltips(evt) {
        const mapDiv = this.map.getTarget()

        if (mapDiv.classList.contains(cssGrabbing)) {
            mapDiv.classList.remove(cssGrab)
            return
        }
        let hoverSelectableFeature = false
        // todo find way to not use private
        let hoverVertex = this.modify.snappedToVertex_
        const hoverNewVertex = this.select.getFeatures().getLength() > 0
        let selectableFeature
        const selectFeatures = this.select.getFeatures()

        this.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
            if (layer && !selectableFeature) {
                selectableFeature = feature
                hoverSelectableFeature = true
            } else if (
                selectFeatures.getLength() > 0 &&
                selectFeatures.item(0).getId() === feature.getId() &&
                selectableFeature
            ) {
                selectableFeature = feature
            }
        })

        if (!hoverSelectableFeature) {
            // If the cursor is not hover a selectable feature.
            mapDiv.classList.remove(cssPointer)
            mapDiv.classList.remove(cssGrab)
            this.updateSelectHelpTooltip()
        } else if (hoverSelectableFeature && !hoverNewVertex && !hoverVertex) {
            // If the cursor is hover a selectable feature.
            mapDiv.classList.add(cssPointer)
            mapDiv.classList.remove(cssGrab)
            this.updateSelectHelpTooltip(selectableFeature.get('type'))
        } else if (hoverNewVertex || hoverVertex) {
            // If a feature is selected and if the cursor is hover a draggable
            // vertex.
            mapDiv.classList.remove(cssPointer)
            mapDiv.classList.add(cssGrab)
            this.updateModifyHelpTooltip(selectableFeature.get('type'), hoverVertex)
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
            f.set('type', f.get('type').toUpperCase())
            f.setStyle((feature) => featureStyle(feature))
            if (f.get('type') === 'MEASURE') {
                this.measureManager.addOverlays(f)
            }
        })
        this.source.addFeatures(features)
    }
}
