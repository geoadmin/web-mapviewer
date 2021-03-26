// base class for tools

export default class Tool {
    constructor(scope) {
        this.scope = scope

        this.scope.project.currentStyle = {
            strokeColor: '#09f',
            fillColor: '#f00',
            strokeScaling: false,
            strokeWidth: 2,
            fontFamily: 'Courier New',
            fontWeight: 'bold',
            fontSize: 20,
            justification: 'center',
        }
    }

    onMouseDown() {}
    onMouseMove() {}
    onMouseDrag() {}
    onMouseUp() {}
    onDoubleClick() {}

    activate() {
        this.tool = new this.scope.Tool()

        this.tool.onMouseDown = this.onMouseDown.bind(this)
        this.tool.onMouseMove = this.onMouseMove.bind(this)
        this.tool.onMouseDrag = this.onMouseDrag.bind(this)
        this.tool.onMouseUp = this.onMouseUp.bind(this)

        let prevDown = 0
        this.tool.on('mousedown', (event) => {
            if (event.delta.length === 0 && event.timeStamp - prevDown < 300) {
                console.log('double')
                this.onDoubleClick(event)
            }
            prevDown = event.timeStamp
        })

        this.tool.activate()
    }

    deactivate() {
        if (this.tool) {
            this.tool.remove()
            this.tool = undefined
        }
    }
}
