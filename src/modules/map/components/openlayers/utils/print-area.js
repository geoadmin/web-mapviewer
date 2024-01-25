import { computed, watch } from 'vue'
import { useStore } from 'vuex'

import log from '@/utils/logging'

export default function usePrintArea(map) {
    const store = useStore()
    var deregister = []
    const isActive = computed(() => {
        return store.state.print.printSectionShown
    })

    const layoutName = computed(() => {
        return store.state.print.selectedLayout.name
    })

    const scale = computed(() => {
        return store.state.print.selectedScale
    })

    watch(isActive, (newValue) => {
        togglePrintArea(newValue)
    })

    function togglePrintArea(newValue) {
        log.info('Print is active: ', newValue)
        if (newValue) {
            deregister = [
                activatePrintArea(),
                watch(layoutName, () => {
                    log.info(scale.value, layoutName.value)
                }),
                watch(scale, () => {
                    log.info(scale.value, layoutName.value)
                }),
            ]
        } else {
            while (deregister.length > 0) {
                var item = deregister.pop()
                if (typeof item === 'function') {
                    item()
                } else {
                    item.target.un(item.type, item.listener)
                }
            }
        }
    }

    function activatePrintArea() {
        log.info('activate print area')
        return map.on('postcompose', (event) => {
            log.info(scale.value, layoutName.value, event)
        })
    }
}
