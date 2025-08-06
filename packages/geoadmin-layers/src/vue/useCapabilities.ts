import type { CoordinateSystem } from '@geoadmin/coordinates'

import log from '@geoadmin/log'
import axios, { AxiosError } from 'axios'
import { type MaybeRefOrGetter, toValue } from 'vue'

import type { ExternalWMSLayer, ExternalWMTSLayer } from '@/types'

import {
    EXTERNAL_SERVER_TIMEOUT,
    parseWmsCapabilities,
    parseWmtsCapabilities,
} from '@/api/external'
import { ExternalWMSCapabilitiesParser } from '@/parsers'
import { guessExternalLayerUrl, isWmsGetCap, isWmtsGetCap } from '@/utils/externalLayerUtils'
import { CapabilitiesError } from '@/validation'

export interface ParsedExternalWMS {
    layers: ExternalWMSLayer[]
    wmsMaxSize?: {
        width: number
        height: number
    }
}

export interface ParsedExternalWMTS {
    layers: ExternalWMTSLayer[]
}

function handleFileContent(
    content: string,
    fullUrl: URL,
    projection: CoordinateSystem,
    contentType?: string
): ParsedExternalWMTS | ParsedExternalWMS {
    if (isWmsGetCap(content)) {
        return handleWms(content, fullUrl, projection)
    } else if (isWmtsGetCap(content)) {
        return handleWmts(content, fullUrl, projection)
    } else {
        throw new CapabilitiesError(
            `Unsupported url ${fullUrl} response content; Content-Type=${contentType}`,
            'unsupported_content_type'
        )
    }
}

function handleWms(content: string, fullUrl: URL, projection: CoordinateSystem): ParsedExternalWMS {
    let wmsMaxSize
    const capabilities = ExternalWMSCapabilitiesParser.parse(content, fullUrl)
    if (capabilities.Service.MaxWidth && capabilities.Service.MaxHeight) {
        wmsMaxSize = {
            width: capabilities.Service.MaxWidth,
            height: capabilities.Service.MaxHeight,
        }
    }
    return {
        layers: ExternalWMSCapabilitiesParser.getAllExternalLayers(capabilities, {
            outputProjection: projection,
            initialValues: {
                opacity: 1,
                isVisible: true,
            },
        }),
        wmsMaxSize,
    }
}

function handleWmts(
    content: string,
    fullUrl: URL,
    projection: CoordinateSystem
): ParsedExternalWMTS {
    return {
        layers: parseWmtsCapabilities(content, fullUrl).getAllExternalLayerObjects(
            projection,
            1,
            true
        ),
    }
}

/**
 * @param {String} url
 * @param {CoordinateSystem} projection
 * @param {String} lang
 */
export function useCapabilities(
    url: MaybeRefOrGetter<string>,
    projection: MaybeRefOrGetter<CoordinateSystem>,
    lang: MaybeRefOrGetter<string>
) {
    async function loadCapabilities(): Promise<ParsedExternalWMTS | ParsedExternalWMS> {
        const fullUrl = guessExternalLayerUrl(toValue(url), toValue(lang))
        try {
            const response = await axios.get(fullUrl.toString(), {
                timeout: EXTERNAL_SERVER_TIMEOUT,
            })
            if (!response || response.status !== 200 || !response.headers) {
                throw new CapabilitiesError(
                    `Failed to fetch ${fullUrl.toString()}; status_code=${response.status}`,
                    'network_error'
                )
            }
            const props = handleFileContent(
                response.data,
                fullUrl,
                toValue(projection),
                response.headers['Content-Type'] as string
            )
            if (props?.layers?.length === 0) {
                throw new CapabilitiesError(
                    `No valid layer found in ${fullUrl.toString()}`,
                    'no_layer_found'
                )
            }
            return props
        } catch (error: any) {
            console.log('woot', error)
            log.error(`Failed to fetch url ${fullUrl}`, error)
            if (error instanceof AxiosError) {
                throw new CapabilitiesError(error.message, 'network_error')
            }
            throw error
        }
    }

    return { loadCapabilities }
}
