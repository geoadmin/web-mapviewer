import { computed, toRefs, toValue } from 'vue'

const defaultPadding = 4 // px

/**
 * Makes an element movable on the whole screen, making sure it won't go out of the screen (it will
 * be constrained by the screen borders)
 *
 * It is possible to specify custom offset with screen border, in order to avoid some part of the
 * app (such as the header) to be accessible to the movable element
 *
 * @param element
 * @param options Options such as described below
 * @param {HTMLElement} [options.grabElement] HTML element on which the user has to grab to start
 *   moving the element. If not given, any part of the element will be considered a grab spot.
 * @param {{ top: Number; bottom: Number; left: Number; right: Number }} [options.offset] Offset in
 *   pixels with the border of the screen to constrain element movements. A default padding of 4
 *   pixel will be applied if no offset is given.
 */
export function useMovableElement(element, options) {
    const { grabElement, offset } = toRefs(options)

    const padding = computed(() => {
        return {
            top: toValue(offset)?.top ?? defaultPadding,
            bottom: toValue(offset)?.bottom ?? defaultPadding,
            left: toValue(offset)?.left ?? defaultPadding,
            right: toValue(offset)?.right ?? defaultPadding,
        }
    })

    let rect
    let viewport = {
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
    }
    const currentMousePosition = {
        top: 0,
        left: 0,
    }
    const lastMousePosition = {
        top: 0,
        left: 0,
    }
    if (toValue(grabElement)) {
        // if present, the grab element is where you move the element from:
        toValue(grabElement).onmousedown = dragMouseDown
    } else {
        // otherwise, move the element from anywhere inside the DIV:
        toValue(element).onmousedown = dragMouseDown
    }

    function dragMouseDown(e) {
        e = e ?? window.event
        e.preventDefault()
        // get the mouse cursor position at startup:
        lastMousePosition.left = e.clientX
        lastMousePosition.top = e.clientY

        // store the current viewport and element dimensions when a drag starts
        rect = toValue(element).getBoundingClientRect()
        viewport.bottom = window.innerHeight - padding.value.bottom
        viewport.left = padding.value.left
        viewport.right = window.innerWidth - padding.value.right
        viewport.top = padding.value.top

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

        // check to make sure the element will be within our viewport boundary
        let newLeft = toValue(element).offsetLeft - currentMousePosition.left
        let newTop = toValue(element).offsetTop - currentMousePosition.top

        if (newLeft >= viewport.left && newLeft + rect.width <= viewport.right) {
            toValue(element).style.left =
                `${toValue(element).offsetLeft - currentMousePosition.left}px`
        }
        if (newTop >= viewport.top && newTop + rect.height <= viewport.bottom) {
            toValue(element).style.top =
                `${toValue(element).offsetTop - currentMousePosition.top}px`
        }
    }

    function closeDragElement() {
        document.removeEventListener('mouseup', closeDragElement)
        document.removeEventListener('mousemove', elementDrag)
    }
}
