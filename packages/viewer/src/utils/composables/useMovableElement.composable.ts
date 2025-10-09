import { isRef, onMounted, ref } from 'vue'

const defaultPadding = 4 // px

const MovementSource = Object.freeze({
    POINTER_DRAG: 'pointer_drag',
    WINDOW_RESIZE: 'window_resize',
})

type MovementSourceType = (typeof MovementSource)[keyof typeof MovementSource]

export interface Offset {
    top?: number
    bottom?: number
    left?: number
    right?: number
}

interface Padding {
    top: number
    bottom: number
    left: number
    right: number
}

interface Viewport {
    bottom: number
    left: number
    right: number
    top: number
}

interface PointerPosition {
    top: number
    left: number
}

export interface MovableElementConfig {
    element: HTMLElement | null
    grabElement: HTMLElement | null
    offset: Offset | undefined
    initialPositionClasses?: string[]
}

/**
 * Makes an element movable on the whole screen, making sure it won't go out of the screen (it will
 * be constrained by the screen borders)
 *
 * It is possible to specify custom offset with screen border, in order to avoid some part of the
 * app (such as the header) to be accessible to the movable element
 *
 * @param config Configuration object
 */
function formatElementInfo(element: HTMLElement | null | undefined): string {
    if (!element) {
        return typeof element
    }

    const tagName = element.tagName?.toLowerCase() || 'unknown'
    const id = element.id ? `#${element.id}` : ''
    const className = element.className ? `.${element.className.split(' ').join('.')}` : ''
    const attributes = Array.from(element.attributes || [])
        .filter(attr => attr.name !== 'id' && attr.name !== 'class')
        .map(attr => `${attr.name}="${attr.value}"`)
        .slice(0, 3) // Limit to first 3 attributes to avoid too long strings
        .join(' ')

    return `<${tagName}${id}${className}${attributes ? ' ' + attributes : ''}>`
}

export function useMovableElement(config: MovableElementConfig): void {
    const {
        element = undefined,
        grabElement = undefined,
        offset = undefined,
        initialPositionClasses = [],
    } = config

    if (!config.element || !config.grabElement || !config.offset) {
        const elementInfo = formatElementInfo(element)
        const grabElementInfo = formatElementInfo(grabElement)
        const offsetInfo = JSON.stringify(offset)
        throw new Error(
            `[useMovableElement] Element, grabElement and offset are required
             to use a movable element.
             Received ${elementInfo} for element, ${grabElementInfo} for grabElement,
             and ${offsetInfo} for offset.`
        )
    }

    if (isRef(element) || isRef(grabElement) || isRef(offset) || isRef(initialPositionClasses)) {
        const elementInfo = formatElementInfo(element)
        const grabElementInfo = formatElementInfo(grabElement)
        const offsetInfo = JSON.stringify(offset)
        throw new Error(
            `[useMovableElement] element, grabElement and offset must be a value.
             Received ${elementInfo} for element, ${grabElementInfo} for grabElement,
             and ${offsetInfo} for offset.`
        )
    }

    let firstMovement = true

    const padding = ref<Padding>({
        top: offset?.top ?? defaultPadding,
        bottom: offset?.bottom ?? defaultPadding,
        left: offset?.left ?? defaultPadding,
        right: offset?.right ?? defaultPadding,
    })

    const viewport = ref<Viewport>({
        bottom: window.innerHeight - padding.value.bottom,
        left: padding.value.left,
        right: window.innerWidth - padding.value.right,
        top: padding.value.top,
    })

    const lastPointerPosition: PointerPosition = { top: 0, left: 0 }

    if (element) {
        // if we already have an element initialize
        initialize()
    } else {
        // the element is not yet mounted postpone the init on the onMounted hook
        onMounted(() => {
            initialize()
        })
    }

    function initialize(): void {
        const grab = grabElement!
        grab.addEventListener('pointerdown', onPointerDown)
        grab.style.cursor = 'move'
        grab.style.touchAction = 'none' // prevent scrolling while dragging
        constrainElementWithinViewport(0, 0) // no delta needed
    }

    function onPointerDown(e: PointerEvent): void {
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

    function onPointerMove(e: PointerEvent): void {
        e.preventDefault()

        const deltaX = e.clientX - lastPointerPosition.left
        const deltaY = e.clientY - lastPointerPosition.top

        lastPointerPosition.left = e.clientX
        lastPointerPosition.top = e.clientY

        constrainElementWithinViewport(deltaX, deltaY)
    }

    function onPointerUp(): void {
        document.removeEventListener('pointermove', onPointerMove)
        document.removeEventListener('pointerup', onPointerUp)
    }

    function placeElementAt(top: number, left: number, movementSource: MovementSourceType = MovementSource.POINTER_DRAG): void {
        const el = element!
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
     * @param deltaX - The delta x to apply to the element
     * @param deltaY - The delta y to apply to the element
     *
     *   Is useful at startup/mount, because the element might be out of viewport. If it is the case,
     *   our code that handles the drag will not flinch (because of the constraints check),
     *   rendering the drag and drop useless (stuck). We make sure the initial position of the
     *   element is valid here.
     */
    function constrainElementWithinViewport(deltaX: number, deltaY: number): void {
        const el = element!
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

    function clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(value, max))
    }
}
