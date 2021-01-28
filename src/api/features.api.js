import { API_BASE_URL } from '@/config'
import axios from 'axios'

export class Feature {
  /**
   * @param {WMSLayer|WMTSLayer|GeoJsonLayer|AggregateLayer} layer the layer in which this feature belongs
   * @param {Number|String} id the unique feature ID in the layer it is part of
   * @param {String} htmlPopup HTML code for this feature's popup (or tooltip)
   * @param {Array<Number>} coordinate [x,y] coordinate in EPSG:3857
   * @param {Array<Number>} extent extent of the feature expressed with two point, bottom left and top right, in EPSG:3857
   * @param {Object} geometry GeoJSON geometry (if exists)
   */
  constructor(layer, id, htmlPopup, coordinate, extent, geometry = null) {
    this.layer = layer
    this.id = id
    this.htmlPopup = htmlPopup
    this.coordinate = coordinate
    this.extent = extent
    this.geometry = geometry
  }

  /**
   * @return {LayerTypes}
   */
  getLayerType() {
    return this.layer && this.layer.type
  }
}

/**
 * Asks the backend for identification of features at the coordinates for the given layer
 * @param {WMSLayer|WMTSLayer|GeoJsonLayer|AggregateLayer} layer
 * @param {Array<Number>} coordinate coordinate where to identify feature in EPSG:3857
 * @param {Array<Number>} mapExtent
 * @param {Number} screenWidth
 * @param {Number} screenHeight
 * @param {String} lang
 * @return {Promise<Array<Feature>>}
 */
export const identify = (layer, coordinate, mapExtent, screenWidth, screenHeight, lang) => {
  return new Promise((resolve, reject) => {
    if (!layer || !layer.id) {
      console.error('Invalid layer', layer)
      reject('Needs a valid layer with an ID')
    }
    if (!Array.isArray(coordinate) || coordinate.length !== 2) {
      console.error('Invalid coordinate', coordinate)
      reject('Needs a valid coordinate to run identification')
    }
    if (!Array.isArray(mapExtent) || mapExtent.length !== 4) {
      console.error('Invalid extent', mapExtent)
      reject('Needs a valid map extent to run identification')
    }
    if (screenWidth <= 0 || screenHeight <= 0) {
      console.error('Invalid screen size', screenWidth, screenHeight)
      reject('Needs valid screen width and height to run identification')
    }
    axios
      .get(
        `${API_BASE_URL}/rest/services/${layer.getTopicForIdentifyAndTooltipRequests()}/MapServer/identify`,
        {
          params: {
            layers: `all:${layer.id}`,
            sr: 3857, // EPSG:3857
            geometry: coordinate.join(','),
            geometryFormat: 'geojson',
            geometryType: 'esriGeometryPoint',
            imageDisplay: `${screenWidth},${screenHeight},96`,
            mapExtent: mapExtent.join(','),
            limit: 10,
            tolerance: 10,
            returnGeometry: true,
            lang: lang,
          },
        }
      )
      .then((response) => {
        const featureRequests = []
        if (response.data && response.data.results && response.data.results.length > 0) {
          response.data.results.forEach((result) => {
            featureRequests.push(getFeature(layer, result.featureId, lang))
          })
          Promise.all(featureRequests)
            .then((values) => {
              console.debug('feature received', values)
              resolve(values)
            })
            .catch((error) => {
              console.error("Wasn't able to get feature", error)
            })
        } else {
          resolve([])
        }
      })
  })
}

/**
 * @param {WMSLayer|WMTSLayer|GeoJsonLayer|AggregateLayer} layer the layer from which the feature is part of
 * @param {String|Number} featureID the feature ID in the BGDI
 * @param {String} lang the language for the HTML popup
 * @return {Promise<Feature>}
 */
const getFeature = (layer, featureID, lang = 'en') => {
  return new Promise((resolve, reject) => {
    if (!layer || !layer.id) {
      reject('Needs a valid layer with an ID')
    }
    if (!featureID) {
      reject('Needs a valid feature ID')
    }
    axios
      .all([
        axios.get(
          `${API_BASE_URL}/rest/services/${layer.getTopicForIdentifyAndTooltipRequests()}/MapServer/${
            layer.id
          }/${featureID}`,
          {
            params: {
              sr: 3857,
              geometryFormat: 'geojson',
            },
          }
        ),
        axios.get(
          `${API_BASE_URL}/rest/services/${layer.getTopicForIdentifyAndTooltipRequests()}/MapServer/${
            layer.id
          }/${featureID}/htmlPopup?lang=${lang}&sr=3857`
        ),
      ])
      .then((responses) => {
        const featureMetadata = responses[0].data.feature
        const featureHtmlPopup = responses[1].data
        const featureGeoJSONGeometry = featureMetadata.geometry
        const featureExtent = [...featureMetadata.bbox]
        // if feature's geometry is a point, we grab it as coordinate. Otherwise we calculate the center of the bbox
        let featureCoordinate = []
        let isFeatureGeometryAPoint = false
        // if GeoJSON type is Point, we grab the coordinates and don't store any geom (hence the flag isFeatureGeometryAPoint)
        if (featureGeoJSONGeometry.type === 'Point') {
          featureCoordinate = featureGeoJSONGeometry.coordinates
          isFeatureGeometryAPoint = true
        } else if (
          featureGeoJSONGeometry.type === 'MultiPoint' &&
          featureGeoJSONGeometry.coordinates.length === 1
        ) {
          // or if the GeoJSON type is MultiPoint, but there's only one point in the array, we grab it and don't store any geom
          featureCoordinate = featureGeoJSONGeometry.coordinates[0]
          isFeatureGeometryAPoint = true
        } else {
          featureCoordinate = [
            (featureMetadata.bbox[0] + featureMetadata.bbox[2]) / 2,
            (featureMetadata.bbox[1] + featureMetadata.bbox[3]) / 2,
          ]
        }
        resolve(
          new Feature(
            layer,
            featureID,
            featureHtmlPopup,
            featureCoordinate,
            featureExtent,
            isFeatureGeometryAPoint ? null : featureGeoJSONGeometry
          )
        )
      })
      .catch((error) => {
        console.error('Error while requesting a feature to the backend', layer, featureID, error)
        reject(error)
      })
  })
}

export default getFeature
