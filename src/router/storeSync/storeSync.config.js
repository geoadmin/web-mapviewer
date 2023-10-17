import { DEFAULT_PROJECTION } from '@/config'
import CameraParamConfig from '@/router/storeSync/CameraParamConfig.class'
import CustomDispatchUrlParamConfig from '@/router/storeSync/CustomDispatchUrlParamConfig.class'
import LayerParamConfig from '@/router/storeSync/LayerParamConfig.class'
import PositionParamConfig from '@/router/storeSync/PositionParamConfig.class'
import QueryToStoreOnlyParamConfig from '@/router/storeSync/QueryToStoreOnlyParamConfig.class'
import SimpleUrlParamConfig from '@/router/storeSync/SimpleUrlParamConfig.class'

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
    new PositionParamConfig(),
    new SimpleUrlParamConfig(
        'sr',
        'setProjection',
        'setProjection',
        (store) => store.state.position.projection.epsgNumber,
        false,
        Number,
        DEFAULT_PROJECTION.epsgNumber
    ),
    new SimpleUrlParamConfig(
        'z',
        'setZoom',
        'setZoom',
        (store) => store.state.position.zoom,
        true,
        Number
    ),
    new SimpleUrlParamConfig(
        '3d',
        'setShowIn3d',
        'setShowIn3d',
        (store) => store.state.ui.showIn3d,
        false,
        Boolean,
        false
    ),
    // very important that this is added/defined AFTER the 3D flag param,
    // so that when it is called the 3D param has already been processed (and is correctly set in the query)
    // this will manage lon,lat,z and camera URL params
    new CameraParamConfig(),
    new SimpleUrlParamConfig(
        'geolocation',
        'setGeolocationActive',
        'toggleGeolocation',
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
            }),
        (store) => store.state.search.query,
        false,
        String,
        ''
    ),
    new SimpleUrlParamConfig(
        'crosshair',
        'setCrossHair',
        'setCrossHair',
        (store) => store.state.position.crossHair,
        false,
        String
    ),
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
