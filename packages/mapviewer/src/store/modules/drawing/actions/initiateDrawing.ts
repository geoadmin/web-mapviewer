import type { KMLLayer } from '@swissgeo/layers'

import { kmlUtils } from '@swissgeo/api/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { markRaw } from 'vue'

import type { DrawingStore } from '@/store/modules/drawing/types'
import type { ActionDispatcher } from '@/store/types'

import { IS_TESTING_WITH_CYPRESS } from '@/config'
import useFeaturesStore from '@/store/modules/features'
import usePositionStore from '@/store/modules/position'
import useUIStore from '@/store/modules/ui'

interface InitiateDrawingOptions {
    preExistingDrawing?: KMLLayer
    temporaryKmlId?: string
    online?: boolean
    /** Title to give to the drawing menu. */
    title?: string
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
    const positionStore = usePositionStore()
    const uiStore = useUIStore()

    // Force feature info to be visible in drawing mode
    uiStore.setFeatureInfoPosition('default', dispatcher)

    // Make sure no drawing features are selected when entering the drawing mode
    featuresStore.clearAllSelectedFeatures(dispatcher)

    const {
        preExistingDrawing,
        temporaryKmlId,
        online = false,
        title = 'draw_mode_title',
    } = options

    this.online = online
    try {
        if (this.iconSets.length === 0) {
            // if icons have not yet been loaded, load them
            await this.loadAvailableIconSets(dispatcher)
        }

        let kmlLayer: KMLLayer | undefined
        if (preExistingDrawing) {
            kmlLayer = preExistingDrawing
            this.isDrawingNew = !!kmlLayer.adminId

            if (kmlLayer.isLoading) {
                log.debug({
                    title: 'Drawing store / initiateDrawing',
                    titleColor: LogPreDefinedColor.Lime,
                    messages: ['Waiting on layer to be loaded', kmlLayer.id],
                })
                await kmlLayer.loadedPromise
            }
        }

        const preExistingFeatures = []
        if (kmlLayer) {
            preExistingFeatures.push(
                ...kmlUtils
                    .parseKml(
                        kmlLayer,
                        positionStore.projection,
                        this.iconSets,
                        positionStore.resolution
                    )
                    .filter((feature) => !!feature.get('editableFeature'))
            )
        }

        this.layer = {
            ol: markRaw(
                new VectorLayer({
                    source: new VectorSource({
                        wrapX: true,
                        features: preExistingFeatures,
                    }),
                    zIndex: 9999,
                })
            ),
            hasLoaded: false,
            temporaryKmlId: temporaryKmlId ?? this.layer.temporaryKmlId,
        }
        this.layer.ol.set('id', 'drawing-layer')

        log.debug({
            title: 'Drawing store / initiateDrawing',
            titleColor: LogPreDefinedColor.Lime,
            messages: ['Opening drawing mode with', this.layer],
        })

        if (IS_TESTING_WITH_CYPRESS) {
            window.drawingLayer = this.layer.ol
        }

        this.overlay.title = title
        this.overlay.show = true
    } catch (error) {
        log.error({
            title: 'Drawing store / initiateDrawing',
            titleColor: LogPreDefinedColor.Lime,
            messages: ['Error while initializing drawing layer', error],
        })
        throw new Error('Error while initializing drawing layer', { cause: error })
    }
}
