import type { KMLLayer } from '@swissgeo/layers'

import { filesAPI } from '@swissgeo/api'
import { layerUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { markRaw } from 'vue'

import type { DrawingStore } from '@/store/modules/drawing/types'
import type { ActionDispatcher } from '@/store/types'

import { ENVIRONMENT, IS_TESTING_WITH_CYPRESS } from '@/config'
import useFeaturesStore from '@/store/modules/features'
import useLayersStore from '@/store/modules/layers'
import useUIStore from '@/store/modules/ui'
import { FeatureInfoPositions } from '@/store/modules/ui/types'

import { isOnlineMode } from '../utils/isOnlineMode'

interface InitiateDrawingOptions {
    adminId?: string
    preExistingDrawing?: KMLLayer
    temporaryKmlId?: string
}

export default async function initiateDrawing(
    this: DrawingStore,
    dispatcher: ActionDispatcher
): Promise<void>
export default async function initiateDrawing(
    this: DrawingStore,
    options: InitiateDrawingOptions,
    dispatcher: ActionDispatcher
): Promise<void>

export default async function initiateDrawing(
    this: DrawingStore,
    optionsOrDispatcher: InitiateDrawingOptions | ActionDispatcher,
    dispatcherOrNothing?: ActionDispatcher
) {
    const dispatcher = dispatcherOrNothing ?? (optionsOrDispatcher as ActionDispatcher)
    const options = dispatcherOrNothing ? (optionsOrDispatcher as InitiateDrawingOptions) : {}
    if (this.layer.ol) {
        log.error({
            title: 'Drawing store / initiateDrawing',
            titleColor: LogPreDefinedColor.Lime,
            messages: ['Drawing layer already exists', dispatcher],
        })
        return
    }

    const featuresStore = useFeaturesStore()
    const layersStore = useLayersStore()
    const uiStore = useUIStore()

    // Force feature info to be visible in drawing mode
    uiStore.setFeatureInfoPosition(FeatureInfoPositions.Default, dispatcher)

    // Make sure no drawing features are selected when entering the drawing mode
    featuresStore.clearAllSelectedFeatures(dispatcher)

    const { adminId, preExistingDrawing, temporaryKmlId } = options

    try {
        if (this.iconSets.length === 0) {
            // if icons have not yet been loaded, load them
            await this.loadAvailableIconSets(dispatcher)
        }

        let kmlLayer: KMLLayer | undefined
        if (preExistingDrawing && isOnlineMode(this.onlineMode)) {
            kmlLayer = preExistingDrawing
            this.isDrawingNew = !!kmlLayer.adminId
        } else if (adminId) {
            const kmlMetadata = await filesAPI.getKmlMetadataByAdminId(adminId, ENVIRONMENT)
            kmlLayer = layerUtils.makeKMLLayer({
                name: this.name,
                kmlFileUrl: filesAPI.getKmlUrl(kmlMetadata.id, ENVIRONMENT),
                isVisible: true,
                isEdited: true,
                adminId: kmlMetadata.adminId,
                kmlMetadata,
            })
            this.isDrawingNew = false
        }

        this.layer = {
            ol: markRaw(
                new VectorLayer({
                    source: new VectorSource({
                        useSpatialIndex: false,
                        wrapX: true,
                        // TODO PB-2027: load any pre-existing feature in the drawing layer source, setting the ID the same way we do when we draw new features
                    }),
                    zIndex: 9999,
                })
            ),
            config: kmlLayer,
            temporaryKmlId: temporaryKmlId ?? this.layer.temporaryKmlId,
        }

        log.debug({
            title: 'Drawing store / initiateDrawing',
            titleColor: LogPreDefinedColor.Lime,
            messages: ['Opening drawing mode with', this.layer],
        })

        if (this.layer.config) {
            // checking if the layer is already in the active layers, if so hiding it (we will show it through the system layers)
            const index = layersStore.getIndexOfActiveLayerById(this.layer.config.id)
            if (index === -1) {
                layersStore.addLayer(this.layer.config, dispatcher)
            } else {
                layersStore.updateLayer<KMLLayer>(this.layer.config, { isEdited: true }, dispatcher)
            }
        }

        if (IS_TESTING_WITH_CYPRESS) {
            window.drawingLayer = this.layer.ol
        }
    } catch (error) {
        log.error({
            title: 'Drawing store / initiateDrawing',
            titleColor: LogPreDefinedColor.Lime,
            messages: ['Error while initializing drawing layer', error],
        })
        throw new Error('Error while initializing drawing layer', { cause: error })
    }
}
