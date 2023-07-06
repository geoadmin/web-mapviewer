const addImageryLayerMixins = {
    inject: ['getViewer'],
    data() {
        return {
            isPresentOnMap: false,
        }
    },
    mounted() {
        if (this.layer && !this.isPresentOnMap) {
            this.addLayer(this.zIndex, this.layer)
        }
    },
    unmounted() {
        if (this.layer && this.isPresentOnMap) {
            this.removeLayer(this.layer)
        }

        delete this.layer
    },
    methods: {
        addLayer(zIndex, layer) {
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
            this.getViewer().scene.render()
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
