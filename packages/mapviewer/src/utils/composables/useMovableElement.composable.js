import { onMounted, ref, toValue } from 'vue'

const defaultPadding = 4 // px

const MovementSource = Object.freeze({
    POINTER_DRAG: 'pointer_drag',
    WINDOW_RESIZE: 'window_resize',
})

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
 * @param {string[]} [options.initialPositionClasses] Initial position classes to remove when the
 *   element is being moved
 */
export function useMovableElement(element, options = {}) {
    const { grabElement = null, offset = null, initialPositionClasses = [] } = options
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

    const lastPointerPosition = { top: 0, left: 0 }

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
        const grab = toValue(grabElement || element)
        grab.addEventListener('pointerdown', onPointerDown)
        grab.style.cursor = 'move'
        grab.style.touchAction = 'none' // prevent scrolling while dragging
        constrainElementWithinViewport()
    }

    function onPointerDown(e) {
        e.preventDefault()

        lastPointerPosition.left = e.clientX
        lastPointerPosition.top = e.clientY

        viewport.value = {
            bottom: window.innerHeight - padding.value.bottom,
            left: padding.value.left,
            right: window.innerWidth - padding.value.right,
            top: padding.value.top,
        }

        document.addEventListener('pointermove', onPointerMove)
        document.addEventListener('pointerup', onPointerUp)
    }

    function onPointerMove(e) {
        e.preventDefault()

        const deltaX = e.clientX - lastPointerPosition.left
        const deltaY = e.clientY - lastPointerPosition.top

        lastPointerPosition.left = e.clientX
        lastPointerPosition.top = e.clientY

        const el = toValue(element)
        const rect = el.getBoundingClientRect()
        const newLeft = clamp(
            el.offsetLeft + deltaX,
            viewport.value.left,
            viewport.value.right - rect.width
        )
        const newTop = clamp(
            el.offsetTop + deltaY,
            viewport.value.top,
            viewport.value.bottom - rect.height
        )

        placeElementAt(newTop, newLeft, MovementSource.POINTER_DRAG)
    }

    function onPointerUp() {
        document.removeEventListener('pointermove', onPointerMove)
        document.removeEventListener('pointerup', onPointerUp)
    }

    function placeElementAt(top, left, movementSource = MovementSource.POINTER_DRAG) {
        const el = toValue(element)
        const style = el.style

        if (
            firstMovement &&
            initialPositionClasses.length &&
            movementSource === MovementSource.POINTER_DRAG
        ) {
            const rect = el.getBoundingClientRect()
            initialPositionClasses.forEach((cls) => el.classList.remove(cls))
            style.top = `${rect.top}px`
            style.left = `${rect.left}px`
        } else {
            style.top = `${top}px`
            style.left = `${left}px`
        }

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
    function constrainElementWithinViewport() {
        const el = toValue(element)
        const rect = el.getBoundingClientRect()

        const newLeft = clamp(el.offsetLeft, viewport.value.left, viewport.value.right - rect.width)
        const newTop = clamp(el.offsetTop, viewport.value.top, viewport.value.bottom - rect.height)

        placeElementAt(newTop, newLeft, MovementSource.WINDOW_RESIZE)
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(value, max))
    }
}
