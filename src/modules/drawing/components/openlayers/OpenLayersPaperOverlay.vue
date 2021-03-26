<template>
    <div></div>
</template>
<script>
import Drawing from '../paper/index'
// FIXME listen to store

export default {
    inject: ['getMap'],
    created() {
        this.canvas = document.createElement('canvas')
        this.canvas.style.pointerEvents = 'auto'
    },
    mounted() {
        this.draw = new Drawing(this.canvas)
        const container = this.getMap().getOverlayContainer()
        container.appendChild(this.canvas)

        this.map = this.getMap()
        this.map.on('postrender', (event) => {
            // console.log(this.draw.scope.view)
            this.draw.scope.view.viewSize = event.frameState.size
            this.draw.scope.view.matrix.set(event.frameState.coordinateToPixelTransform)
        })
    },
}
</script>
