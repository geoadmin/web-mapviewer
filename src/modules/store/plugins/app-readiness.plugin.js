/**
 * Plugin that will listen to most mutation as long as a certain state of readiness is not reached. When the state as
 * loaded enough data / is ready, this plugin will trigger the mutation that will set a flag to true and let the app
 * know it can show the map and all linked functionalities.
 */
const appReadinessPlugin = store => {
    store.subscribe((_, state) => {
        // if app is not ready yet, we go through the checklist
        if (!state.app.isReady) {
            if (state.size.width > 0 && state.size.height > 0
                && Object.keys(state.layers.config).length > 0) {
                store.dispatch('setAppIsReady');
            }
        }
        // otherwise we ignore all mutations, our job is already done
    });
}

export default appReadinessPlugin;
