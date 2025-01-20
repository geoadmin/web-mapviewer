#!./node_modules/.bin/vite-node --script

import { JSDOM } from 'jsdom'

// faking browser support, so that OpenLayers has what it requires to parse XMLs
const dom = new JSDOM()
global.DOMParser = dom.window.DOMParser
global.Node = dom.window.Node

import axios, { AxiosError } from 'axios'
import axiosRetry from 'axios-retry'
import { promises as fs } from 'fs'
import { exit } from 'process'
import sharp from 'sharp'
import writeYamlFile from 'write-yaml-file'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import {
    EXTERNAL_SERVER_TIMEOUT,
    parseWmsCapabilities,
    parseWmtsCapabilities,
    setWmsGetMapParams,
} from '@/api/layers/layers-external.api'
import {
    guessExternalLayerUrl,
    isWmsGetCap,
    isWmsUrl,
    isWmtsGetCap,
    isWmtsUrl,
} from '@/modules/menu/components/advancedTools/ImportCatalogue/utils'
import { LV95 } from '@/utils/coordinates/coordinateSystems'
const SIZE_OF_CONTENT_DISPLAY = 150

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
    .alias('h', 'help').argv

function setupAxiosRetry() {
    axiosRetry(axios, {
        retries: 8, // number of retries
        retryDelay: (retryCount) => {
            console.log(`retry attempt: ${retryCount}`)
            return retryCount * 2000 // time interval between retries
        },
        retryCondition: (error) => {
            // if retry condition is not specified, by default idempotent requests are retried
            return !error?.response || error?.response?.status >= 500
        },
    })
}

function compareResultByProvider(a, b) {
    return compareCaseInsensitive(a['provider'], b['provider'])
}

function compareCaseInsensitive(a, b) {
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

async function checkProviderGetMapTile(provider, capabilitiesResponse, result) {
    const content = capabilitiesResponse.data
    let isProviderMapTileValid = true
    if (isWmsGetCap(content)) {
        isProviderMapTileValid = await handleWms(provider, content, result)
    } else if (isWmtsGetCap(content)) {
        isProviderMapTileValid = await handleWmts(provider, content, result)
    }

    return isProviderMapTileValid
}

async function handleWms(provider, content, result) {
    let isProviderMapValid = true
    const capabilities = parseWmsCapabilities(content, provider)
    const layers = capabilities.getAllExternalLayerObjects(
        LV95,
        1, // opacity
        true, // visible
        false // throw error in case of an error
    )

    const firstLeaf = findFirstLeaf(layers)
    const finding = capabilities.findLayer(firstLeaf.id)
    const crs = capabilities.Capability.Layer.CRS[0]
    const style = finding.layer?.Style ? finding.layer?.Style[0]?.Name : 'default'
    const getCapabilitiesUrl =
        capabilities.Capability.Request.GetCapabilities.DCPType[0].HTTP.Get.OnlineResource

    // If the GetMap URL is the same as the GetCapabilities URL, we skip it because it's already checked
    const getMapUrls = capabilities.Capability.Request.GetMap.DCPType.map(
        (d) => d.HTTP.Get.OnlineResource
    )
        .filter(Boolean)
        .filter((url) => getCapabilitiesUrl !== url)

    for (const getMapUrl of getMapUrls) {
        const url = setWmsGetMapParams(new URL(getMapUrl), firstLeaf.id, crs, style).toString()

        try {
            const { responseGetMap, redirectHeaders } = await fetchMapTile(url, provider)
            isProviderMapValid =
                isProviderMapValid &&
                (await checkProviderResponse(
                    provider,
                    url,
                    responseGetMap,
                    result,
                    redirectHeaders,
                    checkProviderResponseContentGetMap
                ))
        } catch (error) {
            isProviderMapValid = false
            result.invalid_wms.push(createErrorEntry(provider, url, error, content))
        }
    }

    return isProviderMapValid
}

async function handleWmts(provider, content, result) {
    let isProviderGetTileValid = true
    const capabilities = parseWmtsCapabilities(content, provider)
    const layers = capabilities.getAllExternalLayerObjects(
        LV95,
        1, // opacity
        true, // visible
        false // throw error in case of an error
    )

    const exampleLayer = findFirstLeaf(layers)
    const getTileUrlWithPlaceholders = exampleLayer.urlTemplate
    const params = {
        tileMatrixSet: exampleLayer.tileMatrixSets[0].id,
        tileMatrix: exampleLayer.tileMatrixSets[0].tileMatrix[0].Identifier,
        tileRow: 0,
        tileCol: 0,
        style: exampleLayer.style,
    }

    // The key for the dimensions is not always the same
    const dimensionKey = Object.keys(exampleLayer).find(
        (key) => key.toLowerCase() === 'dimensions' || key.toLowerCase() === 'dimension'
    )

    // Find the default value for each dimension
    const placeHolderParams =
        exampleLayer[dimensionKey]?.reduce((acc, curr) => {
            // Find the key for the default value
            const defaultKey = Object.keys(curr).find((key) => key.toLowerCase() === 'default')
            // Find the key for the identifier
            const identifierKey = Object.keys(curr).find(
                (key) => key.toLowerCase() === 'identifier' || key.toLowerCase() === 'id'
            )
            if (curr[defaultKey]) {
                acc[curr[identifierKey]] = curr[defaultKey]
            }
            return acc
        }, params) || params

    let getTileUrl
    try {
        getTileUrl = replaceUrlPlaceholders(getTileUrlWithPlaceholders, placeHolderParams)
        const { response, redirectHeaders } = await fetchMapTile(getTileUrl, provider)
        isProviderGetTileValid = await checkProviderResponse(
            provider,
            getTileUrl,
            response,
            result,
            redirectHeaders,
            checkProviderResponseContentGetMap
        )
    } catch (error) {
        isProviderGetTileValid = false
        result.invalid_wmts.push(createErrorEntry(provider, getTileUrl, error, content))
    }

    return isProviderGetTileValid
}

async function fetchMapTile(url, provider) {
    let redirectHeaders = []
    const response = await axios.get(url, {
        headers: requestHeaders,
        timeout: EXTERNAL_SERVER_TIMEOUT,
        responseType: 'arraybuffer',
        beforeRedirect: (options_, response) => {
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

function createErrorEntry(provider, url, error, content) {
    return {
        provider,
        url,
        error: `${error}`,
        content: content.slice(0, SIZE_OF_CONTENT_DISPLAY),
    }
}

/**
 * Replace placeholders in a URL template with values from a params object
 *
 * @param {string} urlTemplate URL template with placeholders
 * @param {Object} params Object with placeholder values
 * @returns {string} URL with placeholders replaced
 * @throws {Error} If a placeholder is missing in the params object
 */
function replaceUrlPlaceholders(urlTemplate, params) {
    const normalizedParams = Object.entries(params).reduce((acc, [key, _]) => {
        acc[key.toLowerCase()] = params[key]
        return acc
    }, {})
    return urlTemplate.replace(/{(\w+)}/g, (_, key) => {
        const lowerKey = key.toLowerCase()
        // eslint-disable-next-line no-prototype-builtins
        if (normalizedParams.hasOwnProperty(lowerKey)) {
            return normalizedParams[lowerKey]
        } else {
            throw new Error(`Missing value for placeholder: ${key}`)
        }
    })
}

/**
 * Find the first leaf layer in a layer tree
 *
 * @param {Array} layers Array of layers
 * @returns {Object} First leaf layer
 */
function findFirstLeaf(layers) {
    if (!layers || layers.length === 0) {
        return null
    }

    for (const layer of layers) {
        if (!layer.layers || layer.layers.length === 0) {
            return layer
        }
        const leaf = findFirstLeaf(layer.layers)
        if (leaf) {
            return leaf
        }
    }

    return null
}

async function checkProvider(provider, result) {
    const url = guessExternalLayerUrl(provider, 'en').toString()
    let capabilitiesResponse
    const redirectHeaders = []
    try {
        capabilitiesResponse = await axios.get(url, {
            headers: requestHeaders,
            beforeRedirect: (options_, response) => {
                redirectHeaders.push(response.headers)
            },
            timeout: EXTERNAL_SERVER_TIMEOUT,
        })
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(`Provider ${provider} is not accessible: ${error}`)
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

async function checkProviderResponse(
    provider,
    url,
    response,
    result,
    redirectHeaders,
    checkContentFnc
) {
    if (![200, 201].includes(response.status)) {
        console.error(`Provider ${provider} is not valid: status=${response.status}`)
        result.invalid_providers.push({
            provider: provider,
            url: url,
            status: response.status,
        })
    } else if (!response.headers.has('access-control-allow-origin')) {
        console.error(
            `Provider ${provider} does not support CORS: status=${response.status}, ` +
                `missing access-control-allow-origin header`
        )
        result.invalid_cors.push({
            provider: provider,
            url: url,
            status: response.status,
            headers: response.headers.toJSON(),
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
            response.headers.get('access-control-allow-origin').toString()?.trim()
        )
    ) {
        console.error(
            `Provider ${provider} does not have geoadmin in its CORS: status=${
                response.status
            }, Access-Control-Allow-Origin=${response.headers.get('access-control-allow-origin')}`
        )
        result.invalid_cors.push({
            provider: provider,
            url: url,
            status: response.status,
            headers: response.headers.toJSON(),
        })
    } else if (await checkContentFnc(provider, url, response, result)) {
        console.log(`Provider ${provider} is OK`)
        return true
    }
    return false
}

function checkProviderResponseContent(provider, url, response, result) {
    const content = response.data
    const parseCapabilities = (isCapFn, parseFn, type, result, resultArray) => {
        if (!isCapFn(content)) {
            return false
        }

        try {
            const capabilities = parseFn(content, url)
            const layers = capabilities.getAllExternalLayerObjects(
                LV95,
                1, // opacity
                true, // visible
                false // throw Error in case of error
            )

            if (layers.length === 0) {
                throw new Error(`No valid ${type} layers found`)
            }
        } catch (error) {
            console.error(`Invalid provider ${provider}, ${type} get Cap parsing failed: ${error}`)
            result[resultArray].push({
                provider,
                url,
                error: `${error}`,
                content: content.slice(0, SIZE_OF_CONTENT_DISPLAY),
            })
            return false
        }
        return true
    }
    if (
        parseCapabilities(isWmsGetCap, parseWmsCapabilities, 'WMS', result, 'invalid_wms') ||
        parseCapabilities(isWmtsGetCap, parseWmtsCapabilities, 'WMTS', result, 'invalid_wmts')
    ) {
        return true
    }

    console.error(`Invalid provider ${url}; file type not recognized`)
    result.invalid_content.push({
        provider,
        url,
        content: content.slice(0, SIZE_OF_CONTENT_DISPLAY),
    })
    return false
}

async function checkProviderResponseContentGetMap(provider, url, response, result) {
    const content = Buffer.from(response.data)
    let isValid = false
    try {
        // Check if the content is a valid image
        await sharp(content).metadata()
        isValid = true
    } catch (error) {
        if (isWmsUrl(url)) {
            console.error(
                `Invalid provider ${provider}, WMS get Map content parsing failed: ${error}`
            )
            result.invalid_wms.push({
                provider: provider,
                url: url,
                error: `${error}`,
            })
        } else if (isWmtsUrl(url)) {
            console.error(
                `Invalid provider ${provider}, WMTS get Tiles content parsing failed: ${error}`
            )
            result.invalid_wmts.push({
                provider: provider,
                url: url,
                error: `${error}`,
            })
        }
    }

    return isValid
}

async function checkProviders(providers, result) {
    return Promise.all(providers.map(async (provider) => checkProvider(provider, result)))
}

async function writeResult(result) {
    const resultsFolder = 'scripts/check-layer-providers-results'
    let prefix = ''
    if (options.datetime) {
        prefix = `${new Date().toISOString()}_`
    }
    let valid_providers_file = `${resultsFolder}/${prefix}valid_providers.json`
    if (options.inplace) {
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

async function main() {
    const result = {
        valid_providers: [],
        invalid_providers: [],
        invalid_cors: [],
        invalid_wms: [],
        invalid_wmts: [],
        invalid_content: [],
    }
    setupAxiosRetry()

    let providers = []
    if (options.url) {
        providers = [options.url]
    } else {
        providers = JSON.parse(await fs.readFile(options.input, { encoding: 'utf-8' }))
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
        console.error(`Failed to write results: ${error}`)
    }
    return
}

main().then(() => exit())
