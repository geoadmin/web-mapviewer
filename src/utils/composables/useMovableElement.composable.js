import { onMounted, ref, toValue } from 'vue'

const defaultPadding = 4 // px

/**
 * Makes an element movable on the whole screen, making sure it won't go out of the screen (it will
 * be constrained by the screen borders)
 *
 * It is possible to specify custom offset with screen border, in order to avoid some part of the
 * app (such as the header) to be accessible to the movable element
 *
 * @param element Reference to a DOM element
 * @param options Options such as described below
 * @param {HTMLElement} [options.grabElement] HTML element on which the user has to grab to start
 *   moving the element. If not given, any part of the element will be considered a grab spot.
 * @param {{ top: Number; bottom: Number; left: Number; right: Number }} [options.offset] Offset in
 *   pixels with the border of the screen to constrain element movements. A default padding of 4
 *   pixel will be applied if no offset is given.
 */
export function useMovableElement(element, options = {}) {
    const { grabElement = null, offset = null } = options
    let firstMovement = true

    const padding = ref({
        top: toValue(offset)?.top ?? defaultPadding,
        bottom: toValue(offset)?.bottom ?? defaultPadding,
        left: toValue(offset)?.left ?? defaultPadding,
        right: toValue(offset)?.right ?? defaultPadding,
    })

    const viewport = ref({
        bottom: window.innerHeight - padding.value.bottom,
        left: padding.value.left,
        right: window.innerWidth - padding.value.right,
        top: padding.value.top,
    })

    // keeping track of mouse position so that dragMouseDown and elementDrag can share these variables (no ref needed)
    const currentMousePosition = {
        top: 0,
        left: 0,
    }
    const lastMousePosition = {
        top: 0,
        left: 0,
    }

    if (toValue(element)) {
        // if we already have an element initialize
        initialize()
    } else {
        // the element is not yet mounted postpone the init on the onMounted hook
        onMounted(() => {
            initialize()
        })
    }

    function initialize() {
        if (toValue(grabElement)) {
            // if present, the grab element is where you move the element from:
            toValue(grabElement).onmousedown = dragMouseDown
            toValue(grabElement).style.cursor = 'move'
        } else {
            // otherwise, move the element from anywhere inside the DIV:
            toValue(element).onmousedown = dragMouseDown
            toValue(element).style.cursor = 'move'
        }
        constrainsElementWithinViewport()
    }

    function dragMouseDown(e) {
        e = e ?? window.event
        e.preventDefault()
        // get the mouse cursor position at startup:
        lastMousePosition.left = e.clientX
        lastMousePosition.top = e.clientY

        // updating the viewport dimensions when a drag starts
        viewport.value = {
            bottom: window.innerHeight - padding.value.bottom,
            left: padding.value.left,
            right: window.innerWidth - padding.value.right,
            top: padding.value.top,
        }

        document.addEventListener('mouseup', closeDragElement)
        document.addEventListener('mousemove', elementDrag)
    }

    function elementDrag(e) {
        e = e ?? window.event
        e.preventDefault()
        // calculate the new cursor position:
        currentMousePosition.left = lastMousePosition.left - e.clientX
        currentMousePosition.top = lastMousePosition.top - e.clientY
        lastMousePosition.left = e.clientX
        lastMousePosition.top = e.clientY

        const elementOffset = {
            left: toValue(element).offsetLeft,
            top: toValue(element).offsetTop,
        }
        const elementSize = toValue(element).getBoundingClientRect()
        // check to make sure the element will be within our viewport boundary
        let newLeft = elementOffset.left - currentMousePosition.left
        let newTop = elementOffset.top - currentMousePosition.top

        const {
            top: viewportTop,
            bottom: viewportBottom,
            left: viewportLeft,
            right: viewportRight,
        } = viewport.value

        if (newTop < viewportTop) {
            newTop = viewportTop
        }
        if (newTop + elementSize.height > viewportBottom) {
            newTop = viewportBottom - elementSize.height
        }
        if (newLeft < viewportLeft) {
            newLeft = viewportLeft
        }
        if (newLeft + elementSize.width > viewportRight) {
            newLeft = viewportRight - elementSize.width
        }
        placeElementAt(newTop, newLeft)
    }

    function closeDragElement() {
        document.removeEventListener('mouseup', closeDragElement)
        document.removeEventListener('mousemove', elementDrag)
    }

    function placeElementAt(top, left) {
        const htmlElementStyle = toValue(element).style
        // In case the original element has transform CSS, we need to reset it on the first movement and set the top to the mouse location to make it smooth movement transition
        if (firstMovement) {
            htmlElementStyle.transform = 'none'
            htmlElementStyle.top = `${lastMousePosition.top}px`
        } else {
            htmlElementStyle.top = `${top}px`
        }
        htmlElementStyle.left = `${left}px`
        firstMovement = false
    }

    /**
     * Will check that the current position is valid in the context of the viewport (or move the
     * element to match the viewport/padding).
     *
     * Is useful at startup/mount, because the element might be out of viewport. If it is the case,
     * our code that handles the drag will not flinch (because of the constraints check), rendering
     * the drag and drop useless (stuck). We make sure the initial position of the element is valid
     * here.
     */
    function constrainsElementWithinViewport() {
        const currentPosition = {
            left: toValue(element).offsetLeft,
            top: toValue(element).offsetTop,
        }
        const elementSize = toValue(element).getBoundingClientRect()
        const positionConstrainedByNewLimits = {
            ...currentPosition,
        }
        if (viewport.value.top > currentPosition.top) {
            positionConstrainedByNewLimits.top = viewport.value.top
        }
        if (viewport.value.bottom < currentPosition.top + elementSize.height) {
            positionConstrainedByNewLimits.top = viewport.value.bottom - elementSize.height
        }
        if (viewport.value.left > currentPosition.left) {
            positionConstrainedByNewLimits.left = viewport.value.left
        }
        if (viewport.value.right < currentPosition.left + elementSize.width) {
            positionConstrainedByNewLimits.right = viewport.value.right - elementSize.width
        }
        if (
            currentPosition.top !== positionConstrainedByNewLimits.top ||
            currentPosition.left !== positionConstrainedByNewLimits.left
        ) {
            placeElementAt(positionConstrainedByNewLimits.top, positionConstrainedByNewLimits.left)
        }
    }
}
