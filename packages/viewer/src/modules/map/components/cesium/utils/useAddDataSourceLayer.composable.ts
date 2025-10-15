import log, { LogPreDefinedColor } from '@swissgeo/log'
import {
    type DataSource,
    Entity,
    GeoJsonDataSource,
    type GpxDataSource,
    KmlDataSource,
    Viewer,
} from 'cesium'
import { type MaybeRef, onBeforeUnmount, toRef, toValue, watch } from 'vue'

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
    viewer: MaybeRef<Viewer>,
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
        log.debug({
            title: 'useAddDataSourceLayer.composable',
            titleColor: LogPreDefinedColor.Blue,
            message: ['refreshing data source layer', toValue(layerId)],
        })
        if (dataSource) {
            toValue(viewer).dataSources.remove(dataSource)
            toValue(viewer).scene.requestRender()
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
            if (toValue(viewer).scene.globe.tilesLoaded || IS_TESTING_WITH_CYPRESS) {
                dataSource = await toValue(viewer).dataSources.add(dataSource)
                toValue(viewer).scene.requestRender()
            } else {
                const removeTileLoadProgressEventListener = toValue(
                    viewer
                ).scene.globe.tileLoadProgressEvent.addEventListener((queueLength: number) => {
                    if (
                        dataSource &&
                        toValue(viewer).scene.globe.tilesLoaded &&
                        queueLength === 0
                    ) {
                        toValue(viewer)
                            .dataSources.add(dataSource)
                            .then((loadedDataSource) => {
                                dataSource = loadedDataSource
                            })
                            .catch((error) => {
                                log.error({
                                    title: 'useAddDataSourceLayer.composable',
                                    titleColor: LogPreDefinedColor.Red,
                                    message: ['Error while adding data source to viewer', error],
                                })
                            })
                        toValue(viewer).scene.requestRender()
                        removeTileLoadProgressEventListener()
                    }
                })
            }
        } catch (error) {
            log.error({
                title: 'useAddDataSourceLayer.composable',
                titleColor: LogPreDefinedColor.Red,
                message: ['Error while parsing data source in Cesium', error],
            })
        }
    }

    refreshDataSource(toValue(loadDataSource)).catch((error) => {
        log.error({
            title: 'useAddDataSourceLayer.composable',
            titleColor: LogPreDefinedColor.Red,
            message: ['Error while loading data source', error],
        })
    })

    onBeforeUnmount(() => {
        if (dataSource) {
            toValue(viewer).dataSources.remove(dataSource)
            toValue(viewer).scene.requestRender()
        }
    })

    watch(toRef(opacity), () => {
        dataSource?.entities.values.forEach((entity: Entity) =>
            toValue(styleEntity)(entity, toValue(opacity) ?? 1.0)
        )
        toValue(viewer).scene.requestRender()
    })

    return {
        refreshDataSource,
    }
}
