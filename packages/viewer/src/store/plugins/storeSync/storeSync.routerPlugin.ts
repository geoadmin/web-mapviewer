import type { PiniaPlugin, PiniaPluginContext } from 'pinia'
import type { LocationQuery, RouteLocationNormalizedGeneric } from 'vue-router'

import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { ActionDispatcher } from '@/store/types'

import useShareStore from '@/store/modules/share'
import storeSyncConfig from '@/store/plugins/storeSync/storeSync.config'
import {
    STORE_DISPATCHER_ROUTER_PLUGIN,
    type UrlParamConfigTypes,
} from '@/store/plugins/storeSync/UrlParamConfig.class'

export const FAKE_URL_CALLED_AFTER_ROUTE_CHANGE: string = '/tell-cypress-route-has-changed'
const watchedActions: string[] = [
    ...storeSyncConfig.flatMap((paramConfig: UrlParamConfigTypes) => paramConfig.actionsToWatch),
].filter((actionName: string, index: number, self: string[]) => self.indexOf(actionName) === index)

const isActionNotTriggeredByModule = (args: unknown[]): boolean => {
    // the last argument is the dispatcher
    const dispatcher = args.slice(-1) as unknown as ActionDispatcher
    return dispatcher.name !== STORE_DISPATCHER_ROUTER_PLUGIN.name
}
const isActionWatched = (actionName: string): boolean => watchedActions.includes(actionName)

/**
 * Checks all param in the current route and the store to see if there's a difference in values
 *
 * @returns True if a value is different between the store and the URL
 */
function isRoutePushNeeded(currentRoute: RouteLocationNormalizedGeneric): boolean {
    let aRoutePushIsNeeded = false
    storeSyncConfig.forEach(
        (paramConfig: UrlParamConfigTypes) =>
            aRoutePushIsNeeded ||
            (aRoutePushIsNeeded = paramConfig.valuesAreDifferentBetweenQueryAndStore(
                currentRoute.query
            ))
    )
    return aRoutePushIsNeeded
}

/** Watch for store changes and reflect the changes in the URL query param if needed */
function storeMutationWatcher(
    context: PiniaPluginContext,
    actionName: string,
    actionArgs: unknown[]
): void {
    const { store } = context

    // Ignoring actions that have been triggered by this plugin
    if (isActionNotTriggeredByModule(actionArgs) && isActionWatched(actionName)) {
        log.debug({
            title: 'Router store plugin / storeMutationWatcher',
            titleColor: LogPreDefinedColor.Pink,
            messages: [actionName, 'Current route', store.router.currentRoute.value],
        })

        // if the value in the store differs from the one in the URL
        if (isRoutePushNeeded(store.router.currentRoute.value)) {
            const query: LocationQuery = {}
            // extracting all param from the store
            storeSyncConfig.forEach((paramConfig: UrlParamConfigTypes) =>
                paramConfig.populateQueryWithStoreValue(query)
            )
            log.info({
                title: 'Router store plugin / storeMutationWatcher',
                titleColor: LogPreDefinedColor.Pink,
                messages: [
                    'Store has changed, rerouting app to query',
                    query,
                    store.router.currentRoute.value.name,
                ],
            })
            store.router
                .push({
                    name: store.router.currentRoute.value.name,
                    query,
                })
                .catch((error: unknown) => {
                    log.error({
                        title: 'Router store plugin / storeMutationWatcher',
                        titleColor: LogPreDefinedColor.Pink,
                        messages: ['Error while routing to', query, error],
                    })
                })

            const shareStore = useShareStore()
            // if the short linked version of the URL is already defined,
            // and the share menu opened, we must close the share menu and
            // reset the shortlink
            if (shareStore.shortLink) {
                shareStore.closeShareMenuAndRemoveShortLinks(STORE_DISPATCHER_ROUTER_PLUGIN)
            }
        }
    }
}

/**
 * Plugin that syncs what is in the URL with what is in the store (and vice-versa). It also reacts
 * to on-the-fly changes in the URL and commit the changes to the store.
 *
 * NOTE: This plugin subscribe on store actions only when on the MapView because we don't want to
 * change the url when the app is not on the MapView. The store is also only updated with the query
 * parameter when on the MapView.
 */
const storeSyncRouterPlugin: PiniaPlugin = (context: PiniaPluginContext): void => {
    const { store } = context

    store.$onAction(({ name, after, args }) => {
        after(() => storeMutationWatcher(context, name, args))
    })
}

export default storeSyncRouterPlugin
