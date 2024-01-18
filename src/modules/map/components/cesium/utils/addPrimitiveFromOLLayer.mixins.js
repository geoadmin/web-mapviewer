import { PrimitiveCollection } from 'cesium'
import { Vector as VectorLayer } from 'ol/layer'

import { IS_TESTING_WITH_CYPRESS } from '@/config'
import { PRIMITIVE_DISABLE_DEPTH_TEST_DISTANCE } from '@/modules/map/components/cesium/constants'
import addLayerToViewer from '@/modules/map/components/cesium/utils/addLayerToViewer-mixins'
import FeatureConverter from '@/modules/map/components/cesium/utils/olcs/FeatureConverter'
import { updateCollectionProperties } from '@/modules/map/components/cesium/utils/primitiveLayerUtils'
import log from '@/utils/logging'

const STYLE_RESOLUTION = 20

/**
 * Vue mixin that will handle the addition or removal of a Cesium Primitive layer with data provided
 * by an OpenLayers Vector layer. This is a centralized way of describing this logic.
 *
 * This mixin will create a Cesium layer that will be added to the viewer (through dependency
 * injection with `getViewer`). The mixin will manage this layer and will remove it from the viewer
 * as soon as the component that has incorporated this mixin will be removed from the DOM.
 *
 * Any component that wants to use this mixin must give/implement :
 *
 * - `loadDataInOLLayer()`: a method that returns a promise that resolves when all relevant data have
 *   been loaded into the `this.olLayer` object.
 * - `fromProjection`: a {@link CoordinateSystem} that describe in which projection are data described
 *   in `this.olLayer` (so that they may be reprojected to WebMercator down the line)
 *
 * Also, this mixin set/update opacity of the layer.
 */
const addPrimitiveFromOLLayerMixins = {
    mixins: [addLayerToViewer],
    watch: {
        opacity(newOpacity) {
            updateCollectionProperties(this.layer, { opacity: newOpacity })
            this.getViewer().scene.requestRender()
        },
        url() {
            this.olLayer.getSource().clear()
            this.removeLayer(this.layer)
            this.loadLayer().then((projection) => {
                if (projection) this.addPrimitive(projection)
            })
        },
    },
    created() {
        this.layer = new PrimitiveCollection()
        this.olLayer = new VectorLayer({
            id: this.layerId,
            opacity: this.opacity,
            properties: { altitudeMode: 'clampToGround' },
            projection: this.projection.epsg,
        })
        this.loadDataInOLLayer()
            .then(() => {
                this.addPrimitive()
            })
            .catch((error) => {
                log.error('Error while loading primitives for layer', this.layerId, error)
            })
    },
    methods: {
        addLayer(layer) {
            this.getViewer().scene.primitives.add(layer)
            this.isPresentOnMap = true
        },
        removeLayer(layer) {
            const viewer = this.getViewer()
            layer.removeAll()
            viewer.scene.primitives.remove(layer)
            viewer.scene.requestRender()
            this.isPresentOnMap = false
        },
        addPrimitive() {
            const scene = this.getViewer().scene
            const featureConverter = new FeatureConverter(scene)
            const counterpart = featureConverter.olVectorLayerToCesium(
                this.olLayer,
                {
                    getProjection: () => this.projection.epsg,
                    getResolution: () => STYLE_RESOLUTION,
                },
                {}
            )
            // need to wait for terrain loaded otherwise primitives will be placed wrong
            if (this.layer) {
                const collectionProperties = {
                    opacity: this.opacity,
                    disableDepthTestDistance: PRIMITIVE_DISABLE_DEPTH_TEST_DISTANCE,
                }
                if (scene.globe.tilesLoaded || IS_TESTING_WITH_CYPRESS) {
                    this.layer.add(counterpart.getRootPrimitive())
                    updateCollectionProperties(this.layer, collectionProperties)
                    this.getViewer().scene.requestRender()
                } else {
                    const unlisten = scene.globe.tileLoadProgressEvent.addEventListener(
                        (queueLength) => {
                            if (scene.globe.tilesLoaded && queueLength === 0) {
                                this.layer.add(counterpart.getRootPrimitive())
                                updateCollectionProperties(this.layer, collectionProperties)
                                this.getViewer().scene.requestRender()
                                unlisten()
                            }
                        }
                    )
                }
            }
        },
    },
}
export default addPrimitiveFromOLLayerMixins
