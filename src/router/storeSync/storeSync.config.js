import { DEFAULT_PROJECTION } from '@/config'
import { STORE_DISPATCHER_ROUTER_PLUGIN } from '@/router/storeSync/abstractParamConfig.class'
import CameraParamConfig from '@/router/storeSync/CameraParamConfig.class'
import CrossHairParamConfig from '@/router/storeSync/CrossHairParamConfig.class'
import CustomDispatchUrlParamConfig from '@/router/storeSync/CustomDispatchUrlParamConfig.class'
import LayerParamConfig from '@/router/storeSync/LayerParamConfig.class'
import PositionParamConfig from '@/router/storeSync/PositionParamConfig.class'
import QueryToStoreOnlyParamConfig from '@/router/storeSync/QueryToStoreOnlyParamConfig.class'
import SimpleUrlParamConfig from '@/router/storeSync/SimpleUrlParamConfig.class'
import ZoomParamConfig from '@/router/storeSync/ZoomParamConfig.class.js'

import CompareSliderParamConfig from './CompareSliderParamConfig.class'
/**
 * Configuration for all URL parameters of this app that need syncing with the store (and
 * vice-versa)
 *
 * @type Array<AbstractParamConfig>
 */
const storeSyncConfig = [
    new SimpleUrlParamConfig(
        'lang',
        'setLang',
        'setLang',
        (store) => store.state.i18n.lang,
        true,
        String
    ),
    new SimpleUrlParamConfig(
        'sr',
        'setProjection',
        'setProjection',
        (store) => store.state.position.projection.epsgNumber,
        false,
        Number,
        DEFAULT_PROJECTION.epsgNumber
    ),
    // Position must be processed after the projection param,
    // otherwise the position might be wrongly reprojected at app startup when SR is not equal
    // to the default projection EPSG number
    new PositionParamConfig(),
    new CameraParamConfig(),
    new ZoomParamConfig(),
    new SimpleUrlParamConfig(
        '3d',
        'set3dActive',
        'set3dActive',
        (store) => store.state.cesium.active,
        false,
        Boolean,
        false
    ),
    new SimpleUrlParamConfig(
        'geolocation',
        'setGeolocationActive',
        'setGeolocation',
        (store) => store.state.geolocation.active,
        false,
        Boolean,
        false
    ),
    new SimpleUrlParamConfig(
        'bgLayer',
        'setBackground',
        'setBackground',
        (store) => {
            const backgroundLayer = store.state.layers.currentBackgroundLayer
            // if background layer is null (no background) we write 'void' in the URL
            if (backgroundLayer === null) {
                return 'void'
            }
            return backgroundLayer.getID()
        },
        true,
        String
    ),
    new SimpleUrlParamConfig(
        'topic',
        'changeTopic',
        'setTopicById',
        (store) => store.getters.currentTopicId,
        true,
        String
    ),
    // as the setSearchQuery action requires an object as payload, we need
    // to customize a bit the dispatch to this action (in order to build a correct payload)
    new CustomDispatchUrlParamConfig(
        'swisssearch',
        'setSearchQuery',
        (store, urlValue) =>
            store.dispatch('setSearchQuery', {
                query: urlValue,
                dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
            }),
        (store) => store.state.search.query,
        false,
        String,
        ''
    ),
    new CrossHairParamConfig(),

    new CompareSliderParamConfig(),
    new LayerParamConfig(),
    new SimpleUrlParamConfig(
        'embed',
        'setEmbeddedMode',
        'setEmbeddedMode',
        (store) => store.state.ui.embeddedMode,
        false,
        Boolean,
        false
    ),
    new QueryToStoreOnlyParamConfig(
        'catalogNodes',
        'catalogNodes',
        'setTopicTreeOpenedThemesIds',
        false,
        String
    ),
]

export default storeSyncConfig
