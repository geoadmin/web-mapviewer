import { getStandardValidationResponse } from '@/api/errorQueues.api'
import { DEFAULT_PROJECTION } from '@/config/map.config'
import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import { SUPPORTED_LANG } from '@/modules/i18n'
import createBaseUrlOverrideParamConfig from '@/router/storeSync/BaseUrlOverrideParamConfig.class.js'
import CameraParamConfig from '@/router/storeSync/CameraParamConfig.class'
import CompareSliderParamConfig from '@/router/storeSync/CompareSliderParamConfig.class'
import CrossHairParamConfig from '@/router/storeSync/CrossHairParamConfig.class'
import LayerParamConfig from '@/router/storeSync/LayerParamConfig.class'
import PositionParamConfig from '@/router/storeSync/PositionParamConfig.class'
import SearchParamConfig from '@/router/storeSync/SearchParamConfig.class'
import SimpleUrlParamConfig from '@/router/storeSync/SimpleUrlParamConfig.class'
import ZoomParamConfig from '@/router/storeSync/ZoomParamConfig.class'
import { FeatureInfoPositions } from '@/store/modules/ui.store.js'
import allCoordinateSystems from '@/utils/coordinates/coordinateSystems'

import TimeSliderParamConfig from './TimeSliderParamConfig.class'

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
        validateUrlInput: (store, query) =>
            getStandardValidationResponse(query, SUPPORTED_LANG.includes(query)),
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
        validateUrlInput: (store, query) =>
            getStandardValidationResponse(
                query,
                allCoordinateSystems.map((cs) => cs.epsgNumber).includes(query)
            ),
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
        dispatchValueName: 'bgLayerId',
        extractValueFromStore: (store) => {
            const backgroundLayer = store.state.layers.currentBackgroundLayerId
            // if background layer is null (no background) we write 'void' in the URL
            if (backgroundLayer === null) {
                return 'void'
            }
            return backgroundLayer
        },
        keepInUrlWhenDefault: true,
        valueType: String,
        validateUrlInput: (store, query) =>
            // in cypress, the backgroundLayers is undefined, so we skip this check

            getStandardValidationResponse(
                query,
                IS_TESTING_WITH_CYPRESS ||
                    store.state.layers.backgroundLayers?.map((layer) => layer.id).includes(query)
            ),
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
        validateUrlInput: (store, query) =>
            getStandardValidationResponse(
                query,
                store.state.topics.config.map((topic) => topic.id).includes(query)
            ),
    }),
    new SearchParamConfig(),
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
        validateUrlInput: (store, query) =>
            getStandardValidationResponse(
                query,
                Object.values(FeatureInfoPositions).includes(query)
            ),
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
        validateUrlInput: null,
    }),
    new TimeSliderParamConfig(),
    createBaseUrlOverrideParamConfig({ urlParamName: 'wms_url', baseUrlPropertyName: 'wms' }),
    createBaseUrlOverrideParamConfig({ urlParamName: 'wmts_url', baseUrlPropertyName: 'wmts' }),
    createBaseUrlOverrideParamConfig({ urlParamName: 'api_url', baseUrlPropertyName: 'api3' }),
]

export default storeSyncConfig
