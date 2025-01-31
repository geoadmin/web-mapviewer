import tippy from 'tippy.js'
import { onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * Configure Tippy
 *
 * This composable is to be use for simple tooltip use case, more complex use case should be
 * directly use the tippy library.
 *
 * When a component and/or subcomponent needs to have simple tooltip you can use this composable by
 * simply passing a ref or a CSS selector as input parameter, then set the tippy content to the
 * element data-tippy-content attribute. The content can be either a text or a i18n key that will be
 * translated. The translation happens during renderer so we don't have to listen to language
 * changes.
 *
 * The tippy element will automatically also have a data-cy=tippy-${dataCyFromElement} attribute
 * with dataCyFromElement being the data-cy attribute value of the tippy target. This data-cy
 * attribute can be used then to test the tippy in cypress see example below.
 *
 * WARNING: the selector should not be too general as it might match other component outside of this
 * one and it can set multiple tooltip to component resulting to subtle bugs.
 *
 * @example
 *     useTippyTooltip('#myId[data-tippy-content]')
 *
 *     <div id="myId" data-tippy-content="My Tooltip">My element</div>
 *
 * @example
 *     useTippyTooltip('#myId [data-tippy-content]')
 *
 *     <div id="myId">
 *     <div data-tippy-content="My Tooltip 1">sub element 1</div>
 *     <div data-tippy-content="My Tooltip 2">sub element 2</div>
 *     </div>
 *
 * @example
 *     useTippyTooltip('#myId [data-tippy-content]')
 *
 *     <div id="myId">
 *     <div data-tippy-content="My Tooltip 1" data-cy="my-div-1">sub element 1</div>
 *     <div data-tippy-content="My Tooltip 2" data-cy="my-div-2">sub element 2</div>
 *     </div>
 *
 *     // Then in cypress you can use the following code snippet to test the tippy content
 *     cy.get('[data-cy="my-div-1"]').realHover()
 *     cy.get('[data-cy="tippy-my-div-1"]').should('be.visible')
 *
 * @param {string | Component} selector Selector for element(s) to add a tooltip. You can also use
 *   an element reference or list of elements reference to attach the tooltip
 * @param {{ theme: string; placement: string; delay: [number, number] }} options Options for the
 *   tippy
 * @param {string} options.theme Theme to use for the tippy
 * @param {string} options.placement Tippy placement
 * @param {[number, number]} options.delay Tippy delay
 * @param {boolean} translate Indicates if tippy content should get translated
 * @param {boolean} allowHTML Indicates if tippy content contains HTML code
 * @param {boolean} offset Displaces the tippy from its reference element in pixels (skidding and
 *   distance).
 */
export function useTippyTooltip(
    selector,
    {
        theme = null,
        placement = null,
        delay = [300, 0],
        translate = true,
        allowHTML = false,
        offset = [0, 10], // the default value from tippy
    } = {}
) {
    let tooltips = null
    const options = { delay }
    if (theme) {
        options.theme = theme
    }
    if (placement) {
        options.placement = placement
    }
    if (allowHTML) {
        options.allowHTML = allowHTML
    }
    if (offset) {
        options.offset = offset
    }

    const i18n = useI18n()

    onMounted(() => {
        refreshTippyAttachment()
    })

    onBeforeUnmount(() => {
        removeTippy()
    })

    function setContent() {
        tooltips?.forEach((tp) =>
            tp.setContent(
                translate
                    ? i18n.t(tp.reference.attributes['data-tippy-content'].value)
                    : tp.reference.attributes['data-tippy-content'].value
            )
        )
    }

    function removeTippy() {
        tooltips?.forEach((tp) => tp.destroy())
        tooltips = null
    }

    function refreshTippyAttachment() {
        removeTippy()
        tooltips = tippy(selector, {
            ...options,
            arrow: true,
            // Show tippy on long touch for mobile device
            touch: ['hold', 500], // 500ms delay,
            // we need to set the content dynamically onTrigger otherwise the tippy would
            // not be reactive when the data-tippy-content changes
            onTrigger: () => setContent(),
            onCreate: (instance) => {
                // Set a data-cy attribute that can be used for e2e tests
                const dataCy = instance.reference.getAttribute('data-cy')
                if (dataCy) {
                    instance.popper.setAttribute('data-cy', `tippy-${dataCy}`)
                }
            },
        })
        if (
            !(
                selector instanceof String ||
                typeof selector === 'string' ||
                selector instanceof Array
            )
        ) {
            tooltips = [tooltips]
        }
    }
    return { refreshTippyAttachment, removeTippy }
}
