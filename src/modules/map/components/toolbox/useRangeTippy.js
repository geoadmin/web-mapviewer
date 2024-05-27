import tippy from 'tippy.js'
import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Tippy instance to show a year input error
 *
 * @param {function} element Function that returns the element to mount the tippy on
 * @param {string} tooltipContent The content of the tippy tooltip
 * @returns The tippy instance and a function to update the content
 */
export function useRangeTippy(element, tooltipContent) {
    let tippyInstance = ref(null)

    onMounted(() => {
        // we need lazy evaluation of the argument, as the reference
        // is otherwise not yet set
        tippyInstance.value = tippy(element(), {
            content: tooltipContent,
            arrow: true,
            hideOnClick: false,
            placement: 'bottom',
            trigger: 'manual',
            theme: 'danger',
        })
    })

    onUnmounted(() => {
        tippyInstance.value.destroy()
    })

    function updateTippyContent(newContent) {
        tippyInstance.value.setContent(newContent)
    }
    return { tippyInstance, updateTippyContent }
}
