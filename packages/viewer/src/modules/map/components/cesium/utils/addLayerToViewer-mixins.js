/**
 * Vue mixin that will handle the addition or removal of a Cesium layer.
 *
 * Each component that uses this mixin must create a layer (`this.layer`) and next methods:
 *
 * - `addLayer` that gets `layer` and `zIndex` (optional) as properties
 * - `removeLayer` that gets `layer` as property
 */
const addLayerToViewer = {
    inject: ['getViewer'],
    data() {
        return {
            isPresentOnMap: false,
        }
    },
    mounted() {
        if (this.layer && !this.isPresentOnMap) {
            this.addLayer(this.layer, this.zIndex)
        }
    },
    unmounted() {
        if (this.layer && this.isPresentOnMap) {
            this.removeLayer(this.layer)
        }

        delete this.layer
    },
}

export default addLayerToViewer
