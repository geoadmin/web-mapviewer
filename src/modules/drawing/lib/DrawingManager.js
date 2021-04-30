// FIXME: change cursor
// FIXME: add tooltips
// FIXME: add style to features
// FIXME: add coordinates to events
// FIXME: apply new style function?
// FIXME: add coordinate, length, and area ?

import DrawInteraction from 'ol/interaction/Draw'
import ModifyInteraction from 'ol/interaction/Modify'
import SelectInteraction from 'ol/interaction/Select'
import SnapInteraction from 'ol/interaction/Snap'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Observable from 'ol/Observable'
import Event from 'ol/events/Event'
import GeoJSON from 'ol/format/GeoJSON'
import { getUid } from 'ol/util'
import { noModifierKeys, singleClick } from 'ol/events/condition'

const geojson = new GeoJSON()

class DrawingManagerEvent extends Event {
    constructor(type, feature, coordinate = null) {
        super(type)

        this.coordinate = coordinate

        this.feature = geojson.writeFeatureObject(feature)
    }
}

export default class DrawingManager extends Observable {
    // API
    constructor(map, tools, options = {}) {
        super()

        this.map = map

        this.options = options

        this.layer = new VectorLayer({
            source: new VectorSource({ useSpatialIndex: false }),
        })
        this.source = this.layer.getSource()

        this.tools = {}
        for (let [id, options] of Object.entries(tools)) {
            const tool = new DrawInteraction({
                ...options.drawOptions,
                source: this.source,
            })
            tool.setActive(false)
            const overlaySource = tool.getOverlay().getSource()
            overlaySource.on('addfeature', (event) => this.onAddFeature_(event, options.properties))
            tool.on('change:active', (event) => this.onDrawActiveChange_(event))
            tool.on('drawstart', (event) => this.onDrawStart_(event))
            tool.on('drawend', (event) => this.onDrawEnd_(event))
            this.map.addInteraction(tool) // FIXME: move to activate
            this.tools[id] = tool
        }

        this.select = new SelectInteraction({
            // style: this.options.selectStyle,
            toggleCondition: () => false,
            layers: [this.layer],
        })
        const selected = this.select.getFeatures()
        selected.on('add', (event) => this.onSelectChange_(event))
        selected.on('remove', (event) => this.onSelectChange_(event))

        this.modify = new ModifyInteraction({
            features: selected,
            style: this.options.selectStyle,
            deleteCondition: (event) => noModifierKeys(event) && singleClick(event),
        })
        this.modify.on('modifystart', (event) => this.onModifyStart_(event))
        this.modify.on('modifyend', (event) => this.onModifyEnd_(event))

        this.snap = new SnapInteraction({
            source: this.source,
        })

        this.activeInteraction = null
    }

    // API
    activate() {
        if (!this.options.noModify) {
            this.map.addInteraction(this.select)
            this.map.addInteraction(this.modify)
        }
        this.map.addLayer(this.layer)
        this.map.addInteraction(this.snap)
        // this.select.setActive(true)
    }

    // API
    deactivate() {
        this.map.removeInteraction(this.select)
        this.map.removeInteraction(this.modify)
        this.map.removeInteraction(this.snap)
        // FIXME: remove layer
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

    onAddFeature_(event, properties) {
        const feature = event.feature

        feature.setId(getUid(feature))
        feature.setProperties(Object.assign({}, properties))
    }

    onDrawActiveChange_(event) {
        this.select.setActive(!event.target.getActive())
    }

    onDrawStart_(event) {
        this.dispatchEvent(new DrawingManagerEvent('drawstart', event.feature))
    }

    onDrawEnd_(event) {
        this.dispatchEvent(new DrawingManagerEvent('drawend', event.feature))

        // deactivate drawing tool
        event.target.setActive(false)
        this.select.getFeatures().push(event.feature)
    }

    onModifyStart_(event) {
        const features = event.features.getArray()
        if (features.length) {
            console.assert(features.length == 1)
            this.dispatchEvent(new DrawingManagerEvent('modifystart', features[0]))
        }
    }

    onModifyEnd_(event) {
        const features = event.features.getArray()
        if (features.length) {
            console.assert(features.length == 1)
            this.dispatchEvent(new DrawingManagerEvent('modifyend', features[0]))
        }
    }

    onSelectChange_(event) {
        if (event.type === 'add') {
            this.dispatchEvent(new DrawingManagerEvent('selected', event.element))
        } else if (event.type === 'remove') {
            this.dispatchEvent(new DrawingManagerEvent('deselected', event.element))
        }
    }
}
