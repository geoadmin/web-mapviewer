import { GeoJsonDataSource, KmlDataSource } from 'cesium'
import { onBeforeUnmount, toValue, watch } from 'vue'

import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import log from '@/utils/logging'

/**
 * Function that will be called on each entity when load to let each "flavor" of data style the
 * entities accordingly.
 *
 * @callback styleEntity
 * @param {Entity} entity One entity loaded from the data source
 * @param {Number} opacity The current opacity of the group (of the layer)
 */

/**
 * @param {Viewer} viewer Cesium viewer
 * @param {Promise<GeoJsonDataSource> | Promise<KmlDataSource> | Promise<GpxDataSource>} loadDataSource
 *   A promise that will resolve on the loaded data source
 * @param {styleEntity} styleEntity Callback called on each entity after loading and after each
 *   opacity change
 * @param {Ref<Number>} opacity Reference to the current opacity of the layer
 * @param {Ref<string>} layerId ID of the layer to be applied to the data source after loading (like
 *   GeoJSON style/data, GPX or KML data)
 */
export default function useAddDataSourceLayer(
    viewer,
    loadDataSource,
    styleEntity,
    opacity,
    layerId
) {
    let dataSource = null

    async function refreshDataSource(loadingDataSource) {
        log.debug(`[Cesium] refreshing data source layer ${toValue(layerId)}`)
        if (dataSource) {
            viewer.dataSources.remove(dataSource)
            viewer.scene.requestRender()
        }
        try {
            dataSource = await loadingDataSource
            if (
                (dataSource instanceof GeoJsonDataSource || dataSource instanceof KmlDataSource) &&
                toValue(layerId)
            ) {
                // Using the name property to carry the layer ID (there isn't a flexible property bag on this type of objects).
                // We can't set the name with a GPX data source, as it is automatically read from the file itself (the property is a getter only)
                dataSource.name = toValue(layerId)
            }
            dataSource.entities.values.forEach((entity) => {
                entity.layerId = toValue(layerId)
                styleEntity(entity, toValue(opacity) ?? 1.0)
            })

            // need to wait for terrain loaded otherwise primitives will be placed wrong (under the terrain)
            if (viewer.scene.globe.tilesLoaded || IS_TESTING_WITH_CYPRESS) {
                viewer.dataSources.add(dataSource).then((addedDataSource) => {
                    dataSource = addedDataSource
                    viewer.scene.requestRender()
                })
            } else {
                const removeTileLoadProgressEventListener =
                    viewer.scene.globe.tileLoadProgressEvent.addEventListener(
                        async (queueLength) => {
                            if (viewer.scene.globe.tilesLoaded && queueLength === 0) {
                                dataSource = await viewer.dataSources.add(dataSource)
                                viewer.scene.requestRender()
                                removeTileLoadProgressEventListener()
                            }
                        }
                    )
            }
        } catch (error) {
            log.error('Error while parsing data source in Cesium', error)
        }
    }

    refreshDataSource(loadDataSource)

    onBeforeUnmount(() => {
        if (dataSource) {
            viewer.dataSources.remove(dataSource)
            viewer.scene.requestRender()
        }
    })

    watch(opacity, () => {
        dataSource?.entities.values.forEach((entity) =>
            styleEntity(entity, toValue(opacity) ?? 1.0)
        )
        viewer.scene.requestRender()
    })

    return {
        refreshDataSource,
    }
}
