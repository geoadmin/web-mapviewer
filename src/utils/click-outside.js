import log from '@/utils/logging'

/*
 * V-click-outside directive
 *
 * This directive require a function
 *
 * @example Options API
 *     <template>
 *          <div v-click-outside="onClickOutside"></div>
 *     </template>
 *
 *     <script>
 *     export default {
 *          methods: {
 *              onClickOutside(event) {
 *                  // do stuff
 *              }
 *          }
 *     }
 *     </script>
 *
 * @example Composition API
 *      <script setup>
 *      function onClickOutside(event) {
 *          // do stuff
 *      }
 *      </script>
 *
 *      <template>
 *          <div v-click-outside="onClickOutside"></div>
 *      </template>
 */
const clickOutside = {
    beforeMount: (el, binding) => {
        el.clickOutsideEvent = (event) => {
            // here I check that click was outside the el and his children
            if (!(el === event.target || el.contains(event.target))) {
                // and if it did, call method provided in attribute value
                if (typeof binding.value === 'function') {
                    binding.value(event)
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
