import type { UrlParamConfigTypes } from '@/store/plugins/storeSync/UrlParamConfig.class'

import createBaseUrlOverrideParamConfig from '@/store/plugins/storeSync/params/baseUrl.param'
import backgroundLayerParamConfig from '@/store/plugins/storeSync/params/bgLayer.param'
import cameraParam from '@/store/plugins/storeSync/params/camera.param'
import catalogNodesParamConfig from '@/store/plugins/storeSync/params/catalogNodes.param'
import centerParamConfig from '@/store/plugins/storeSync/params/center.param'
import cesiumParamConfig from '@/store/plugins/storeSync/params/cesium.param'
import compareRationParamConfig from '@/store/plugins/storeSync/params/compareRatio.param'
import crosshairParamConfig from '@/store/plugins/storeSync/params/crosshair.param'
import featureInfoParamConfig from '@/store/plugins/storeSync/params/featureInfo.param'
import geolocationParamConfig from '@/store/plugins/storeSync/params/geolocation.param'
import hideEmbedUIParam from '@/store/plugins/storeSync/params/hideEmbedUI.param'
import langParamConfig from '@/store/plugins/storeSync/params/lang.param'
import layersParam from '@/store/plugins/storeSync/params/layers.param'
import noSimpleZoomParamConfig from '@/store/plugins/storeSync/params/noSimpleZoom.param'
import printConfigParam from '@/store/plugins/storeSync/params/printConfig.param'
import projectionParamConfig from '@/store/plugins/storeSync/params/projection.param'
import swisssearchParamConfig from '@/store/plugins/storeSync/params/swisssearch.param'
import swisssearchAutoSelectParam from '@/store/plugins/storeSync/params/swisssearchAutoSelect.param'
import timeSliderParamConfig from '@/store/plugins/storeSync/params/timeSlider.param'
import topicParamConfig from '@/store/plugins/storeSync/params/topic.param'
import zoomParamConfig from '@/store/plugins/storeSync/params/zoom.param'

/**
 * Configuration for all URL parameters of this app that need syncing with the store (and
 * vice-versa)
 */
const storeSyncConfig: UrlParamConfigTypes[] = [
    // SearchAutoSelectConfig should be processed before SearchParamConfig to avoid a bug where the autoselect would not be set
    swisssearchAutoSelectParam,
    langParamConfig,
    noSimpleZoomParamConfig,
    projectionParamConfig,
    // Search should be positioned before position,
    // this will avoid an issue where when the position is not present in the query,
    // it would populate the query with the store value, which could be different from the
    // one we wanted with the Search param. Upon making a second pass through the storeSync router,
    // the center would be set again to the initial store value
    swisssearchParamConfig,
    // Position/center must be processed after the projection param,
    // otherwise the position might be wrongly reprojected at app startup when SR is not equal
    // to the default projection EPSG number
    centerParamConfig,
    cameraParam,
    zoomParamConfig,
    cesiumParamConfig,
    geolocationParamConfig,
    topicParamConfig,
    crosshairParamConfig,
    compareRationParamConfig,
    layersParam,
    // For now, bgLayer must be after layers, as it could cause an issue where it would reload the application
    // without the layers when previewing the embed view to be shared, causing those layers to disappear from the
    // link sharing.
    backgroundLayerParamConfig,
    featureInfoParamConfig,
    catalogNodesParamConfig,
    timeSliderParamConfig,
    printConfigParam,
    hideEmbedUIParam,
    createBaseUrlOverrideParamConfig({ urlParamName: 'wms_url', baseUrlPropertyName: 'wms' }),
    createBaseUrlOverrideParamConfig({ urlParamName: 'wmts_url', baseUrlPropertyName: 'wmts' }),
    createBaseUrlOverrideParamConfig({ urlParamName: 'api_url', baseUrlPropertyName: 'api3' }),
]

export default storeSyncConfig
