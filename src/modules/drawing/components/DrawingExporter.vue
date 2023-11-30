<script setup>
import {
    generateFilename,
    generateGpxString,
    generateKmlString,
} from '@/modules/drawing/lib/export-utils'
import DropdownButton, { DropdownItem } from '@/utils/DropdownButton.vue'
import { saveAs } from 'file-saver'
import { computed, inject, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

const exportOptions = [new DropdownItem('KML'), new DropdownItem('GPX')]

const drawingLayer = inject('drawingLayer')

const exportSelection = ref('KML')

const i18n = useI18n()
const store = useStore()

const projection = computed(() => store.state.position.projection)
const isDrawingEmpty = computed(() => store.getters.isDrawingEmpty)

function onExportOptionSelected(dropdownItem) {
    exportSelection.value = dropdownItem.value
    exportDrawing()
}
function exportDrawing() {
    // if there's no features, no export
    if (isDrawingEmpty.value) {
        return
    }
    const gpx = exportSelection.value === 'GPX'
    const features = drawingLayer.getSource().getFeatures()
    let content, type, fileName
    if (gpx) {
        fileName = generateFilename('.gpx')
        content = generateGpxString(projection.value, features)
        type = 'application/gpx+xml;charset=UTF-8'
    } else {
        fileName = generateFilename('.kml')
        content = generateKmlString(projection.value, features)
        type = 'application/vnd.google-earth.kml+xml;charset=UTF-8'
    }
    const blob = new Blob([content], { type })

    saveAs(blob, fileName)
}
</script>

<template>
    <DropdownButton
        :title="i18n.t('export_kml')"
        :current-value="exportSelection"
        :items="exportOptions"
        :disabled="isDrawingEmpty"
        with-toggle-button
        data-cy="drawing-toolbox-export-button"
        @select:item="onExportOptionSelected"
        @click="exportDrawing()"
    />
</template>
