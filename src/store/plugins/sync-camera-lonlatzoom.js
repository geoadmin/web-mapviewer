/**
 * Plugin to synchronize the 3d camera position and orientation with the center and zoom.
 *
 * @param {Vuex.Store} store
 */
export default function syncCameraLonLatZoom(store) {
    store.subscribe((mutation, state) => {
        if (mutation.type === 'setCameraPosition' && state.position.camera !== null) {
            store.dispatch('setLongitude', parseFloat(state.position.camera.x))
            store.dispatch('setLatitude', parseFloat(state.position.camera.y))
            // FIXME: store.dispatch('setZoom', something(state.position.camera.z))
        }
    })
}
