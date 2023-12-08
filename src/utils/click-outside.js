import log from '@/utils/logging'

const clickOutside = {
    beforeMount: (el, binding) => {
        el.clickOutsideEvent = (event) => {
            // here I check that click was outside the el and his children
            if (!(el == event.target || el.contains(event.target))) {
                // and if it did, call method provided in attribute value
                if (typeof binding.value === 'function') {
                    binding.value()
                } else {
                    log.error(`Binding to v-click-outside is not a function`, binding.value)
                }
            }
        }
        document.addEventListener('click', el.clickOutsideEvent)
    },
    unmounted: (el) => {
        document.removeEventListener('click', el.clickOutsideEvent)
    },
}
export default clickOutside
