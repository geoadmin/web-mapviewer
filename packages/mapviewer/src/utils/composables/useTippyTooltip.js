import tippy, { roundArrow } from 'tippy.js'
import { onBeforeUnmount, onMounted, toRef, toValue, watch } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * Configure TippyJS on the element(s) given as poram
 *
 * This composable will watch over the two main arguments (selector and content) and refresh the
 * TippyJS instance accordingly. Any content will be automicaly translated.
 *
 * WARNING: the selector should not be too general as it might match other component outside of this
 * one and it can set multiple tooltip to component resulting to subtle bugs.
 *
 * @example
 *     const myElement = useTemplateRef('myElement')
 *     useTippyTooltip(myElement, 'My Tooltip')
 *
 *     <div ref="myElement">My element</div>
 *
 * @example
 *     const items = [
 *     {
 *     title: 'item 1',
 *     description: 'Tooltip content for item 1',
 *     },
 *     {
 *     title: 'item 2',
 *     description: 'Tooltip content for item 2',
 *     },
 *     ]
 *
 *     const tooltipAnchors = useTemplateRef('tooltipAnchors')
 *     const tooltipContents = computed(() => items.map((item) => item.description))
 *     useTippyTooltip(tooltipAnchors, tooltipContents)
 *
 *     <div v-for="item in items" :key="item.name" data-cy="item-lits">
 *     <div ref="tooltipAnchors" :data-cy="`item-${item.name}`">{{ item.name }}</div>
 *     </div>
 *
 *     // Then in cypress you can use the following code snippet to test the tooltip content
 *     cy.get('[data-cy="item-lits"]').realHover()
 *     cy.get('[data-cy="tippy-item 1"]').should('be.visible')
 *
 * @param {ShallowRef<HTMLElement> | ShallowRef<HTMLElement[]>} refs References to element(s) to add
 *   a tooltip
 * @param {string | string[]} content Content for the tooltip. In case your are providing multiple
 *   refs and want a different content for each, you can provide an array of content the same length
 *   as refs (same order as refs)
 * @param {Object} options Options for the TippyJS instance
 * @param {string} options.theme Theme to use for the tooltip. If no theme is given, the theme
 *   'light' will be used.
 * @param {string} options.placement Tooltip placement. Will default to 'top' if nothing is
 *   provided.
 * @param {[number, number]} options.delay Tooltip [show,hide] delay, in ms. Will default to [300,0]
 *   if nothing is provided.
 * @param {boolean} options.allowHTML Indicates if the tooltip content contains HTML code. Default
 *   to false
 * @param {boolean} options.offset Displaces the tooltip from its reference element in pixels,
 *   default is [0, 10] (skidding and distance).
 */
export function useTippyTooltip(refs, content, options = {}) {
    // variable holding the tooltip instances
    let tooltips = null

    const finalOptions = {
        arrow: roundArrow + roundArrow,
        // Show tippy on long touch for mobile devices
        touch: ['hold', 500], // 500ms delay,
        // passing any other options given by the user
        ...options,
        // setting some defaults if user didn't provide important values
        theme: options.theme ?? 'light',
        placement: options.placement ?? 'top',
        delay: options.delay ?? [300, 0],
        allowHTML: !!options.allowHTML,
        offset: options.offset ?? [0, 10], // the default value from tippy
    }

    const { t } = useI18n()

    onMounted(() => {
        refreshTippyAttachment()
    })

    onBeforeUnmount(() => {
        removeTippy()
    })

    function onContentUpdate() {
        if (toValue(content)) {
            if (tooltips?.length > 0) {
                tooltips.forEach((tp, index) => {
                    if (Array.isArray(toValue(content))) {
                        tp.setContent(t(toValue(content)[index]))
                    } else {
                        tp.setContent(t(toValue(content)))
                    }
                })
            } else {
                refreshTippyAttachment()
            }
        } else {
            removeTippy()
        }
    }

    function removeTippy() {
        tooltips?.forEach((tp) => tp.destroy())
        tooltips = null
    }

    function refreshTippyAttachment() {
        // if thpe selector is a function, call it.
        // this allows for lazy loading/referencing of DOM elements
        let attachment = toValue(refs)
        if (typeof attachment === 'function') {
            attachment = attachment()
        }
        removeTippy()

        if (
            !attachment ||
            !toValue(content) ||
            (Array.isArray(toValue(content)) && !toValue(content).length)
        ) {
            return
        }

        tooltips = tippy(attachment, {
            // we need to set the content dynamically onTrigger otherwise the tippy would
            // not be reactive when the data-tippy-content changes
            onTrigger: () => onContentUpdate(),
            onCreate: (instance) => {
                // Set a data-cy attribute that can be used for e2e tests
                const dataCy = instance.reference.getAttribute('data-cy')
                if (dataCy) {
                    instance.popper.setAttribute('data-cy', `tippy-${dataCy}`)
                }
            },
            ...finalOptions,
        })

        if (!Array.isArray(tooltips)) {
            // if we only have one tooltip returned, wrapping it here so that
            // the following operations behave exactly the same
            tooltips = [tooltips]
        }

        watch(toRef(content), onContentUpdate)
        watch(toRef(refs), refreshTippyAttachment)
    }
    return { refreshTippyAttachment, removeTippy }
}
