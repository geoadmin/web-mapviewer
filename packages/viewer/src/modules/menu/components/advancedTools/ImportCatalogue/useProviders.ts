import type { ComputedRef, Ref } from 'vue'

import log from '@swissgeo/log'
import { computed, ref } from 'vue'

import providersJson from '@/modules/menu/components/advancedTools/ImportCatalogue/external-providers.json'

class Provider {
    url: string
    htmlDisplay: string
    emphasize: string

    constructor(url: string, emphasize: string = '') {
        this.url = url
        this.htmlDisplay = url.replace(/access_key=.*/, '')
        this.emphasize = emphasize
    }

    getBaseUrl(): string | undefined {
        try {
            const urlObj = new URL(this.url)
            return urlObj.origin
        } catch (e) {
            log.error({
                title: 'Invalid URL',
                message: [this.url, e instanceof Error ? e.message : String(e)],
            })
            return undefined
        }
    }
}

class Providers {
    providers: Provider[]

    constructor(providers: string[]) {
        this.providers = providers.map((p) => new Provider(p))
    }

    filter(text: string): Provider[] {
        let providers = this.providers
        if (text.length) {
            providers = this.providers.filter((p) =>
                p.url.toLowerCase().includes(text.toLowerCase())
            )
        }
        return providers.map((p) => new Provider(p.url, text))
    }
}

interface UseProvidersReturn {
    groupedProviders: ComputedRef<Record<string, Provider[]>>
    showProviders: Ref<boolean>
    providers: ComputedRef<Provider[]>
    toggleProviders: () => void
    filterApplied: ComputedRef<boolean>
    filterText: ComputedRef<string>
}

export function useProviders(newUrl: string): UseProvidersReturn {
    const url = ref(newUrl)
    const allProviders = ref(new Providers(providersJson))
    const showProviders = ref(false)

    const providers = computed(() => allProviders.value.filter(url.value))

    const groupedProviders = computed(() => {
        const groups: Record<string, Provider[]> = {}
        providers.value.forEach((provider) => {
            const baseUrl = provider.getBaseUrl()
            if (baseUrl) {
                if (!groups[baseUrl]) {
                    groups[baseUrl] = []
                }
                groups[baseUrl].push(provider)
            }
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
