import Tool from '../tool.js'

export default class CreatePath extends Tool {
    createPath() {
        return new this.scope.Path({
            fillColor: null,
        })
    }

    onMouseUp(event) {
        if (event.delta.length === 0) {
            if (!this.path) {
                this.path = this.createPath()
            }
            this.path.add(event.point)
        }
    }

    onMouseMove(event) {
        if (this.path) {
            if (this.path.segments.length === 1) {
                this.path.add(event.point)
            } else if (this.path.lastSegment) {
                this.path.lastSegment.point = event.point
            }
        }
    }
    // onDoubleClick() {
    //     this.path.remove()
    //     this.path = null
    // }
}
