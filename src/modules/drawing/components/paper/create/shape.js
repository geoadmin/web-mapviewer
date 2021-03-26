import Tool from '../tool.js'

export default class CreateShape extends Tool {
    onMouseUp(event) {
        if (event.delta.length === 0) {
            if (this.center) {
                console.log('end')
                this.center = null
            } else {
                this.center = event.point
            }
        }
    }

    onMouseMove(event) {
        if (this.center) {
            this.path = new this.scope.Path.Circle({
                center: this.center,
                radius: this.center.getDistance(event.point),
            })
            this.path.removeOnMove()
        }
    }
}
