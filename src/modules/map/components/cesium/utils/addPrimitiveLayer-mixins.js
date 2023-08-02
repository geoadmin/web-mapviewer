import addLayerToViewer from './addLayerToViewer-mixins'
import { updateCollectionOpacity } from '@/modules/map/components/cesium/utils/primitiveLayerUtils'
import { PrimitiveCollection } from 'cesium'
import { Vector as VectorLayer } from 'ol/layer'
import FeatureConverter from 'ol-cesium/src/olcs/FeatureConverter'
import { IS_TESTING_WITH_CYPRESS } from '@/config'

const STYLE_RESOLUTION = 100

/**
 * Vue mixin that will handle the addition or removal of a Cesium Primitive layer. This is a
 * centralized way of describing this logic.
 *
 * This mixin will create layer that will be added to the viewer (through dependency injection with
 * `getViewer`). The mixin will manage this layer and will remove it from the viewer as soon as the
 * component that has incorporated this mixin will be removed from the DOM.
 *
 * `loadLayer` method should be defined in the component. This method should set the source and
 * features to the `olLayer` and call `addPrimitive` method then the layer will be converted to the
 * Cesium layer and added to the viewer.
 *
 * Also, this mixin set/update opacity of the layer.
 */
const addPrimitiveLayerMixins = {
    mixins: [addLayerToViewer],
    watch: {
        opacity(newOpacity) {
            updateCollectionOpacity(this.layer, newOpacity)
            this.getViewer().scene.requestRender()
        },
    },
    created() {
        this.layer = new PrimitiveCollection()
        this.olLayer = new VectorLayer({
            id: this.layerId,
            opacity: this.opacity,
            properties: { altitudeMode: 'clampToGround' },
        })
        this.loadLayer()
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
        addPrimitive(projection) {
            const scene = this.getViewer().scene
            const featureConverter = new FeatureConverter(scene)
            const counterpart = featureConverter.olVectorLayerToCesium(
                this.olLayer,
                {
                    getProjection: () => projection,
                    getResolution: () => STYLE_RESOLUTION,
                },
                {}
            )
            // need to wait for terrain loaded otherwise primitives will be placed wrong
            if (this.layer) {
                if (scene.globe.tilesLoaded || IS_TESTING_WITH_CYPRESS) {
                    this.layer.add(counterpart.getRootPrimitive())
                    updateCollectionOpacity(this.layer, this.opacity)
                    this.getViewer().scene.requestRender()
                } else {
                    const unlisten = scene.globe.tileLoadProgressEvent.addEventListener(
                        (queueLength) => {
                            if (scene.globe.tilesLoaded && queueLength === 0) {
                                this.layer.add(counterpart.getRootPrimitive())
                                updateCollectionOpacity(this.layer, this.opacity)
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
export default addPrimitiveLayerMixins
