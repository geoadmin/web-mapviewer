import paper from 'paper'
//import CreatePath from './create/path.js'
// import CreatePolygon from './create/polygon.js'
import CreateShape from './create/shape.js'
// import CreatePoint from './create/point.js'
// import UpdatePath from './update/path.js'

export default class Drawing {
    constructor(canvas) {
        this.scope = paper.setup(canvas)

        // const tool = new CreatePath(this.scope)
        // const tool = new CreatePolygon(this.scope)
        const tool = new CreateShape(this.scope)
        // const point = new CreatePoint(this.scope)
        // const updatePath = new UpdatePath(this.scope)
        tool.activate()
        // console.log(tool)
        // this.mouseDot = new paper.Path.Circle({
        //   locked: true,
        //   radius: 5,
        //   fillColor: '#09f',
        //   strokeColor: '#fff',
        // });

        //   const sketchCircle = new paper.Path.Circle({
        //     center: new paper.Point(50, 50),
        //     radius: 25,
        //     fillColor: 'white',
        //     strokeColor: 'black',
        //   });
    }
}
