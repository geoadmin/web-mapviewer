export class Feature {
    constructor(coordinate, title, description, isEditable) {
        this.coordinate = [...coordinate]
        this.title = title
        this.description = description
        this.isEditable = !!isEditable
    }
}

export default {
    state: {
        /** @type Array<Feature> */
        selectedFeatures: [],
    },
    getters: {},
    actions: {},
    mutations: {},
}
