import map from "./store";

export class MapModule {
    constructor(store, router) {
        this.store = store
        this.router = router
    }

    install(options = {}) {
        this.store.registerModule('map', map)
        // Initialise the module using dependencies
    }
}
