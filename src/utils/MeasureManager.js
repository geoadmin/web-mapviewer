import Overlay from 'ol/Overlay'
import {
    canShowAzimuthCircle,
    formatAngle,
    formatMeters,
    getAzimuth,
    getMeasureDelta,
    toLv95,
} from '@/modules/drawing/lib/drawingUtils'
import { LineString, Polygon } from 'ol/geom'
import { Collection } from 'ol'
import { EditableFeatureTypes } from '@/api/features.api'

/**
 * Handels the overlays that are shown on top of a each measure drawing
 *
 * It is used in the Drawing module as well as in the map KMLLayer, as the drawing is displayed with
 * a KML Layer when outside of the drawing mode.
 */
export default class MeasureManager {
    constructor(map, layer) {
        this.map = map
        this.layer = layer

        this.layer.getSource().on('removefeature', (evt) => {
            this.removeOverlays(evt.feature)
            evt.feature.set('overlays', undefined)
        })

        map.getLayers().on('remove', (evt) => {
            if (evt.element === layer) {
                this.toggleOverlays(false)
            }
        })
        map.getLayers().on('add', (evt) => {
            if (evt.element === layer) {
                this.toggleOverlays(true)
            }
        })
    }

    // Creates a new measure tooltip
    createOverlay(cssClass, stopEvent = false) {
        const tooltipElement = document.createElement('div')
        tooltipElement.className = cssClass || 'tooltip-measure'
        return new Overlay({
            element: tooltipElement,
            offset: [0, -7],
            positioning: 'bottom-center',
            insertFirst: false,
            stopEvent: stopEvent,
        })
    }

    showOverlay(overlay, position, text) {
        overlay.getElement().innerHTML = text
        overlay.getElement().style.opacity = this.layer.getOpacity()
        overlay.setPosition(position)
    }

    updateOverlays(feature) {
        const overlays = feature.get('overlays')
        if (!overlays) {
            return
        }
        const isDrawing = feature.get('isDrawing')
        let currIdx = 0
        let geom = feature.getGeometry()
        const coordinatesLv95 = toLv95(geom.getCoordinates(), 'EPSG:3857')
        let geomLv95 =
            geom instanceof Polygon ? new Polygon(coordinatesLv95) : new LineString(coordinatesLv95)

        if (geom instanceof Polygon) {
            const area = geomLv95.getArea()
            let centerCoord = area ? geom.getInteriorPoint().getCoordinates() : undefined
            let coords = geom.getCoordinates()[0]
            geom = new LineString(coords)
            geomLv95 = new LineString(coordinatesLv95[0])

            // When drawing we show the area tooltip only when the user closes the polygon.
            if (isDrawing) {
                // We use the polygon coordinates without the last one.
                geom.setCoordinates(coords.slice(0, -1))
                geomLv95.setCoordinates(coordinatesLv95[0].slice(0, -1))
                const first = geom.getFirstCoordinate()
                const last = geom.getLastCoordinate()
                if (first[0] !== last[0] || first[1] !== last[1]) {
                    centerCoord = undefined
                }
            }
            const areaOverlay = overlays.item(currIdx) || this.createOverlay()
            this.showOverlay(
                areaOverlay,
                centerCoord,
                formatMeters(area, { dim: 2, applyFormat: false })
            )

            if (!overlays.item(currIdx)) {
                overlays.push(areaOverlay)
            }
            currIdx++
        }

        if (geom instanceof LineString) {
            let label = ''
            let length = geomLv95.getLength()
            if (canShowAzimuthCircle(geom)) {
                label += `${formatAngle(getAzimuth(geom))} / `
            }
            label += formatMeters(length, { applyFormat: false })
            const distOverlay = overlays.item(currIdx) || this.createOverlay()
            const position = length ? geom.getLastCoordinate() : undefined
            this.showOverlay(distOverlay, position, label)

            if (!overlays.item(currIdx)) {
                overlays.push(distOverlay)
            }
            currIdx++

            const delta = getMeasureDelta(length)
            for (let i = delta; i < 1; i += delta, currIdx++) {
                const t = overlays.item(currIdx) || this.createOverlay('draw-measure-tmp', false)
                this.showOverlay(
                    t,
                    geom.getCoordinateAt(i),
                    formatMeters(length * i, {
                        digits: 0,
                        applyFormat: false,
                    })
                )

                if (!overlays.item(currIdx)) {
                    overlays.push(t)
                }
            }
            if (currIdx < overlays.getLength()) {
                for (let j = overlays.getLength() - 1; j >= currIdx; j--) {
                    overlays.pop()
                }
            }
        }
    }

    // Add overlays with distance, azimuth and area, depending on the feature's geometry
    addOverlays(feature) {
        const geom = feature.getGeometry()
        if (geom instanceof Polygon || geom instanceof LineString) {
            let overlays = feature.get('overlays')
            if (!overlays) {
                overlays = new Collection()
                overlays.on('add', (evt) => {
                    this.map.addOverlay(evt.element)
                })
                overlays.on('remove', (evt) => {
                    this.map.removeOverlay(evt.element)
                })
                feature.set('overlays', overlays)
                feature.on('change', (evt) => {
                    this.updateOverlays(evt.target)
                })
            }
            this.updateOverlays(feature)
        }
    }

    // Remove the overlays attached to the feature
    removeOverlays(feature) {
        const overlays = feature.get('overlays')
        if (overlays instanceof Collection) {
            overlays.clear()
        }
    }

    // Add/remove overlays attached to a layer
    toggleOverlays(visible) {
        this.layer
            .getSource()
            ?.getFeatures()
            ?.forEach((feature) => {
                if (feature.get('editableFeature').featureType === EditableFeatureTypes.MEASURE) {
                    if (visible) {
                        this.addOverlays(feature)
                    } else {
                        this.removeOverlays(feature)
                    }
                }
            })
    }
}
