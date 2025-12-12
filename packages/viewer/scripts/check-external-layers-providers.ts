#!./node_modules/.bin/vite-node --script

import type {
    ExternalLayer,
    ExternalWMSLayer,
    ExternalWMTSLayer,
    WMSCapabilitiesResponse,
    WMTSCapabilitiesResponse,
} from '@swissgeo/layers'
import type { WMSCapabilitiesParser, WMTSCapabilitiesParser } from '@swissgeo/layers/parsers'
import type {
    AxiosHeaderValue,
    AxiosResponse,
    AxiosResponseHeaders,
    RawAxiosResponseHeaders,
} from 'axios'

import { LV95 } from '@swissgeo/coordinates'
import { LayerType } from '@swissgeo/layers'
import { EXTERNAL_SERVER_TIMEOUT, setWmsGetMapParams } from '@swissgeo/layers/api'
import { wmsCapabilitiesParser, wmtsCapabilitiesParser } from '@swissgeo/layers/parsers'
import axios, { AxiosError } from 'axios'
import axiosRetry from 'axios-retry'
import { promises as fs } from 'fs'
import { JSDOM } from 'jsdom'
import path from 'path'
import { exit } from 'process'
import sharp from 'sharp'
import writeYamlFile from 'write-yaml-file'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import {
    guessExternalLayerUrl,
    isWmsGetCap,
    isWmsUrl,
    isWmtsGetCap,
    isWmtsUrl,
} from '@/modules/menu/components/advancedTools/ImportCatalogue/utils'

// faking browser support, so that OpenLayers has what it requires to parse XMLs
const dom = new JSDOM()
global.DOMParser = dom.window.DOMParser
global.Node = dom.window.Node

const SIZE_OF_CONTENT_DISPLAY = 150

interface ProviderObject {
    provider: string
    url: string
    status?: number
    error?: string
    headers?: Record<string, string>
    content?: string
}

type InvalidProviderArrayKeys =
    | 'invalid_providers'
    | 'invalid_cors'
    | 'invalid_wms'
    | 'invalid_wmts'
    | 'invalid_content'

type InvalidMap = {
    // eslint-disable-next-line no-unused-vars
    [key in InvalidProviderArrayKeys]: ProviderObject[]
}

interface Result extends InvalidMap {
    valid_providers: string[]
}

interface Options {
    input?: string
    url?: string
    inplace?: boolean
    datetime?: boolean
}

const options = yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .version('1.0.0')
    .epilog('Check validity of all providers')
    .option('input', {
        default:
            './src/modules/menu/components/advancedTools/ImportCatalogue/external-providers.json',
        describe: 'Input JSON providers file to check',
        type: 'string',
    })
    .option('url', { describe: 'Input url to use instead of the json file', type: 'string' })
    .option('inplace', {
        alias: 'i',
        describe: 'Remove the invalid provider in the input file',
        type: 'boolean',
    })
    .option('datetime', {
        describe: 'Add ISO date time prefix to the output files',
        type: 'boolean',
    })
    .help('h')
    .alias('h', 'help').argv as Options

function setupAxiosRetry(): void {
    axiosRetry(axios, {
        retries: 8, // number of retries
        retryDelay: (retryCount: number): number => {
            console.log(`retry attempt: ${retryCount}`)
            return retryCount * 2000 // time interval between retries
        },
        retryCondition: (error): boolean => {
            // if retry condition is not specified, by default idempotent requests are retried
            return !error?.response || error?.response?.status >= 500
        },
    })
}

function compareResultByProvider(a: ProviderObject, b: ProviderObject): number {
    return compareCaseInsensitive(a.provider, b.provider)
}

function compareCaseInsensitive(a: string, b: string): number {
    if (a.toLowerCase() > b.toLowerCase()) {
        return 1
    } else if (a.toLowerCase() < b.toLowerCase()) {
        return -1
    }
    return 0
}
const requestHeaders = {
    Origin: 'https://map.geo.admin.ch',
    Referer: 'https://map.geo.admin.ch',
    'Sec-Fetch-Site': 'cross-site',
}

async function checkProviderGetMapTile(
    provider: string,
    capabilitiesResponse: AxiosResponse<string>,
    result: Result
): Promise<boolean> {
    const content = capabilitiesResponse.data
    let isProviderMapTileValid = true
    if (isWmsGetCap(content)) {
        isProviderMapTileValid = await handleWms(provider, content, result)
    } else if (isWmtsGetCap(content)) {
        isProviderMapTileValid = await handleWmts(provider, content, result)
    }

    return isProviderMapTileValid
}

async function handleWms(provider: string, content: string, result: Result): Promise<boolean> {
    let isProviderMapValid = true
    const capabilities: WMSCapabilitiesResponse = wmsCapabilitiesParser.parse(
        content,
        new URL(provider)
    )
    const layers = wmsCapabilitiesParser.getAllExternalLayers(capabilities, {
        outputProjection: LV95,
        initialValues: { opacity: 1, isVisible: true },
    })

    const firstLeaf = findFirstLeaf(layers)
    if (!firstLeaf) {
        return false
    }
    const capabilitiesLayer = wmsCapabilitiesParser.getCapabilitiesLayer(capabilities, firstLeaf.id)
    const crs = capabilities?.Capability?.Layer?.CRS[0]
    const style = capabilitiesLayer?.Style ? capabilitiesLayer.Style[0]?.Identifier : 'default'
    const getCapabilitiesUrl =
        capabilities.Capability?.Request?.GetCapabilities?.DCPType[0]?.HTTP?.Get?.OnlineResource

    // If the GetMap URL is the same as the GetCapabilities URL, we skip it because it's already checked
    const getMapUrls = capabilities.Capability?.Request.GetMap.DCPType.map(
        (d) => d.HTTP.Get?.OnlineResource
    )
        .filter(Boolean)
        .filter((url) => getCapabilitiesUrl !== url)

    if (!getMapUrls || !crs) {
        isProviderMapValid = false
        return isProviderMapValid
    }
    for (const getMapUrl of getMapUrls) {
        const url = setWmsGetMapParams(
            new URL(`${getMapUrl}`),
            firstLeaf.id,
            crs,
            style!
        ).toString()

        try {
            const { response, redirectHeaders } = await fetchMapTile(url, provider)
            isProviderMapValid =
                isProviderMapValid &&
                (await checkProviderResponse(
                    provider,
                    url,
                    response,
                    result,
                    redirectHeaders,
                    checkProviderResponseContentGetMap
                ))
        } catch (error) {
            isProviderMapValid = false
            result.invalid_wms.push({
                provider,
                url,
                error: error instanceof Error ? error.message : undefined,
                content: content,
            })
        }
    }

    return isProviderMapValid
}

async function handleWmts(provider: string, content: string, result: Result): Promise<boolean> {
    let isProviderGetTileValid = true
    const capabilities: WMTSCapabilitiesResponse = wmtsCapabilitiesParser.parse(
        content,
        new URL(provider)
    )
    const layers = wmtsCapabilitiesParser.getAllExternalLayers(capabilities, {
        outputProjection: LV95,
        initialValues: { opacity: 1, isVisible: true },
    })

    const firstLayer = findFirstLeaf(layers)
    if (!firstLayer || firstLayer.type !== LayerType.WMTS) {
        return false
    }
    const firstWmtsLayer = firstLayer as ExternalWMTSLayer
    const getTileUrlWithPlaceholders = firstWmtsLayer.urlTemplate
    const params: Record<string, string> = {
        tileRow: '0',
        tileCol: '0',
    }
    if (firstWmtsLayer.tileMatrixSets && firstWmtsLayer.tileMatrixSets.length > 0) {
        const firstTileMatrixSet = firstWmtsLayer.tileMatrixSets[0]!
        params.tileMatrixSet = firstTileMatrixSet.id
        if (firstTileMatrixSet.tileMatrix && firstTileMatrixSet.tileMatrix.length > 0) {
            params.tileMatrix = firstTileMatrixSet.tileMatrix[0]!.id
        }
    }
    if (firstWmtsLayer.style) {
        params.style = firstWmtsLayer.style
    }

    // Find the default value for each dimension
    const placeHolderParams = firstWmtsLayer.dimensions.reduce((acc, currentDimension) => {
        acc[currentDimension.id] = currentDimension.defaultValue
        return acc
    }, params)

    let getTileUrl: string | undefined
    try {
        getTileUrl = replaceUrlPlaceholders(getTileUrlWithPlaceholders, placeHolderParams)
        if (getTileUrl) {
            const { response, redirectHeaders } = await fetchMapTile(getTileUrl, provider)
            isProviderGetTileValid = await checkProviderResponse(
                provider,
                getTileUrl,
                response,
                result,
                redirectHeaders,
                checkProviderResponseContentGetMap
            )
        }
    } catch (error) {
        isProviderGetTileValid = false
        result.invalid_wmts.push({
            provider,
            url: getTileUrl ?? '',
            error: error instanceof Error ? error.message : undefined,
            content: content,
        })
    }

    return isProviderGetTileValid
}

interface FetchMapTileResponse {
    response: AxiosResponse<string> | AxiosResponse<ArrayBuffer>
    redirectHeaders: Record<string, string>[]
}

async function fetchMapTile(url: string, provider: string): Promise<FetchMapTileResponse> {
    const redirectHeaders: Record<string, string>[] = []
    const response = await axios.get<ArrayBuffer>(url, {
        headers: requestHeaders,
        timeout: EXTERNAL_SERVER_TIMEOUT,
        responseType: 'arraybuffer',
        beforeRedirect: (_, response) => {
            redirectHeaders.push(response.headers)
        },
    })

    if (!response.headers['content-type'].includes('image')) {
        throw new Error(
            `Invalid provider ${provider}, parsing failed: ${response.headers['content-type']}`
        )
    }

    return { response, redirectHeaders }
}

/** Replace placeholders in a URL template with values from a params object */
function replaceUrlPlaceholders(urlTemplate: string, params: Record<string, string>): string {
    const normalizedParams = Object.entries(params).reduce(
        (acc: Record<string, string>, [key, _]) => {
            acc[key.toLowerCase()] = params[key] ?? ''
            return acc
        },
        {}
    )
    return urlTemplate.replace(/{(\w+)}/g, (_match: string, key: string): string => {
        const lowerKey = key.toLowerCase()

        if (normalizedParams.hasOwnProperty(lowerKey)) {
            return normalizedParams[lowerKey]!
        } else {
            throw new Error(`Missing value for placeholder: ${key}`)
        }
    })
}

/** Find the first leaf layer in a layer tree */
function findFirstLeaf(layers: ExternalLayer[]): ExternalLayer | undefined {
    if (!layers || layers.length === 0) {
        return
    }

    for (const layer of layers) {
        if (layer.type !== LayerType.WMS) {
            return layer
        }

        const wmsLayer = layer as ExternalWMSLayer
        if (!wmsLayer.layers || wmsLayer.layers.length === 0) {
            return wmsLayer
        }
        const leaf = findFirstLeaf(wmsLayer.layers)
        if (leaf) {
            return leaf
        }
    }
}

async function checkProvider(provider: string, result: Result): Promise<void> {
    const url = guessExternalLayerUrl(provider, 'en').toString()
    let capabilitiesResponse: AxiosResponse
    const redirectHeaders: Record<string, string>[] = []
    try {
        capabilitiesResponse = await axios.get<string>(url, {
            //
            headers: requestHeaders,
            beforeRedirect: (options_, response) => {
                redirectHeaders.push(response.headers)
            },
            timeout: EXTERNAL_SERVER_TIMEOUT,
        })
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(`Provider ${provider} is not accessible: ${error.message}`)
            result.invalid_providers.push({
                provider,
                url,
                status: error.response?.status,
                error: error.message,
            })
        } else {
            throw error
        }
        return
    }

    // Validate provider response
    const isProviderValid = await checkProviderResponse(
        provider,
        url,
        capabilitiesResponse,
        result,
        redirectHeaders,
        checkProviderResponseContent
    )

    // If provider is invalid or map check fails, skip adding to valid_providers
    if (
        isProviderValid &&
        (await checkProviderGetMapTile(provider, capabilitiesResponse, result))
    ) {
        result.valid_providers.push(provider)
    }
}

function transformHeaders(
    headers: RawAxiosResponseHeaders | AxiosResponseHeaders
): Record<string, string> {
    return Object.entries(headers).reduce(
        (acc: Record<string, string>, [key, value]: [string, AxiosHeaderValue]) => {
            if (typeof value === 'string') {
                acc[key] = value
            } else if (Array.isArray(value)) {
                acc[key] = value.join(',')
            } else if (typeof value === 'object') {
                acc[key] = JSON.stringify(value)
            } else if (value) {
                acc[key] = `${value}`
            }
            return acc
        },
        {}
    )
}

async function checkProviderResponse(
    provider: string,
    url: string,
    response: AxiosResponse<string> | AxiosResponse<ArrayBuffer>,
    result: Result,
    redirectHeaders: Record<string, string>[],
    checkContentFnc?: CheckProviderCallback
): Promise<boolean> {
    if (![200, 201].includes(response.status)) {
        console.error(`Provider ${provider} is not valid: status=${response.status}`)
        result.invalid_providers.push({
            provider,
            url,
            status: response.status,
        })
    } else if (
        typeof response.headers.has === 'function' &&
        !response.headers.has('access-control-allow-origin')
    ) {
        console.error(
            `Provider ${provider} does not support CORS: status=${response.status}, ` +
                `missing access-control-allow-origin header`
        )
        result.invalid_cors.push({
            provider,
            url,
            status: response.status,
            headers: transformHeaders(response.headers),
        })
    } else if (redirectHeaders.some((header) => !header['access-control-allow-origin'])) {
        console.error(
            `Provider ${provider} redirects ${redirectHeaders.length} times to a different URL which does not support CORS: status=${response.status}, ` +
                `missing access-control-allow-origin header`
        )
        const errorHeader = redirectHeaders.find((header) => !header['access-control-allow-origin'])
        result.invalid_cors.push({
            provider: provider,
            url: url,
            status: response.status,
            headers: errorHeader,
        })
    } else if (
        !['*', 'https://map.geo.admin.ch'].includes(
            response.headers['access-control-allow-origin'].toString()?.trim()
        )
    ) {
        console.error(
            `Provider ${provider} does not have geoadmin in its CORS: status=${
                response.status
            }, Access-Control-Allow-Origin=${response.headers['access-control-allow-origin']}`
        )
        result.invalid_cors.push({
            provider: provider,
            url: url,
            status: response.status,
            headers: transformHeaders(response.headers),
        })
    } else if (checkContentFnc && (await checkContentFnc(provider, url, response, result))) {
        console.log(`Provider ${provider} is OK`)
        return true
    }
    return false
}

type CheckProviderCallback = (
    _provider: string,
    _url: string,
    _response: AxiosResponse<string> | AxiosResponse<ArrayBuffer>,
    _result: Result
) => Promise<boolean>

const checkProviderResponseContent: CheckProviderCallback = (
    provider,
    url,
    response,
    result
): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
        const content = response.data
        if (typeof content !== 'string') {
            resolve(false)
            return
        }

        const parseCapabilities = (
            isCapFn: (_input: string) => boolean,
            parser: WMSCapabilitiesParser | WMTSCapabilitiesParser,
            type: string,
            result: Result,
            resultArrayKey: InvalidProviderArrayKeys
        ): boolean => {
            if (!isCapFn(content)) {
                return false
            }

            try {
                const capabilities: WMTSCapabilitiesResponse | WMSCapabilitiesResponse =
                    parser.parse(content, new URL(url))
                // @ts-expect-error Generic type inference doesn't work here, but capabilities will have the correct type
                const layers = parser.getAllExternalLayers(capabilities, {
                    outputProjection: LV95,
                    initialValues: { opacity: 1, isVisible: true },
                })

                if (layers.length === 0) {
                    throw new Error(`No valid ${type} layers found`)
                }
            } catch (error) {
                console.error(
                    `Invalid provider ${provider}, ${type} get Cap parsing failed: ${String(error)}`
                )
                result[resultArrayKey].push({
                    provider,
                    url,
                    error: `${String(error)}`,
                    content: content.slice(0, SIZE_OF_CONTENT_DISPLAY),
                })
                return false
            }
            return true
        }
        if (
            parseCapabilities(isWmsGetCap, wmsCapabilitiesParser, 'WMS', result, 'invalid_wms') ||
            parseCapabilities(isWmtsGetCap, wmtsCapabilitiesParser, 'WMTS', result, 'invalid_wmts')
        ) {
            resolve(true)
        }

        console.error(`Invalid provider ${url}; file type not recognized`)
        result.invalid_content.push({
            provider,
            url,
            content: content.slice(0, SIZE_OF_CONTENT_DISPLAY),
        })
        resolve(false)
    })
}

const checkProviderResponseContentGetMap: CheckProviderCallback = async (
    provider,
    url,
    response,
    result
): Promise<boolean> => {
    const data = response.data
    if (typeof data === 'string') {
        return false
    }

    const content = Buffer.from(data)
    let isValid = false
    try {
        // Check if the content is a valid image
        await sharp(content).metadata()
        isValid = true
    } catch (error) {
        if (isWmsUrl(url)) {
            console.error(
                `Invalid provider ${provider}, WMS get Map content parsing failed: ${String(error)}`
            )
            result.invalid_wms.push({
                provider: provider,
                url: url,
                error: `${String(error)}`,
            })
        } else if (isWmtsUrl(url)) {
            console.error(
                `Invalid provider ${provider}, WMTS get Tiles content parsing failed: ${String(error)}`
            )
            result.invalid_wmts.push({
                provider: provider,
                url: url,
                error: `${String(error)}`,
            })
        }
    }

    return isValid
}

async function checkProviders(providers: string[], result: Result): Promise<void[]> {
    return Promise.all(providers.map(async (provider) => checkProvider(provider, result)))
}

async function writeResult(result: Result): Promise<void[]> {
    const resultsFolder = 'scripts/check-layer-providers-results'
    let prefix = ''
    if (options.datetime) {
        prefix = `${new Date().toISOString()}_`
    }
    let valid_providers_file = `${resultsFolder}/${prefix}valid_providers.json`
    if (options.inplace && options.input) {
        valid_providers_file = options.input
    }
    return Promise.all([
        writeYamlFile(`${resultsFolder}/${prefix}invalid_providers.yaml`, {
            count: result.invalid_providers.length,
            result: result.invalid_providers.sort(compareResultByProvider),
        }),
        writeYamlFile(`${resultsFolder}/${prefix}invalid_providers_cors.yaml`, {
            count: result.invalid_cors.length,
            result: result.invalid_cors.sort(compareResultByProvider),
        }),
        writeYamlFile(`${resultsFolder}/${prefix}invalid_providers_wms.yaml`, {
            count: result.invalid_wms.length,
            result: result.invalid_wms.sort(compareResultByProvider),
        }),
        writeYamlFile(`${resultsFolder}/${prefix}invalid_providers_wmts.yaml`, {
            count: result.invalid_wmts.length,
            result: result.invalid_wmts.sort(compareResultByProvider),
        }),
        writeYamlFile(`${resultsFolder}/${prefix}invalid_providers_content.yaml`, {
            count: result.invalid_content.length,
            result: result.invalid_content.sort(compareResultByProvider),
        }),
        fs.writeFile(
            valid_providers_file,
            JSON.stringify(result.valid_providers.sort(compareCaseInsensitive), null, 4) + '\n'
        ),
    ])
}

async function main(): Promise<void> {
    const result: Result = {
        valid_providers: [],
        invalid_providers: [],
        invalid_cors: [],
        invalid_wms: [],
        invalid_wmts: [],
        invalid_content: [],
    }
    setupAxiosRetry()

    let providers: string[] = []
    const options_url = options.url
    const options_input = options.input
    if (options_url) {
        providers = [options_url]
    } else if (options_input) {
        providers = JSON.parse(
            await fs.readFile(path.resolve(options_input), { encoding: 'utf-8' })
        )
    } else {
        console.error(`No sources given for providers`)
    }

    await checkProviders(providers, result)
    console.log(`Done checking all ${providers.length} providers, writing results...`)
    try {
        await writeResult(result)
        console.log(
            `Checked ${providers.length} providers, ${
                providers.length - result.valid_providers.length
            } where invalids and ${result.invalid_cors.length} don't support CORS`
        )
    } catch (error) {
        console.error(`Failed to write results: ${String(error)}`)
    }
}

void main().then(() => exit())
