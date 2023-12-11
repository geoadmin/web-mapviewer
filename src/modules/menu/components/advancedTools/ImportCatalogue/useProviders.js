import { computed, ref } from 'vue'

import providersJson from '@/modules/menu/components/advancedTools/ImportCatalogue/external-providers.json'

class Provider {
    constructor(url, emphasize = '') {
        this.url = url
        this.htmlDisplay = url
            .replace(/access_key=.*/, '')
            .replace(emphasize, `<strong>${emphasize}</strong>`)
    }
}

class Providers {
    constructor(providers) {
        this.providers = providers.map((p) => new Provider(p))
    }

    filter(text) {
        let providers = this.providers
        if (text.length) {
            providers = this.providers.filter((p) => p.url.includes(text))
        }
        return providers.map((p) => new Provider(p.url, text))
    }
}

export function useProviders(newUrl) {
    const url = ref(newUrl)
    const allProviders = ref(new Providers(providersJson))
    const showProviders = ref(false)

    const providers = computed(() => allProviders.value.filter(url.value))

    function toggleProviders() {
        showProviders.value = !showProviders.value
    }

    return {
        showProviders,
        providers,
        toggleProviders,
    }
}
