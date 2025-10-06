<script setup lang="ts">
import { computed, inject, ref } from 'vue'

import { generateGpxString, generateKmlString } from '@/modules/drawing/lib/export-utils'
import DropdownButton from '@/utils/components/DropdownButton.vue'
import type { DropdownItem } from '@/utils/components/DropdownButton.vue'
import { downloadFile, generateFilename } from '@/utils/utils'
import usePositionStore from '@/store/modules/position.store'
import useDrawingStore from '@/store/modules/drawing.store'
import useLayersStore from '@/store/modules/layers.store'

import type VectorLayer from 'ol/layer/Vector'

const exportOptions: DropdownItem<string>[] = [
    { id: 'KML', title: 'KML', value: 'KML' },
    { id: 'GPX-Track', title: 'gpx_track', value: 'GPX_TRACK' },
    { id: 'GPX-Route', title: 'gpx_route', value: 'GPX_ROUTE' },
]

const drawingLayer = inject<VectorLayer>('drawingLayer')

const exportSelection = ref<string>(exportOptions[0]!.title)

const positionStore = usePositionStore()
const drawingStore = useDrawingStore()
const layersStore = useLayersStore()

const projection = computed(() => positionStore.projection)
const isDrawingEmpty = computed(() => drawingStore.isDrawingEmpty)
const activeKmlLayer = computed(() => layersStore.activeKmlLayer)

function onExportOptionSelected(dropdownItem: DropdownItem<unknown>) {
    exportSelection.value = dropdownItem.title
    exportDrawing()
}
function exportDrawing() {
    // if there's no features, no export
    if (isDrawingEmpty.value) {
        return
    }
    const features = drawingLayer?.getSource?.()?.getFeatures?.() ?? []
    let content: string, fileName: string
    if (exportSelection.value === 'GPX_TRACK') {
        fileName = generateFilename('.gpx')
        content = generateGpxString(projection.value, features, true)
    } else if (exportSelection.value === 'GPX_ROUTE') {
        fileName = generateFilename('.gpx')
        content = generateGpxString(projection.value, features, false)
    } else {
        fileName = generateFilename('.kml')
        content = generateKmlString(projection.value, features, activeKmlLayer.value?.name ?? '')
    }
    downloadFile(new Blob([content]), fileName)
}
</script>

<template>
    <DropdownButton
        title="export_kml"
        :disabled="isDrawingEmpty"
        :items="exportOptions"
        :current-value="exportSelection"
        with-toggle-button
        data-cy="drawing-toolbox-export-button"
        @click="exportDrawing"
        @select-item="onExportOptionSelected"
    />
</template>
