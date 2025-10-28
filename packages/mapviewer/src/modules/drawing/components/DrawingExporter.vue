<script setup>
import { computed, inject, ref } from 'vue'
import { useStore } from 'vuex'

import { generateGpxString, generateKmlString } from '@/modules/drawing/lib/export-utils'
import DropdownButton from '@/utils/components/DropdownButton.vue'
import { downloadFile, generateFilename } from '@/utils/utils'

/** @type {DropdownItem[]} */
const exportOptions = [
    { id: 'KML', title: 'KML', value: 'KML' },
    { id: 'GPX-Track', title: 'gpx_track', value: 'GPX_TRACK' },
    { id: 'GPX-Route', title: 'gpx_route', value: 'GPX_ROUTE' },
]

const drawingLayer = inject('drawingLayer')

const exportSelection = ref(exportOptions[0].value)

const store = useStore()

const projection = computed(() => store.state.position.projection)
const isDrawingEmpty = computed(() => store.getters.isDrawingEmpty)
const activeKmlLayer = computed(() => store.getters.activeKmlLayer)

function onExportOptionSelected(dropdownItem) {
    exportSelection.value = dropdownItem.value
    exportDrawing()
}
function exportDrawing() {
    // if there's no features, no export
    if (isDrawingEmpty.value) {
        return
    }
    const features = drawingLayer.getSource().getFeatures()
    let content, fileName
    if (exportSelection.value === 'GPX_TRACK') {
        fileName = generateFilename('.gpx')
        content = generateGpxString(projection.value, features, true)
    } else if (exportSelection.value === 'GPX_ROUTE') {
        fileName = generateFilename('.gpx')
        content = generateGpxString(projection.value, features, false)
    } else {
        fileName = generateFilename('.kml')
        content = generateKmlString(projection.value, features, activeKmlLayer.value?.name)
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
