export default function cancelCloseDrawing(this: DrawingStore, dispatcher: ActionDispatcher) {
    this.state = 'DRAWING'
}
