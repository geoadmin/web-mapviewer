<template>
    <div class="btn-group m-1">
        <button
            :disabled="isDrawingEmpty"
            type="button"
            class="btn btn-outline-light text-dark"
            data-cy="drawing-toolbox-quick-export-button"
            @click="exportDrawing(false)"
        >
            {{ $t('export_kml') }}
        </button>
        <button
            id="toggle-export-dropdown-options"
            type="button"
            :disabled="isDrawingEmpty"
            class="btn btn-outline-light text-dark dropdown-toggle dropdown-toggle-split"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            data-cy="drawing-toolbox-choose-export-format-button"
        >
            <span class="visually-hidden">Toggle Dropdown</span>
        </button>
        <ul class="dropdown-menu" aria-labelledby="toggle-export-dropdown-options">
            <li>
                <button
                    class="dropdown-item"
                    data-cy="drawing-toolbox-export-kml-button"
                    @click="exportDrawing(false)"
                >
                    KML
                </button>
            </li>
            <li>
                <button
                    class="dropdown-item"
                    data-cy="drawing-toolbox-export-gpx-button"
                    @click="exportDrawing(true)"
                >
                    GPX
                </button>
            </li>
        </ul>
    </div>
</template>

<script>
import { generateGpxString, generateKmlString } from '@/modules/drawing/lib/export-utils'
import { saveAs } from 'file-saver'

export default {
    inject: ['getDrawingLayer'],
    computed: {
        isDrawingEmpty() {
            const drawingLayer = this.getDrawingLayer()
            if (drawingLayer) {
                return drawingLayer.getSource().getFeatures().length === 0
            }
            return true
        },
    },
    methods: {
        exportDrawing: function (gpx = false) {
            // checking first that we have access to the drawing layer
            const drawingLayer = this.getDrawingLayer()
            if (!drawingLayer) {
                return
            }
            const features = drawingLayer.getSource().getFeatures()
            // if there's no features, no export
            if (features.length === 0) {
                return
            }

            const date = new Date()
                .toISOString()
                .split('.')[0]
                .replaceAll('-', '')
                .replaceAll(':', '')
                .replace('T', '')
            let fileName = 'map.geo.admin.ch_'
            let content, type
            if (gpx) {
                fileName += `GPX_${date}.gpx`
                content = generateGpxString(features)
                type = 'application/gpx+xml;charset=UTF-8'
            } else {
                fileName += `KML_${date}.kml`
                content = generateKmlString(features)
                type = 'application/vnd.google-earth.kml+xml;charset=UTF-8'
            }
            const blob = new Blob([content], { type: type })
            saveAs(blob, fileName)
        },
    },
}
</script>