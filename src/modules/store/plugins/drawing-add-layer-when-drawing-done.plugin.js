import KMLLayer from '@/api/layers/KMLLayer.class'
import i18n from '@/modules/i18n'

const generateKmlLayer = (kmlUrl, fileId, adminId) => {
    return new KMLLayer(i18n.t('draw_layer_label'), 1.0, kmlUrl, fileId, adminId)
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
                kmlLayer = generateKmlLayer(
                    store.getters.getDrawingPublicFileUrl,
                    state.drawing.drawingKmlIds.fileId,
                    state.drawing.drawingKmlIds.adminId
                )
            }
        } else if (mutation.type === 'setShowDrawingOverlay') {
            if (state.drawing.drawingKmlIds && state.drawing.drawingKmlIds.fileId) {
                kmlLayer = generateKmlLayer(
                    store.getters.getDrawingPublicFileUrl,
                    state.drawing.drawingKmlIds.fileId,
                    state.drawing.drawingKmlIds.adminId
                )
            }
            if (kmlLayer) {
                if (!state.ui.showDrawingOverlay) {
                    store.dispatch('addLayer', kmlLayer)
                }
            }
        }
    })
}

export default drawingAddLayerWhenDrawingDonePlugin
