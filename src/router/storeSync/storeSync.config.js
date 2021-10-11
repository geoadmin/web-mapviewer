import SimpleUrlParamConfig from '@/router/storeSync/SimpleUrlParamConfig.class'
import LayerParamConfig from '@/router/storeSync/LayerParamConfig.class'
import AdminLayerParamConfig from '@/router/storeSync/AdminLayerParamConfig.class'
import CustomDispatchUrlParamConfig from '@/router/storeSync/CustomDispatchUrlParamConfig.class'

/**
 * Configuration for all URL parameters of this app that need syncing with the store (and vice-versa)
 *
 * @type Array<AbstractParamConfig>
 */
const storeSyncConfig = [
    new SimpleUrlParamConfig(
        'lat',
        'setCenter',
        'setLatitude',
        (store) => store.getters.centerEpsg4326[1],
        true,
        Number
    ),
    new SimpleUrlParamConfig(
        'lon',
        'setCenter',
        'setLongitude',
        (store) => store.getters.centerEpsg4326[0],
        true,
        Number
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
        'geolocation',
        'setGeolocationActive',
        'toggleGeolocation',
        (store) => store.state.geolocation.active,
        false,
        Boolean
    ),
    new SimpleUrlParamConfig(
        'bgLayer',
        'setBackground',
        'setBackground',
        (store) => {
            const backgroundLayerId = store.state.layers.backgroundLayerId
            // if background layer ID is null (no background) we write 'void' in the URL
            if (backgroundLayerId === null) {
                return 'void'
            }
            return backgroundLayerId
        },
        false,
        String
    ),
    new SimpleUrlParamConfig(
        'topic',
        'changeTopic',
        'setTopicById',
        (store) => store.getters.currentTopicId,
        false,
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
        String
    ),
    new LayerParamConfig(),
    new AdminLayerParamConfig(),
]

export default storeSyncConfig
