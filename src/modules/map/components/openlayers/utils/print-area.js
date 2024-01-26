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
        if (newValue) {
            activatePrintArea()
        } else {
            deactivatePrintArea()
        }
    })

    function activatePrintArea() {
        log.info('activate print area')
        deregister = [
            map.on('postrender', (event) => {
                log.info(event)
                updatePrintArea()
            }),
            watch(layoutName, () => {
                updatePrintArea()
            }),
            watch(scale, () => {
                updatePrintArea()
            }),
        ]
    }

    function deactivatePrintArea() {
        log.info('deactivate print area')
        while (deregister.length > 0) {
            var item = deregister.pop()
            if (typeof item === 'function') {
                item()
            } else {
                item.target.un(item.type, item.listener)
            }
        }
    }

    function updatePrintArea() {
        log.info(scale.value, layoutName.value)
    }
}
