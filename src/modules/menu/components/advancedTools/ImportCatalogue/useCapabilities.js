import axios, { AxiosError } from 'axios'
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

import {
    CapabilitiesError,
    parseWmsCapabilities,
    parseWmtsCapabilities,
} from '@/api/layers/layers-external.api'
import {
    guessExternalLayerUrl,
    isWmsGetCap,
    isWmtsGetCap,
} from '@/modules/menu/components/advancedTools/ImportCatalogue/utils'
import log from '@/utils/logging'

export function useCapabilities(newUrl) {
    const url = ref(newUrl)

    const store = useStore()
    const projection = computed(() => store.state.position.projection)
    const lang = computed(() => store.state.i18n.lang)

    function handleFileContent(content, fullUrl, contentType) {
        if (isWmsGetCap(content)) {
            return handleWms(content, fullUrl)
        } else if (isWmtsGetCap(content)) {
            return handleWmts(content, fullUrl)
        } else {
            throw new CapabilitiesError(
                `Unsupported url ${fullUrl} response content; Content-Type=${contentType}`,
                'unsupported_content_type'
            )
        }
    }

    function handleWms(content, fullUrl) {
        let wmsMaxSize = null
        const capabilities = parseWmsCapabilities(content, fullUrl)
        if (capabilities.Service.MaxWidth && capabilities.Service.MaxHeight) {
            wmsMaxSize = {
                width: capabilities.Service.MaxWidth,
                height: capabilities.Service.MaxHeight,
            }
        }
        return {
            layers: capabilities.getAllExternalLayerObjects(projection.value, 1, true),
            wmsMaxSize,
        }
    }

    function handleWmts(content, fullUrl) {
        return {
            layers: parseWmtsCapabilities(content, fullUrl).getAllExternalLayerObjects(
                projection.value,
                1,
                true
            ),
        }
    }

    async function loadCapabilities() {
        const fullUrl = guessExternalLayerUrl(url.value, lang.value).toString()
        try {
            const response = await axios.get(fullUrl, { timeout: 5000 })
            if (response.status !== 200) {
                throw new CapabilitiesError(
                    `Failed to fetch ${fullUrl}; status_code=${response.status}`,
                    'network_error'
                )
            }
            const props = handleFileContent(
                response.data,
                fullUrl,
                response.headers.get('Content-Type')
            )
            if (props?.layers.length === 0) {
                throw new CapabilitiesError(`No valid layer found in ${fullUrl}`, 'no_layer_found')
            }
            return props
        } catch (error) {
            log.error(`Failed to fetch url ${fullUrl}`, error, error.stack)
            if (error instanceof AxiosError) {
                throw new CapabilitiesError(error.message, 'network_error')
            }
            throw error
        }
    }

    return { loadCapabilities }
}
