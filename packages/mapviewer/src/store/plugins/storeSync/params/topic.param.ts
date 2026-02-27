import type { RouteLocationNormalizedGeneric } from 'vue-router'

import useTopicsStore from '@/store/modules/topics'
import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/store/plugins/storeSync/UrlParamConfig.class'
import { getDefaultValidationResponse } from '@/store/plugins/storeSync/validation'

const topicParamConfig = new UrlParamConfig<string>({
    urlParamName: 'topic',
    actionsToWatch: ['changeTopic'],
    extractValueFromStore: () => useTopicsStore().current,
    setValuesInStore: (_: RouteLocationNormalizedGeneric, queryValue?: string) => {
        if (queryValue) {
            useTopicsStore().changeTopic(queryValue, STORE_DISPATCHER_ROUTER_PLUGIN)
        }
    },
    keepInUrlWhenDefault: true,
    valueType: String,
    defaultValue: 'ech',
    validateUrlInput: (queryValue?: string) =>
        getDefaultValidationResponse(
            queryValue,
            !!queryValue &&
                useTopicsStore()
                    .config.map((topic) => topic.id)
                    .includes(queryValue),
            'topic'
        ),
})

export default topicParamConfig
