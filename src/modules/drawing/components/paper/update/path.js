import Tool from '../tool.js'

const hitOptions = {
    segments: true,
    stroke: true,
    fill: false,
    tolerance: 6,
}

export default class UpdatePath extends Tool {
    constructor(scope) {
        super(scope)

        this.hintDot = new this.scope.Path.Circle({
            locked: true,
            radius: 5,
            fillColor: '#09f',
            strokeColor: '#fff',
        })
        this.hintDot.remove()
    }

    onMouseMove = (event) => {
        const hit = this.scope.project.hitTest(event.point, hitOptions)
        if (hit) {
            this.hintDot.position = hit.point
            this.hintDot.addTo(this.scope.project)
        } else {
            this.hintDot.remove()
        }
    }

    onMouseDown(event) {
        const hit = this.scope.project.hitTest(event.point, hitOptions)
        if (hit) {
            if (hit.type === 'segment') {
                // move control point
                this.selected = hit.segment
            } else if (hit.type === 'stroke') {
                // add new control point
                this.selected = hit.item.insert(hit.location.index + 1, event.point)
            }
        } else {
            this.selected = null
        }
    }

    onMouseDrag(event) {
        this.hintDot.position = event.point
        if (this.selected) {
            this.selected.point = event.point
        }
    }
}
