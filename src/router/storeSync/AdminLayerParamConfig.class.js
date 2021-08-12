import AbstractParamConfig from '@/router/storeSync/abstractParamConfig.class'
import { getFileId } from '@/api/files.api'
import KMLLayer from '@/api/layers/KMLLayer.class'
import { API_PUBLIC_URL } from '@/config'

function dispatchAdminLayersFromUrlIntoStore(store, adminId) {
    return getFileId(adminId).then((fileId) => {
        const kmlLayer = new KMLLayer('Drawing', 1, `${API_PUBLIC_URL}${fileId}`)
        return Promise.all([
            store.dispatch('addLayer', kmlLayer),
            store.dispatch('setKmlIds', {
                adminId,
                fileId,
            }),
            store.dispatch('toggleDrawingOverlay'),
        ])
    })
}

export default class AdminLayerParamConfig extends AbstractParamConfig {
    constructor() {
        super(
            'drawingAdminFileId',
            '',
            dispatchAdminLayersFromUrlIntoStore,
            undefined,
            false,
            String
        )
    }
}
