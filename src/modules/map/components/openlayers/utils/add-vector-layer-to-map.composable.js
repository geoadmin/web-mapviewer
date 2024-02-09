import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { toValue, watchEffect } from 'vue'

import useAddLayerToMap from '@/modules/map/components/openlayers/utils/add-layers-to-map.composable'
import { highlightFeatureStyle } from '@/modules/map/components/openlayers/utils/markerStyle'
import { randomIntBetween } from '@/utils/numberUtils'

/**
 * Add a vector layer to the map, and will update its source whenever the feature reference changes.
 *
 * Caveat: it will not update the style!
 *
 * @param {Map} map
 * @param {Readonly<Ref<Number>>} zIndex
 * @param {Readonly<Ref<Feature[]>>} features
 * @param {Function} styleFunction
 */
export default function useVectorLayer(
    map,
    features,
    zIndex = -1,
    styleFunction = highlightFeatureStyle
) {
    const layer = new VectorLayer({
        id: `vector-layer-${randomIntBetween(0, 100000)}`,
        source: new VectorSource({
            features: toValue(features),
        }),
        style: styleFunction,
    })
    useAddLayerToMap(layer, map, zIndex)

    watchEffect(() => {
        layer.getSource().clear()
        layer.getSource().addFeatures(toValue(features))
    })

    return {
        layer,
    }
}
