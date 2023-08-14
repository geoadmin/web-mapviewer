import addLayerToViewer from '@/modules/map/components/cesium/utils/addLayerToViewer-mixins'

/**
 * Vue mixin that will handle the addition or removal of a Cesium Imagery layer. This is a
 * centralized way of describing this logic.
 *
 * Each component that uses this mixin must create a layer (`this.layer`) in their `created(){}`
 * method. This layer will then be added to the viewer (through dependency injection with
 * `getViewer`). The mixin will manage this layer and will remove it from the viewer as soon as the
 * component that has incorporated this mixin will be removed from the DOM.
 *
 * `url` should be defined in the component and contains layer URL
 *
 * Component that will use this mixin should have `createImagery` method which takes layer URL as a
 * parameter
 *
 * It is also set/update zIndex of the layer, which places the layer accordingly in the stack of the
 * imagery layers in Cesium viewer.
 */
const addImageryLayerMixins = {
    mixins: [addLayerToViewer],
    methods: {
        addLayer(layer, zIndex) {
            const viewer = this.getViewer()
            viewer.scene.imageryLayers.add(layer, zIndex)
            this.isPresentOnMap = true
        },
        removeLayer(layer) {
            this.getViewer().scene.imageryLayers.remove(layer)
            this.isPresentOnMap = false
        },
    },
    watch: {
        opacity(newOpacity) {
            this.layer.alpha = newOpacity
            this.getViewer().scene.requestRender()
        },
        url(newUrl) {
            const viewer = this.getViewer()
            const index = viewer.scene.imageryLayers.indexOf(this.layer)
            viewer.scene.imageryLayers.remove(this.layer)
            this.layer = this.createImagery(newUrl)
            viewer.scene.imageryLayers.add(this.layer, index)
        },
        zIndex(zIndex) {
            if (this.layer) {
                const imageryLayers = this.getViewer().scene.imageryLayers
                const index = imageryLayers.indexOf(this.layer)
                const indexDiff = Math.abs(zIndex - index)
                for (let i = indexDiff; i !== 0; i--) {
                    if (index > zIndex) {
                        imageryLayers.lower(this.layer)
                    } else {
                        imageryLayers.raise(this.layer)
                    }
                }
            }
        },
    },
    created() {
        this.layer = this.createImagery(this.url)
    },
}

export default addImageryLayerMixins
