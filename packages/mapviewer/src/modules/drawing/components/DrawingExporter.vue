<script setup>
import { computed, inject, ref } from 'vue'
import { useStore } from 'vuex'

import { generateGpxString, generateKmlString } from '@/modules/drawing/lib/export-utils'
import DropdownButton from '@/utils/components/DropdownButton.vue'
import DropdownButtonItem from '@/utils/components/DropdownButtonItem.vue'
import { downloadFile, generateFilename } from '@/utils/utils'

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
    let content, fileName
    if (exportSelection.value === 'GPX') {
        fileName = generateFilename('.gpx')
        content = generateGpxString(projection.value, features)
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
        with-toggle-button
        data-cy="drawing-toolbox-export-button"
        @click="exportDrawing()"
    >
        <DropdownButtonItem
            v-for="item in exportOptions"
            :key="item.id"
            v-bind="item"
            :current-value="exportSelection"
            @select-item="onExportOptionSelected"
        />
    </DropdownButton>
</template>
