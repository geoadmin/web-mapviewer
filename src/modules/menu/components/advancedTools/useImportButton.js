import { watch } from 'vue'

export function useImportButton(state) {
    const BTN_RESET_TIMEOUT = 3000 // milliseconds

    watch(state, (newState) => {
        if (newState !== 'default' && newState !== 'loading') {
            setTimeout(() => (state.value = 'default'), BTN_RESET_TIMEOUT)
        }
    })
}
