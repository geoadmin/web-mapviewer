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
 * @param {string | Component} selector Selector for element(s) to add a tooltip. You can also use
 *   an element reference or list of elements reference to attach the tooltip
 * @param {{ theme: string; placement: string; delay: [number, number] }} options Options for the
 *   tippy
 * @param {string} options.theme Theme to use for the tippy
 * @param {string} options.placement Tippy placement
 * @param {[number, number]} options.delay Tippy delay
 */
export function useTippyTooltip(
    selector,
    { theme = null, placement = null, delay = [300, 0] } = {}
) {
    let tooltips = null
    const options = { delay }
    if (theme) {
        options.theme = theme
    }
    if (placement) {
        options.placement = placement
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
            tp.setContent(i18n.t(tp.reference.attributes['data-tippy-content'].value))
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
            touch: false,
            // we need to set the content dynamically onTrigger otherwise the tippy would
            // not be reactive when the data-tippy-content changes
            onTrigger: () => setContent(),
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
    return { refreshTippyAttachment }
}
