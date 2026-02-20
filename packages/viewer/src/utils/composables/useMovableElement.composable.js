import { isRef, onMounted, ref } from 'vue'

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
 * @param config {Object} Configuration object
 * @param {HTMLElement} config.element HTML element to be moved
 * @param {HTMLElement} [config.grabElement] HTML element on which the user has to grab to start
 *   moving the element. If not given, any part of the element will be considered a grab spot.
 * @param {{ top: Number; bottom: Number; left: Number; right: Number }} [config.offset] Offset in
 *   pixels with the border of the screen to constrain element movements. A default padding of 4
 *   pixel will be applied if no offset is given.
 * @param {string[]} [config.initialPositionClasses] Initial position classes to remove when the
 *   element is being moved
 */
export function useMovableElement(config = {}) {
    const {
        element = null,
        grabElement = null,
        offset = null,
        initialPositionClasses = [],
    } = config

    if (!config.element || !config.grabElement || !config.offset) {
        throw new Error(
            `[useMovableElement] Element, grabElement and offset are required
             to use a movable element.
             Received ${element} for element, ${grabElement} for grabElement,
             and ${offset} for offset.`
        )
    }

    if (isRef(element) || isRef(grabElement) || isRef(offset) || isRef(initialPositionClasses)) {
        throw new Error(
            `[useMovableElement] element, grabElement and offset must be a value.
             Received ${element} for element, ${grabElement} for grabElement,
             and ${offset} for offset.`
        )
    }

    let firstMovement = true

    const padding = ref({
        top: offset?.top ?? defaultPadding,
        bottom: offset?.bottom ?? defaultPadding,
        left: offset?.left ?? defaultPadding,
        right: offset?.right ?? defaultPadding,
    })

    const viewport = ref({
        bottom: window.innerHeight - padding.value.bottom,
        left: padding.value.left,
        right: window.innerWidth - padding.value.right,
        top: padding.value.top,
    })

    const lastPointerPosition = { top: 0, left: 0 }

    if (element) {
        // if we already have an element initialize
        initialize()
    } else {
        // the element is not yet mounted postpone the init on the onMounted hook
        onMounted(() => {
            initialize()
        })
    }

    function initialize() {
        const grab = grabElement
        grab.addEventListener('pointerdown', onPointerDown)
        grab.style.cursor = 'move'
        grab.style.touchAction = 'none' // prevent scrolling while dragging
        constrainElementWithinViewport(0, 0) // no delta needed
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

        constrainElementWithinViewport(deltaX, deltaY)
    }

    function onPointerUp() {
        document.removeEventListener('pointermove', onPointerMove)
        document.removeEventListener('pointerup', onPointerUp)
    }

    function placeElementAt(top, left, movementSource = MovementSource.POINTER_DRAG) {
        const el = element
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
     * Constrain the element within the viewport, taking into account the offset and places the
     * element at the new position
     *
     * @param {number} deltaX - The delta x to apply to the element
     * @param {number} deltaY - The delta y to apply to the element
     *
     *   Is useful at startup/mount, because the element might be out of viewport. If it is the case,
     *   our code that handles the drag will not flinch (because of the constraints check),
     *   rendering the drag and drop useless (stuck). We make sure the initial position of the
     *   element is valid here.
     */
    function constrainElementWithinViewport(deltaX, deltaY) {
        const el = element
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

        placeElementAt(newTop, newLeft, MovementSource.WINDOW_RESIZE)
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(value, max))
    }
}
