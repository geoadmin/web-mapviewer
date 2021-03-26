import Tool from '../tool.js'

export default class CreatePoint extends Tool {
    onMouseUp(event) {
        this.path = new this.scope.PointText({
            point: event.downPoint,
            content: `hello ${event.count}`,
        })
    }
}
