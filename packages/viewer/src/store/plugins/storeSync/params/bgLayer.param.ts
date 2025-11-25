import type { RouteLocationNormalizedGeneric } from 'vue-router'

import useLayersStore from '@/store/modules/layers'
import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/store/plugins/storeSync/UrlParamConfig.class'
import { getDefaultValidationResponse } from '@/store/plugins/storeSync/validation'

const backgroundLayerParamConfig = new UrlParamConfig<string>({
    urlParamName: 'bgLayer',
    actionsToWatch: ['setBackground'],
    extractValueFromStore: () => {
        const layersStore = useLayersStore()
        const backgroundLayer = layersStore.currentBackgroundLayerId

        // if background layer is undefined (no background) we write 'void' in the URL
        if (!backgroundLayer) {
            return 'void'
        }
        return backgroundLayer
    },
    setValuesInStore: (_: RouteLocationNormalizedGeneric, urlParamValue?: string) => {
        const layersStore = useLayersStore()
        if (urlParamValue && urlParamValue !== 'void') {
            layersStore.setBackground(urlParamValue, STORE_DISPATCHER_ROUTER_PLUGIN)
        } else {
            layersStore.setBackground(undefined, STORE_DISPATCHER_ROUTER_PLUGIN)
        }
    },
    keepInUrlWhenDefault: true,
    valueType: String,
    validateUrlInput: (queryValue?: string) =>
        getDefaultValidationResponse(
            queryValue,
            !!queryValue &&
                (queryValue === 'void' ||
                    useLayersStore().backgroundLayers?.some((layer) => layer.id === queryValue)),
            'bgLayer'
        ),
})

export default backgroundLayerParamConfig
