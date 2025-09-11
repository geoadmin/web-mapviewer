import log from '@swissgeo/log'
import { computed, ref } from 'vue'

import providersJson from '@/modules/menu/components/advancedTools/ImportCatalogue/external-providers.json'

class Provider {
    constructor(url, emphasize = '') {
        this.url = url
        this.htmlDisplay = url.replace(/access_key=.*/, '')
        this.emphasize = emphasize
    }

    getBaseUrl() {
        try {
            const urlObj = new URL(this.url)
            return urlObj.origin
        } catch (e) {
            log.error('Invalid URL:', this.url, e)
            return null
        }
    }
}

class Providers {
    constructor(providers) {
        this.providers = providers.map((p) => new Provider(p))
    }

    filter(text) {
        let providers = this.providers
        if (text.length) {
            providers = this.providers.filter((p) =>
                p.url.toLowerCase().includes(text.toLowerCase())
            )
        }
        return providers.map((p) => new Provider(p.url, text))
    }
}

export function useProviders(newUrl) {
    const url = ref(newUrl)
    const allProviders = ref(new Providers(providersJson))
    const showProviders = ref(false)

    const providers = computed(() => allProviders.value.filter(url.value))

    const groupedProviders = computed(() => {
        const groups = {}
        providers.value.forEach((provider) => {
            const baseUrl = provider.getBaseUrl()
            if (!groups[baseUrl]) {
                groups[baseUrl] = []
            }
            groups[baseUrl].push(provider)
        })
        return groups
    })

    const filterText = computed(() => url.value)
    const filterApplied = computed(() => url.value.length > 0)

    function toggleProviders() {
        showProviders.value = !showProviders.value
    }

    return {
        groupedProviders,
        showProviders,
        providers,
        toggleProviders,
        filterApplied,
        filterText,
    }
}
