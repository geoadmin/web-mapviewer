import type { RouteLocationNormalizedGeneric } from 'vue-router'

import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/UrlParamConfig.class'
import useTopicsStore from '@/store/modules/topics'

const catalogNodesParamConfig = new UrlParamConfig<string>({
    urlParamName: 'catalogNodes',
    actionsToWatch: [
        'setTopicTreeOpenedThemesIds',
        'addTopicTreeOpenedThemeId',
        'removeTopicTreeOpenedThemeId',
    ],
    extractValueFromStore: () => {
        const topicStore = useTopicsStore()
        if (topicStore.openedTreeThemesIds.length > 0) {
            return topicStore.openedTreeThemesIds.join(',')
        }
        return undefined
    },
    setValuesInStore: (_: RouteLocationNormalizedGeneric, urlParamValue?: string) => {
        const topicStore = useTopicsStore()
        if (urlParamValue) {
            topicStore.setTopicTreeOpenedThemesIds(urlParamValue, STORE_DISPATCHER_ROUTER_PLUGIN)
        } else {
            topicStore.setTopicTreeOpenedThemesIds([], STORE_DISPATCHER_ROUTER_PLUGIN)
        }
    },
    keepInUrlWhenDefault: false,
    valueType: String,
})

export default catalogNodesParamConfig
