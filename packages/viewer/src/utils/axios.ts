import log, { LogPreDefinedColor } from '@swissgeo/log'
import axios, { type AxiosResponse } from 'axios'

interface LoadWithAbortControllerResponse<ResponseType> {
    controller: AbortController
    pendingRequest: Promise<AxiosResponse<ResponseType>>
}

/**
 * Sends an HTTP GET request to a specified URL using Axios and supports request cancellation
 * through an AbortController.
 *
 * @param url - The URL to send the GET request to.
 * @param [controller] - Optional AbortController instance to manage request cancellation. If not
 *   provided, a new AbortController instance is created.
 * @returns An object containing the pending Axios GET request and the AbortController instance used
 *   for the request.
 */
export function getWithAbortController<ResponseType>(
    url: string,
    controller?: AbortController
): LoadWithAbortControllerResponse<ResponseType> {
    const controllerToUse = controller ?? new AbortController()
    try {
        return {
            pendingRequest: axios.get<ResponseType>(url, { signal: controllerToUse.signal }),
            controller: controllerToUse,
        }
    } catch (error) {
        log.error({
            title: 'Axios utils / getWithAbortController',
            titleColor: LogPreDefinedColor.Indigo,
            messages: [`Error while loading URL ${url}`, error],
        })
        throw error
    }
}
