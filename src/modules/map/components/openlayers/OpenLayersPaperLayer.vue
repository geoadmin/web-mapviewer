<template>
    <div>
        <slot />
    </div>
</template>
<script>
import paper from 'paper'
import Layer from 'ol/layer/Layer'
// import { Vector as VectorSource } from 'ol/source'

import addLayerToMapMixin from './utils/addLayerToMap-mixins'

class PaperLayer extends Layer {
    constructor(options) {
        super(options)
        this.canvas = document.createElement('canvas')
        this.scope = paper.setup(this.canvas)

        this.path = new paper.Path()
        // this.path.fillColor = 'red'
        this.path.strokeColor = 'black'
        this.path.strokeWidth = 2
        this.path.add(new paper.Point(880341, 5885168))
        this.path.add(new paper.Point(1451217, 6108967))
        this.path.add(new paper.Point(1925119, 5976172))
        // this.path.closed = true
        // this.path.selected = true

        let drawing = false
        let path = null

        this.scope.view.onMouseUp = (event) => {
            if (!path) {
                path = new paper.Path()
                path.strokeColor = 'red'
                path.strokeWidth = 2
                path.fillColor = 'yellow'
                drawing = true
            }
            path.add(event.point)
        }

        this.scope.view.onMouseMove = (event) => {
            if (drawing) {
                if (path.segments.length === 1) {
                    path.add(event.point)
                } else if (path.lastSegment) {
                    path.lastSegment.point = event.point
                }
            }
        }
        this.scope.view.onDoubleClick = () => {
            drawing = false
            path = null
        }
    }

    render(frameState) {
        this.scope.view.viewSize = frameState.size
        this.scope.view.matrix.set(frameState.coordinateToPixelTransform)
        return this.canvas
    }
}

export default {
    mixins: [addLayerToMapMixin],
    props: {
        zIndex: {
            type: Number,
            default: -1,
        },
    },
    inject: ['getMap'],
    created() {
        this.layer = new PaperLayer({
            className: 'paper',
        })
    },
}
</script>
