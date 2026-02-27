import type { KMLLayer } from '@swissgeo/layers'
import type { ActionDispatcher, DrawingStore } from '~/types/drawingStore'
import type { Map } from 'ol'
import type { Raw } from 'vue'

import { filesAPI } from '@swissgeo/api'
import { layerUtils } from '@swissgeo/layers/utils'
import log from '@swissgeo/log'
import { logConfig } from '#imports'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { markRaw } from 'vue'

interface InitiateDrawingConfig {
    olMap: Raw<Map>
    /** Whether the drawing should be saved on the backend. Default is true. */
    online?: boolean
    description?: string
    adminId?: string
    preExistingDrawing?: KMLLayer
    temporaryKmlId?: string
    title?: string
}

export default async function initiateDrawing(
    this: DrawingStore,
    config: InitiateDrawingConfig,
    dispatcher: ActionDispatcher
): Promise<Raw<VectorLayer<VectorSource>>> {
    if (this.layer.ol) {
        log.error({
            ...logConfig('store - initiateDrawing'),
            messages: ['Drawing layer already exists', dispatcher],
        })
        return this.layer.ol
    }

    const {
        olMap,
        adminId,
        online,
        description,
        preExistingDrawing,
        temporaryKmlId,
        title = 'draw_mode_title',
    } = config

    this.state = 'INITIALIZING'
    this.online = online !== undefined ? online : true

    if (description) {
        this.description = description
    }

    this.olMap = olMap
    this.name = title

    try {
        if (this.iconSets.length === 0) {
            // if icons have not yet been loaded, load them
            await this.loadAvailableIconSets(dispatcher)
        }

        let kmlLayer: KMLLayer | undefined
        if (preExistingDrawing && this.online) {
            kmlLayer = preExistingDrawing
            this.isDrawingNew = !!kmlLayer.adminId
        } else if (adminId) {
            const kmlMetadata = await filesAPI.getKmlMetadataByAdminId(adminId, this.debug.staging)
            kmlLayer = layerUtils.makeKMLLayer({
                name: this.name,
                kmlFileUrl: filesAPI.getKmlUrl(kmlMetadata.id, this.debug.staging),
                isVisible: true,
                isEdited: true,
                adminId: kmlMetadata.adminId,
                kmlMetadata,
            })
            this.isDrawingNew = false
        }

        const olLayer = new VectorLayer({
            source: new VectorSource({
                useSpatialIndex: false,
                wrapX: true,
                // TODO PB-2027: load any pre-existing feature in the drawing layer source, setting the ID the same way we do when we draw new features
                features: [],
            }),
            zIndex: 9999,
        })
        olMap.addLayer(olLayer)

        this.layer = {
            ol: markRaw(olLayer),
            config: kmlLayer,
            temporaryKmlId: temporaryKmlId ?? this.layer.temporaryKmlId,
        }

        log.debug({
            ...logConfig('store - initiateDrawing'),
            messages: ['Opening drawing mode with', this.layer],
        })

        this.state = 'DRAWING'
        return this.layer.ol!
    } catch (error) {
        log.error({
            ...logConfig('store - initiateDrawing'),
            messages: ['Error while initializing drawing layer', error],
        })
        throw new Error('Error while initializing drawing layer', { cause: error })
    }
}
