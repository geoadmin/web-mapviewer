import { DEFAULT_PROJECTION } from '@/config'
import CameraParamConfig from '@/router/storeSync/CameraParamConfig.class'
import CompareSliderParamConfig from '@/router/storeSync/CompareSliderParamConfig.class'
import CrossHairParamConfig from '@/router/storeSync/CrossHairParamConfig.class'
import LayerParamConfig from '@/router/storeSync/LayerParamConfig.class'
import PositionParamConfig from '@/router/storeSync/PositionParamConfig.class'
import SimpleUrlParamConfig from '@/router/storeSync/SimpleUrlParamConfig.class'
import ZoomParamConfig from '@/router/storeSync/ZoomParamConfig.class'
import { FeatureInfoPositions } from '@/store/modules/ui.store.js'

/**
 * Configuration for all URL parameters of this app that need syncing with the store (and
 * vice-versa)
 *
 * @type Array<AbstractParamConfig>
 */
const storeSyncConfig = [
    new SimpleUrlParamConfig({
        urlParamName: 'lang',
        mutationsToWatch: ['setLang'],
        dispatchName: 'setLang',
        extractValueFromStore: (store) => store.state.i18n.lang,
        keepInUrlWhenDefault: true,
        valueType: String,
    }),
    new SimpleUrlParamConfig({
        urlParamName: 'sr',
        mutationsToWatch: ['setProjection'],
        dispatchName: 'setProjection',
        dispatchValueName: 'projection',
        extractValueFromStore: (store) => store.state.position.projection.epsgNumber,
        keepInUrlWhenDefault: false,
        valueType: Number,
        // Unit tests somehow come to this line without having set DEFAULT_PROJECTION correctly.
        // So as defensive measure for this, we set a "just in case" default hard-coded value.
        defaultValue: DEFAULT_PROJECTION?.epsgNumber ?? 2056,
    }),
    // Position must be processed after the projection param,
    // otherwise the position might be wrongly reprojected at app startup when SR is not equal
    // to the default projection EPSG number
    new PositionParamConfig(),
    new CameraParamConfig(),
    new ZoomParamConfig(),
    new SimpleUrlParamConfig({
        urlParamName: '3d',
        mutationsToWatch: ['set3dActive'],
        dispatchName: 'set3dActive',
        dispatchValueName: 'active',
        extractValueFromStore: (store) => store.state.cesium.active,
        keepInUrlWhenDefault: false,
        valueType: Boolean,
        defaultValue: false,
    }),
    new SimpleUrlParamConfig({
        urlParamName: 'geolocation',
        mutationsToWatch: ['setGeolocationActive'],
        dispatchName: 'setGeolocation',
        dispatchValueName: 'active',
        extractValueFromStore: (store) => store.state.geolocation.active,
        keepInUrlWhenDefault: false,
        valueType: Boolean,
        defaultValue: false,
    }),
    new SimpleUrlParamConfig({
        urlParamName: 'bgLayer',
        mutationsToWatch: ['setBackground'],
        dispatchName: 'setBackground',
        extractValueFromStore: (store) => {
            const backgroundLayer = store.state.layers.currentBackgroundLayer
            // if background layer is null (no background) we write 'void' in the URL
            if (backgroundLayer === null) {
                return 'void'
            }
            return backgroundLayer.id
        },
        keepInUrlWhenDefault: true,
        valueType: String,
    }),
    new SimpleUrlParamConfig({
        urlParamName: 'topic',
        mutationsToWatch: ['changeTopic'],
        dispatchName: 'changeTopic',
        dispatchValueName: 'topicId',
        extractValueFromStore: (store) => store.state.topics.current,
        keepInUrlWhenDefault: true,
        valueType: String,
        defaultValue: null,
    }),
    new SimpleUrlParamConfig({
        urlParamName: 'swisssearch',
        mutationsToWatch: ['setSearchQuery'],
        dispatchName: 'setSearchQuery',
        dispatchValueName: 'query',
        extractValueFromStore: (store) => store.state.search.query,
        keepInUrlWhenDefault: false,
        valueType: String,
        defaultValue: '',
    }),
    new CrossHairParamConfig(),
    new CompareSliderParamConfig(),
    new LayerParamConfig(),
    new SimpleUrlParamConfig({
        urlParamName: 'featureInfo',
        mutationsToWatch: ['setFeatureInfoPosition'],
        dispatchName: 'setFeatureInfoPosition',
        dispatchValueName: 'position',
        extractValueFromStore: (store) => store.state.ui.featureInfoPosition,
        keepInUrlWhenDefault: false,
        valueType: String,
        defaultValue: FeatureInfoPositions.NONE,
    }),
    new SimpleUrlParamConfig({
        urlParamName: 'catalogNodes',
        mutationsToWatch: [
            'setTopicTreeOpenedThemesIds',
            'addTopicTreeOpenedThemeId',
            'removeTopicTreeOpenedThemeId',
        ],
        dispatchName: 'setTopicTreeOpenedThemesIds',
        dispatchValueName: 'themes',
        extractValueFromStore: (store) => store.state.topics.openedTreeThemesIds,
        keepInUrlWhenDefault: false,
        valueType: String,
        defaultValue: '',
    }),
]

export default storeSyncConfig
