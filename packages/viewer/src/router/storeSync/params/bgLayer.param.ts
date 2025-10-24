import type { RouteLocationNormalizedGeneric } from 'vue-router'

import UrlParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/UrlParamConfig.class'
import { getDefaultValidationResponse } from '@/router/storeSync/validation'
import { LayerStoreActions } from '@/store/actions'
import useLayersStore from '@/store/modules/layers'

const backgroundLayerParamConfig = new UrlParamConfig<string>({
    urlParamName: 'bgLayer',
    actionsToWatch: [LayerStoreActions.SetBackground],
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
                    useLayersStore().backgroundLayers?.some((layer) => layer.id == queryValue)),
            'bgLayer'
        ),
})

export default backgroundLayerParamConfig
