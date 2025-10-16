import type { Layer, WMTSCapabilitiesResponse } from '@swissgeo/layers'

import { EXTERNAL_SERVER_TIMEOUT } from '@swissgeo/layers/api'
import { wmsCapabilitiesParser, wmtsCapabilitiesParser } from '@swissgeo/layers/parsers'
import { CapabilitiesError } from '@swissgeo/layers/validation'
import log from '@swissgeo/log'
import axios, { AxiosError, AxiosHeaders } from 'axios'
import { type MaybeRef, toRef } from 'vue'

import {
    guessExternalLayerUrl,
    isWmsGetCap,
    isWmtsGetCap,
} from '@/modules/menu/components/advancedTools/ImportCatalogue/utils'
import { useI18nStore } from '@/store/modules/i18n.store'
import usePositionStore from '@/store/modules/position.store'

interface WMSMaxSize {
    width: number
    height: number
}

export function useCapabilities(newUrl: MaybeRef<URL>) {
    const url = toRef(newUrl)

    const positionStore = usePositionStore()
    const i18nStore = useI18nStore()

    function handleFileContent(
        content: string,
        fullUrl: URL,
        contentType: string
    ): { layers: Layer[]; wmsMaxSize?: WMSMaxSize } {
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

    function handleWms(
        content: string,
        fullUrl: URL
    ): { layers: Layer[]; wmsMaxSize?: WMSMaxSize } {
        let wmsMaxSize: WMSMaxSize | undefined

        const capabilities = wmsCapabilitiesParser.parse(content, fullUrl)

        if (capabilities.Service.MaxWidth && capabilities.Service.MaxHeight) {
            wmsMaxSize = {
                width: capabilities.Service.MaxWidth,
                height: capabilities.Service.MaxHeight,
            }
        }

        return {
            layers: capabilities.getAllExternalLayerObjects(positionStore.projection, 1, true),
            wmsMaxSize,
        }
    }

    function handleWmts(content: string, fullUrl: URL): { layers: Layer[] } {
        return {
            layers: (
                wmtsCapabilitiesParser.parse(content, fullUrl) as WMTSCapabilitiesResponse
            ).getAllExternalLayerObjects(positionStore.projection, 1, true),
        }
    }

    async function loadCapabilities(): Promise<{ layers: Layer[]; wmsMaxSize?: WMSMaxSize }> {
        const fullUrl = guessExternalLayerUrl(url.value.toString(), i18nStore.lang)

        try {
            const response = await axios.get(fullUrl.toString(), {
                timeout: EXTERNAL_SERVER_TIMEOUT,
            })
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

            const content = handleFileContent(response.data, fullUrl, contentType)

            if (content?.layers.length === 0) {
                throw new CapabilitiesError(`No valid layer found in ${fullUrl}`, 'no_layer_found')
            }

            return content
        } catch (error) {
            log.error({ messages: [`Failed to fetch url ${fullUrl}`, error] })

            if (error instanceof AxiosError) {
                throw new CapabilitiesError(error.message, 'network_error')
            }

            throw error
        }
    }

    return { loadCapabilities }
}
