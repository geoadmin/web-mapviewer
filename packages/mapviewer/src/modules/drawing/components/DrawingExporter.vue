<script setup>
import { saveAs } from 'file-saver'
import { computed, inject, ref } from 'vue'
import { useStore } from 'vuex'

import { generateGpxString, generateKmlString } from '@/modules/drawing/lib/export-utils'
import DropdownButton from '@/utils/components/DropdownButton.vue'
import { generateFilename } from '@/utils/utils'

/** @type {DropdownItem[]} */
const exportOptions = [
    { id: 'kml', title: 'KML' },
    { id: 'gpx', title: 'GPX' },
]

const drawingLayer = inject('drawingLayer')

const exportSelection = ref(exportOptions[0].title)

const store = useStore()

const projection = computed(() => store.state.position.projection)
const isDrawingEmpty = computed(() => store.getters.isDrawingEmpty)
const activeKmlLayer = computed(() => store.getters.activeKmlLayer)

function onExportOptionSelected(dropdownItem) {
    exportSelection.value = dropdownItem.title
    exportDrawing()
}
function exportDrawing() {
    // if there's no features, no export
    if (isDrawingEmpty.value) {
        return
    }
    const features = drawingLayer.getSource().getFeatures()
    let content, type, fileName
    if (exportSelection.value === 'GPX') {
        fileName = generateFilename('.gpx')
        content = generateGpxString(projection.value, features)
        type = 'application/gpx+xml;charset=UTF-8'
    } else {
        fileName = generateFilename('.kml')
        content = generateKmlString(projection.value, features, activeKmlLayer.value?.name)
        type = 'application/vnd.google-earth.kml+xml;charset=UTF-8'
    }
    saveAs(new Blob([content], { type }), fileName)
}
</script>

<template>
    <DropdownButton
        title="export_kml"
        :current-value="exportSelection"
        :items="exportOptions"
        :disabled="isDrawingEmpty"
        with-toggle-button
        data-cy="drawing-toolbox-export-button"
        @select-item="onExportOptionSelected"
        @click="exportDrawing()"
    />
</template>
