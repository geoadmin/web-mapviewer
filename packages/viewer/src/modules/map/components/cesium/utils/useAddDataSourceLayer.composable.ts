import type { DataSource, Entity, GpxDataSource, Viewer } from 'cesium'
import type { MaybeRef } from 'vue'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import { GeoJsonDataSource, KmlDataSource } from 'cesium'
import { onBeforeUnmount, toRef, toValue, watch } from 'vue'

import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'

/**
 * Function that will be called on each entity when load to let each "flavor" of data style the
 * entities accordingly.
 */
type StyleEntityCallback = (entity: Entity, opacity: number) => void

/**
 * @param viewer Cesium viewer
 * @param loadDataSource A promise that will resolve on the loaded data source
 * @param styleEntity Callback called on each entity after loading and after each opacity change
 * @param opacity Reference to the current opacity of the layer
 * @param layerId ID of the layer to be applied to the data source after loading (like GeoJSON
 *   style/data, GPX or KML data)
 */
export default function useAddDataSourceLayer(
    viewer: MaybeRef<Viewer | undefined>,
    loadDataSource: MaybeRef<
        Promise<GeoJsonDataSource> | Promise<KmlDataSource> | Promise<GpxDataSource>
    >,
    styleEntity: MaybeRef<StyleEntityCallback>,
    opacity: MaybeRef<number>,
    layerId: MaybeRef<string>
) {
    let dataSource: DataSource | undefined

    async function refreshDataSource(
        loadingDataSource:
            | Promise<GeoJsonDataSource>
            | Promise<KmlDataSource>
            | Promise<GpxDataSource>
    ): Promise<void> {
        const viewerInstance = toValue(viewer)
        if (!viewerInstance) {
            log.error({
                title: 'useAddDataSourceLayer.composable',
                titleColor: LogPreDefinedColor.Blue,
                messages: ['Cesium viewer is undefined', viewerInstance],
            })
            return
        }

        log.debug({
            title: 'useAddDataSourceLayer.composable',
            titleColor: LogPreDefinedColor.Blue,
            messages: ['refreshing data source layer', toValue(layerId)],
        })
        if (dataSource) {
            viewerInstance.dataSources.remove(dataSource)
            viewerInstance.scene.requestRender()
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
            dataSource.entities.values.forEach((entity: Entity) => {
                entity.layerId = toValue(layerId)
                toValue(styleEntity)(entity, toValue(opacity) ?? 1.0)
            })

            // need to wait for terrain loaded otherwise primitives will be placed wrong (under the terrain)
            if (viewerInstance.scene.globe.tilesLoaded || IS_TESTING_WITH_CYPRESS) {
                dataSource = await viewerInstance.dataSources.add(dataSource)
                viewerInstance.scene.requestRender()
            } else {
                const removeTileLoadProgressEventListener =
                    viewerInstance.scene.globe.tileLoadProgressEvent.addEventListener(
                        (queueLength: number) => {
                            const currentViewer = toValue(viewer)
                            if (
                                dataSource &&
                                currentViewer &&
                                currentViewer.scene.globe.tilesLoaded &&
                                queueLength === 0
                            ) {
                                currentViewer.dataSources
                                    .add(dataSource)
                                    .then((loadedDataSource) => {
                                        dataSource = loadedDataSource
                                    })
                                    .catch((error) => {
                                        log.error({
                                            title: 'useAddDataSourceLayer.composable',
                                            titleColor: LogPreDefinedColor.Red,
                                            messages: [
                                                'Error while adding data source to viewer',
                                                error,
                                            ],
                                        })
                                    })
                                currentViewer.scene.requestRender()
                                removeTileLoadProgressEventListener()
                            }
                        }
                    )
            }
        } catch (error) {
            log.error({
                title: 'useAddDataSourceLayer.composable',
                titleColor: LogPreDefinedColor.Red,
                messages: ['Error while parsing data source in Cesium', error],
            })
        }
    }

    refreshDataSource(toValue(loadDataSource)).catch((error) => {
        log.error({
            title: 'useAddDataSourceLayer.composable',
            titleColor: LogPreDefinedColor.Red,
            messages: ['Error while loading data source', error],
        })
    })

    onBeforeUnmount(() => {
        const viewerInstance = toValue(viewer)
        if (dataSource && viewerInstance) {
            viewerInstance.dataSources.remove(dataSource)
            viewerInstance.scene.requestRender()
        }
    })

    watch(toRef(opacity), () => {
        const viewerInstance = toValue(viewer)
        dataSource?.entities.values.forEach((entity: Entity) =>
            toValue(styleEntity)(entity, toValue(opacity) ?? 1.0)
        )
        if (viewerInstance) {
            viewerInstance.scene.requestRender()
        }
    })

    return {
        refreshDataSource,
    }
}
