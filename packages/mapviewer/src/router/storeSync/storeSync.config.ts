import { allCoordinateSystems } from '@geoadmin/coordinates'

import { DEFAULT_PROJECTION } from '@/config/map.config.ts'
import { SUPPORTED_LANG } from '@/modules/i18n'
import CompareSliderParamConfig from '@/router/storeSync/CompareSliderParamConfig.class'
import CrossHairParamConfig from '@/router/storeSync/CrossHairParamConfig.class'
import NoSimpleZoomParamConfig from '@/router/storeSync/NoSimpleZoomParamConfig.class'
import createBaseUrlOverrideParamConfig from '@/router/storeSync/params/baseUrl.param'
import cameraParam from '@/router/storeSync/params/camera.param'
import hideEmbedUIParam from '@/router/storeSync/params/hideEmbedUI.param'
import layersParam from '@/router/storeSync/params/layers.param'
import printConfigParam from '@/router/storeSync/params/printConfig.param'
import zoomParamConfig from '@/router/storeSync/params/zoom.param'
import PositionParamConfig from '@/router/storeSync/PositionParamConfig.class'
import SearchAutoSelectConfig from '@/router/storeSync/SearchAutoSelectConfig.class'
import SearchParamConfig from '@/router/storeSync/SearchParamConfig.class'
import TimeSliderParamConfig from '@/router/storeSync/TimeSliderParamConfig.class'
import UrlParamConfig from '@/router/storeSync/UrlParamConfig.class'
import { getDefaultValidationResponse } from '@/router/storeSync/validation'
import { FeatureInfoPositions } from '@/store/modules/ui.store'

/**
 * Configuration for all URL parameters of this app that need syncing with the store (and
 * vice-versa)
 */
const storeSyncConfig: UrlParamConfig<any, any>[] = [
    // SearchAutoSelectConfig should be processed before SearchParamConfig to avoid a bug where the autoselect would not be set
    new SearchAutoSelectConfig(),
    new UrlParamConfig({
        urlParamName: 'lang',
        mutationsToWatch: ['setLang'],
        dispatchName: 'setLang',
        extractValueFromStore: (store) => store.state.i18n.lang,
        keepInUrlWhenDefault: true,
        valueType: String,
        validateUrlInput: (store, query) =>
            getDefaultValidationResponse(
                query,
                SUPPORTED_LANG.includes(query.toLowerCase()),
                'lang'
            ),
    }),
    new NoSimpleZoomParamConfig(),
    new UrlParamConfig({
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
            getDefaultValidationResponse(
                query,
                allCoordinateSystems.map((cs) => cs.epsgNumber).includes(Number(query)),
                'sr'
            ),
    }),
    // Search should be positioned before position,
    // this will avoid an issue where when the position is not present in the query,
    // it would populate the query with the store value, which could be different from the
    // one we wanted with the Search param. Upon making a second pass through the storeSync router,
    // the center would be set again to the initial store value
    new SearchParamConfig(),
    // Position must be processed after the projection param,
    // otherwise the position might be wrongly reprojected at app startup when SR is not equal
    // to the default projection EPSG number
    new PositionParamConfig(),
    cameraParam,
    zoomParamConfig,
    new UrlParamConfig({
        urlParamName: '3d',
        mutationsToWatch: ['set3dActive'],
        dispatchName: 'set3dActive',
        dispatchValueName: 'active',
        extractValueFromStore: (store) => store.state.cesium.active,
        keepInUrlWhenDefault: false,
        valueType: Boolean,
        defaultValue: false,
    }),
    new UrlParamConfig({
        urlParamName: 'geolocation',
        mutationsToWatch: ['setGeolocationActive'],
        dispatchName: 'setGeolocation',
        dispatchValueName: 'active',
        extractValueFromStore: (store) => store.state.geolocation.active,
        keepInUrlWhenDefault: false,
        valueType: Boolean,
        defaultValue: false,
    }),
    new UrlParamConfig({
        urlParamName: 'topic',
        mutationsToWatch: ['changeTopic'],
        dispatchName: 'changeTopic',
        dispatchValueName: 'topicId',
        extractValueFromStore: (store) => store.state.topics.current,
        keepInUrlWhenDefault: true,
        valueType: String,
        defaultValue: null,
        validateUrlInput: (store, query) =>
            getDefaultValidationResponse(
                query,
                store.state.topics.config.map((topic) => topic.id).includes(query),
                'topic'
            ),
    }),
    new CrossHairParamConfig(),
    new CompareSliderParamConfig(),
    layersParam,
    // For now, bgLayer must be after layers, as it could cause an issue where it would reload the application
    // without the layers when previewing the embed view to be shared, causing those layers to disappear from the
    // link sharing.
    new UrlParamConfig({
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
            getDefaultValidationResponse(
                query,
                query === 'void' ||
                    store.getters.backgroundLayers?.map((layer) => layer.id).includes(query),
                'bgLayer'
            ),
    }),
    new UrlParamConfig({
        urlParamName: 'featureInfo',
        mutationsToWatch: ['setFeatureInfoPosition'],
        dispatchName: 'setFeatureInfoPosition',
        dispatchValueName: 'position',
        extractValueFromStore: (store) => store.state.ui.featureInfoPosition,
        keepInUrlWhenDefault: false,
        valueType: String,
        defaultValue: FeatureInfoPositions.NONE,
        validateUrlInput: (store, query) =>
            getDefaultValidationResponse(
                query,
                Object.values(FeatureInfoPositions).filter((featureInfoPosition) => {
                    return (
                        featureInfoPosition.localeCompare(query, undefined, {
                            sensitivity: 'accent',
                        }) === 0
                    )
                }).length === 1,
                'featureInfo'
            ),
    }),
    new UrlParamConfig({
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
    printConfigParam,
    hideEmbedUIParam,
    createBaseUrlOverrideParamConfig({ urlParamName: 'wms_url', baseUrlPropertyName: 'wms' }),
    createBaseUrlOverrideParamConfig({ urlParamName: 'wmts_url', baseUrlPropertyName: 'wmts' }),
    createBaseUrlOverrideParamConfig({ urlParamName: 'api_url', baseUrlPropertyName: 'api3' }),
]

export default storeSyncConfig
