import KMLLayer from '@/api/layers/KMLLayer.class'
import i18n from '@/modules/i18n'

const generateKmlLayer = (kmlUrl, fileId, adminId) => {
    return new KMLLayer(i18n.global.t('draw_layer_label'), 1.0, kmlUrl, fileId, adminId)
}

/**
 * Plugin that adds the drawing KML in the layer stack when the drawing is done (or when the KML
 * file id changes), or that removes the drawing KML from the drawing module when the layer is
 * removed from the layers stack.
 *
 * It will store the KML layer as soon as the file ID is available, and only add it to the layer
 * stack when the drawing is finished (when the drawing UI is being hidden).
 *
 * In opposite when the drawing UI is closed and the KML layer is removed from the stack, the
 * drawing is then cleared by clearing the drawing KmlIds from the UI. This allow the creation of a
 * new drawing.
 *
 * @param {Vuex.Store} store
 */
const drawingLayerManagementPlugin = (store) => {
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
        } else if (
            mutation.type == 'removeLayerWithId' &&
            !state.ui.showDrawingOverlay &&
            !state.layers.activeLayers.find(
                (layer) => layer.kmlFileUrl === store.getters.getDrawingPublicFileUrl
            )
        ) {
            // When removing the drawing layer and the drawing menu is closed we
            // need to clear the kml IDs of the drawing module in order to clear the
            // kml drawing manager, this way when opening the drawing menu again we
            // start with a new empty KML.
            store.dispatch('setKmlIds', null)
        } else if (mutation.type == 'clearLayers' && !state.ui.showDrawingOverlay) {
            store.dispatch('setKmlIds', null)
        }
    })
}

export default drawingLayerManagementPlugin
