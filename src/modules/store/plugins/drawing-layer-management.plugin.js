import KMLLayer from '@/api/layers/KMLLayer.class'

const generateKmlLayer = (kmlUrl, fileId, adminId) => {
    return new KMLLayer(1.0, kmlUrl, fileId, adminId)
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
    store.subscribe((mutation, state) => {
        if (
            ['setKmlIds', 'setShowDrawingOverlay'].includes(mutation.type) &&
            !state.ui.showDrawingOverlay &&
            state.drawing.drawingKmlIds?.fileId
        ) {
            // if we have a KML layer and that the drawing menu is not open
            //(!state.ui.showDrawingOverlay), then we need to add the KML layer to the active
            //layers, otherwise the KML drawing manager is responsible to display the KML.
            const kmlLayer = generateKmlLayer(
                store.getters.getDrawingPublicFileUrl,
                state.drawing.drawingKmlIds.fileId,
                state.drawing.drawingKmlIds.adminId
            )
            store.dispatch('addLayer', kmlLayer)
        } else if (
            mutation.type === 'removeLayerWithId' &&
            !state.ui.showDrawingOverlay &&
            state.drawing.drawingKmlIds?.fileId &&
            !state.layers.activeLayers.find(
                (layer) => layer.kmlFileUrl === store.getters.getDrawingPublicFileUrl
            )
        ) {
            // When removing the drawing layer and the drawing menu is closed we
            // need to clear the kml IDs of the drawing module in order to clear the
            // kml drawing manager, this way when opening the drawing menu again we
            // start with a new empty KML.
            store.dispatch('setKmlIds', null)
        } else if (mutation.type === 'clearLayers' && !state.ui.showDrawingOverlay) {
            // Same as for 'removeLayerWithId' mutation, see comment above
            store.dispatch('setKmlIds', null)
        }
    })
}

export default drawingLayerManagementPlugin
