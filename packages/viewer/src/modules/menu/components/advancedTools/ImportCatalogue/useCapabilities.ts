import type { WMSCapabilitiesResponse, WMTSCapabilitiesResponse } from '@swissgeo/layers'

import { EXTERNAL_SERVER_TIMEOUT } from '@swissgeo/layers/api'
import {
    wmsCapabilitiesParser,
    wmtsCapabilitiesParser,
} from '@swissgeo/layers/parsers'
import { CapabilitiesError } from '@swissgeo/layers/validation'
import log from '@swissgeo/log'
import axios, { AxiosError, AxiosHeaders } from 'axios'
import { computed, ref } from 'vue'

import {
    guessExternalLayerUrl,
    isWmsGetCap,
    isWmtsGetCap,
} from '@/modules/menu/components/advancedTools/ImportCatalogue/utils'
import { useI18nStore } from '@/store/modules/i18n.store'
import usePositionStore from '@/store/modules/position.store'

export function useCapabilities(newUrl: URL) {
    const url = ref(newUrl)

    const positionStore = usePositionStore()
    const i18nStore = useI18nStore()

    const projection = computed(() => positionStore.projection)
    const lang = computed(() => i18nStore.lang)

    function handleFileContent(content: string, fullUrl: URL, contentType: string) {
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

    function handleWms(content: string, fullUrl:URL) {
        let wmsMaxSize = null

        const capabilities = wmsCapabilitiesParser.parse(content, fullUrl) as WMSCapabilitiesResponse

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

    function handleWmts(content: string, fullUrl: URL) {
        return {
            layers: (wmtsCapabilitiesParser
                .parse(content, fullUrl) as WMTSCapabilitiesResponse)
                .getAllExternalLayerObjects(projection.value, 1, true),
        }
    }

    async function loadCapabilities() {
        const fullUrl = guessExternalLayerUrl(url.value.toString(), lang.value)

        try {
            const response = await axios.get(fullUrl.toString(), { timeout: EXTERNAL_SERVER_TIMEOUT })
            if (response.status !== 200) {
                throw new CapabilitiesError(
                    `Failed to fetch ${fullUrl}; status_code=${response.status}`,
                    'network_error'
                )
            }

            let contentType = ''

            if (response.headers instanceof AxiosHeaders) {
                contentType = response.headers.get('Content-Type') as string
            }

            const props = handleFileContent(
                response.data,
                fullUrl,
                contentType
            )

            if (props?.layers.length === 0) {
                throw new CapabilitiesError(`No valid layer found in ${fullUrl}`, 'no_layer_found')
            }

            return props
        } catch (error) {
            log.error({messages: [`Failed to fetch url ${fullUrl}`, error]})

            if (error instanceof AxiosError) {
                throw new CapabilitiesError(error.message, 'network_error')
            }

            throw error
        }
    }

    return { loadCapabilities }
}
