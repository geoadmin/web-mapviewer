import type { RouteLocationNormalizedGeneric } from 'vue-router'

import type { Topic } from '@/api/topics.api'

import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/UrlParamConfig.class'
import { getDefaultValidationResponse } from '@/router/storeSync/validation'
import { TopicsStoreActions } from '@/store/actions'
import useTopicsStore from '@/store/modules/topics.store'

const topicParamConfig = new UrlParamConfig<string>({
    urlParamName: 'topic',
    actionsToWatch: [TopicsStoreActions.ChangeTopic],
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
                    .config.map((topic: Topic) => topic.id)
                    .includes(queryValue),
            'topic'
        ),
})

export default topicParamConfig
