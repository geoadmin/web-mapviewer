import KMLLayer from '@/api/layers/KMLLayer.class'

const generateKmlLayer = (kmlUrl) => {
    return new KMLLayer('test', 1.0, kmlUrl)
}

/**
 * Plugin that adds the drawing KML in the layer stack when the drawing is done (or when the KML
 * file id changes).
 *
 * It will store the KML layer as soon as the file ID is available, and only add it to the layer
 * stack when the drawing is finished (when the drawing UI is being hidden)
 *
 * @param {Vuex.Store} store
 */
const drawingAddLayerWhenDrawingDonePlugin = (store) => {
    let kmlLayer = null
    store.subscribe((mutation, state) => {
        if (mutation.type === 'setKmlIds') {
            if (state.drawing.drawingKmlIds && state.drawing.drawingKmlIds.fileId) {
                kmlLayer = generateKmlLayer(store.getters.getDrawingPublicFileUrl)
            }
        } else if (mutation.type === 'setShowDrawingOverlay') {
            if (!kmlLayer && state.drawing.drawingKmlIds && state.drawing.drawingKmlIds.fileId) {
                kmlLayer = generateKmlLayer(store.getters.getDrawingPublicFileUrl)
            }
            if (state.ui.showDrawingOverlay) {
                // we remove the drawing layer (the KML) so that it can be edited in the drawing
                // module, without having a duplicate in the layer stack
                store.dispatch('removeLayer', kmlLayer)
            } else {
                store.dispatch('addLayer', kmlLayer)
            }
        }
    })
}

export default drawingAddLayerWhenDrawingDonePlugin
