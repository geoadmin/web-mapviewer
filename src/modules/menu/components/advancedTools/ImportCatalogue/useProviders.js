import { computed, ref } from 'vue'

import providersJson from '@/modules/menu/components/advancedTools/ImportCatalogue/external-providers.json'

export function useProviders(newUrl) {
    const url = ref(newUrl)
    const allProviders = ref(providersJson)
    const showProviders = ref(false)

    const providers = computed(() => {
        let _providers = allProviders.value
        if (url.value?.length) {
            _providers = allProviders.value.filter((it) => it.includes(url.value))
        }
        return _providers.map((it) => {
            return {
                value: it,
                display: it
                    .replace(/access_key=.*/, '')
                    .replace(url.value, `<strong>${url.value}</strong>`),
            }
        })
    })

    function toggleProviders() {
        showProviders.value = !showProviders.value
    }

    return {
        showProviders,
        providers,
        toggleProviders,
    }
}
