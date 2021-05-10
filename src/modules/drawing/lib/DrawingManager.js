// FIXME: change cursor
// FIXME: add tooltips
// FIXME: apply new style function?
// FIXME: linestring or polygon
// FIXME: use feature properties for styling
// FIXME: no zoom on double click
// FIXME: right click to remove point while drawing ?

import { noModifierKeys, singleClick } from 'ol/events/condition'
import Event from 'ol/events/Event'
import GeoJSON from 'ol/format/GeoJSON'
import DrawInteraction from 'ol/interaction/Draw'
import ModifyInteraction from 'ol/interaction/Modify'
import SelectInteraction from 'ol/interaction/Select'
import SnapInteraction from 'ol/interaction/Snap'
import VectorLayer from 'ol/layer/Vector'
import Observable from 'ol/Observable'
import VectorSource from 'ol/source/Vector'
import { getUid } from 'ol/util'
import { featureStyle } from './style'

class ChangeEvent extends Event {
    /**
     * @param {Object} features Features in GeoJSON format
     * @param {string} [featureId] Feature id
     */
    constructor(features, featureId) {
        super('change')

        this.features = features

        this.featureId = featureId
    }
}

class SelectEvent extends Event {
    /**
     * @param {string | null} featureId Feature id
     * @param {number[]} coordinates Pointer coordinates
     * @param {boolean} modifying
     */
    constructor(featureId, coordinates, modifying) {
        super('select')

        this.featureId = featureId

        this.coordinates = coordinates

        this.modifying = modifying
    }
}

export default class DrawingManager extends Observable {
    // API
    constructor(map, tools, options = {}) {
        super()

        this.map = map

        this.geojsonFormat = new GeoJSON({
            featureProjection: this.map.getView().getProjection(),
        })

        this.options = options

        this.layer = new VectorLayer({
            source: new VectorSource({ useSpatialIndex: false }),
        })
        this.source = this.layer.getSource()

        this.tools = {}
        for (let [type, options] of Object.entries(tools)) {
            const tool = new DrawInteraction({
                ...options.drawOptions,
                source: this.source,
            })
            tool.set('type', type)
            tool.setActive(false)
            const overlaySource = tool.getOverlay().getSource()
            overlaySource.on('addfeature', (event) => this.onAddFeature_(event, options.properties))
            tool.on('change:active', (event) => this.onDrawActiveChange_(event))
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

        document.removeEventListener('keyup', this.onKeyUpFunction_)
    }

    // API
    toggleTool(tool) {
        if (this.activeInteraction) {
            this.activeInteraction.setActive(false)
        }
        this.deselect()
        this.activeInteraction = this.tools[tool]
        this.activeInteraction.setActive(true)
    }

    // API
    deselect() {
        this.select.getFeatures().clear()
    }

    // API
    remove(feature) {
        console.log('FIXME: remove feature', feature)
    }

    dispatchChangeEvent_(feature) {
        const features = this.geojsonFormat.writeFeaturesObject(this.source.getFeatures())
        this.dispatchEvent(new ChangeEvent(features, feature.getId()))
    }

    dispatchSelectEvent_(feature, modifying) {
        const featureId = feature ? feature.getId() : null
        this.dispatchEvent(new SelectEvent(featureId, this.pointerCoordinate, modifying))
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
        feature.setStyle(featureStyle(feature))
    }

    onDrawActiveChange_(event) {
        this.select.setActive(!event.target.getActive())
    }

    onDrawEnd_(event) {
        this.source.once('addfeature', (event) => this.dispatchChangeEvent_(event.feature))

        // deactivate drawing tool
        event.target.setActive(false)
        this.select.getFeatures().push(event.feature)
    }

    onModifyStart_(event) {
        const features = event.features.getArray()
        if (features.length) {
            console.assert(features.length == 1)
            const feature = features[0]
            this.dispatchSelectEvent_(feature, true)
        }
    }

    onModifyEnd_(event) {
        const features = event.features.getArray()
        if (features.length) {
            console.assert(features.length == 1)
            const feature = features[0]
            this.dispatchSelectEvent_(feature, false)
            this.dispatchChangeEvent_(feature)
        }
    }

    onSelectChange_(event) {
        if (event.type === 'add') {
            this.dispatchSelectEvent_(event.element, false)
        } else if (event.type === 'remove') {
            this.dispatchSelectEvent_(null, false)
        }
    }
}
