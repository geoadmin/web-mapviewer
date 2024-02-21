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
import writeYamlFile from 'write-yaml-file'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import {
    EXTERNAL_SERVER_TIMEOUT,
    parseWmsCapabilities,
    parseWmtsCapabilities,
} from '@/api/layers/layers-external.api'
import {
    guessExternalLayerUrl,
    isWmsGetCap,
    isWmtsGetCap,
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

async function checkProvider(provider, result) {
    const url = guessExternalLayerUrl(provider, 'en').toString()
    try {
        const response = await axios.get(url, {
            headers: {
                Origin: 'https://map.geo.admin.ch',
                Referer: 'https://map.geo.admin.ch',
                'Sec-Fetch-Site': 'cross-site',
            },
            timeout: EXTERNAL_SERVER_TIMEOUT,
        })
        checkProviderResponse(provider, url, response, result)
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(`Provider ${provider} is not accessible: ${error}`)
            result.invalid_providers.push({
                provider: provider,
                url: url,
                status: error.response?.status,
                error: error.message,
            })
        } else {
            throw error
        }
    }
}

function checkProviderResponse(provider, url, response, result) {
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
    } else if (checkProviderResponseContent(provider, url, response, result)) {
        console.log(`Provider ${provider} is OK`)
        result.valid_providers.push(provider)
    }
}

function checkProviderResponseContent(provider, url, response, result) {
    const content = response.data
    let isValid = true

    if (isWmsGetCap(content)) {
        try {
            const capabilities = parseWmsCapabilities(content, url)
            const layers = capabilities.getAllExternalLayerObjects(
                LV95,
                1 /* opacity */,
                true /* visible */,
                false /* throw Error in case of  error */
            )
            if (layers.length === 0) {
                throw new Error(`No valid WMS layers found`)
            }
        } catch (error) {
            isValid = false
            console.error(`Invalid provider ${provider}, WMS get Cap parsing failed: ${error}`)
            result.invalid_wms.push({
                provider: provider,
                url: url,
                error: `${error}`,
                content: content.slice(0, SIZE_OF_CONTENT_DISPLAY),
            })
        }
    } else if (isWmtsGetCap(content)) {
        try {
            const capabilities = parseWmtsCapabilities(content, url)
            const layers = capabilities.getAllExternalLayerObjects(
                LV95,
                1 /* opacity */,
                true /* visible */,
                false /* throw Error in case of  error */
            )
            if (layers.length === 0) {
                throw new Error(`No valid WMTS layers found`)
            }
        } catch (error) {
            isValid = false
            console.error(`Invalid provider ${provider}, WMTS get Cap parsing failed: ${error}`)
            result.invalid_wmts.push({
                provider: provider,
                url: url,
                error: `${error}`,
                content: content.slice(0, SIZE_OF_CONTENT_DISPLAY),
            })
        }
    } else {
        isValid = false
        console.error(`Invalid provider ${url}; file type not recognized`)
        result.invalid_content.push({
            provider: provider,
            url: url,
            content: content.slice(0, SIZE_OF_CONTENT_DISPLAY),
        })
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
