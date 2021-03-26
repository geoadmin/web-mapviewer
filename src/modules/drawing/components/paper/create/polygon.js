import CreatePath from './path.js'

export default class CreatePolygon extends CreatePath {
    createPath() {
        return new this.scope.Path({
            closed: true,
        })
    }
}
