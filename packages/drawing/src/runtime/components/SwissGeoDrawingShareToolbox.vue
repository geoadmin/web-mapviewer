<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { ActionDispatcher } from '~/types/drawingStore'

import {
    downloadFile,
    generateFilename,
    generateGpxString,
    generateKmlString,
    useDrawingStore,
} from '#imports'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const dispatcher: ActionDispatcher = { name: 'SwissGeoDrawingShareToolbox.vue' }

const exportFormat = ref<'KML' | 'GPX'>('KML')
const exportOptions = computed<DropdownMenuItem[]>(() => [
    {
        label: 'KML',
        checked: exportFormat.value === 'KML',
        onSelect: () => {
            exportFormat.value = 'KML'
        },
        type: 'checkbox',
    },
    {
        label: 'GPX',
        checked: exportFormat.value === 'GPX',
        onSelect: () => {
            exportFormat.value = 'GPX'
        },
        type: 'checkbox',
    },
])

const { t } = useI18n()
const drawingStore = useDrawingStore()

watch(exportFormat, () => exportDrawing())

function exportDrawing() {
    // if there's no features, no export
    if (drawingStore.isDrawingEmpty) {
        return
    }
    const features = drawingStore.layer.ol?.getSource?.()?.getFeatures?.() ?? []
    let content: string, fileName: string
    if (exportFormat.value === 'GPX') {
        fileName = generateFilename('.gpx')
        content = generateGpxString(drawingStore.projection, features)
    } else {
        fileName = generateFilename('.kml')
        content = generateKmlString(drawingStore.projection, features, drawingStore.name ?? '')
    }
    downloadFile(new Blob([content]), fileName)
}

function onCloseDeleteModal(withConfirmation: boolean) {
    if (withConfirmation) {
        drawingStore.deleteCurrentDrawing(dispatcher)
    }
}
</script>

<template>
    <div class="flex justify-around gap-2">
        <SwissGeoModal
            :title="t('@swissgeo/drawing.warning')"
            show-confirmation-buttons
            :confirm-button="{
                i18nKey: '@swissgeo/drawing.delete',
                icon: 'lucide:trash',
                theme: 'error',
            }"
            :cancel-button="{
                i18nKey: '@swissgeo/drawing.cancel',
            }"
            @close="onCloseDeleteModal"
        >
            <SwissGeoButton
                :disabled="drawingStore.isDrawingEmpty"
                data-cy="drawing-toolbox-delete-button"
            >
                {{ t('@swissgeo/drawing.delete') }}
            </SwissGeoButton>
            <template #content>
                <div class="mb-2">
                    {{ t('@swissgeo/drawing.confirm_remove_all_features') }}
                </div>
                <UAlert
                    color="warning"
                    variant="subtle"
                    icon="lucide:circle-alert"
                    :title="t('@swissgeo/drawing.confirm_no_cancel')"
                />
            </template>
        </SwissGeoModal>
        <UFieldGroup>
            <SwissGeoButton
                :disabled="drawingStore.isDrawingEmpty"
                @click="exportDrawing"
            >
                {{ t('@swissgeo/drawing.export') }}
            </SwissGeoButton>
            <UDropdownMenu
                ref="exportFormatSelector"
                :items="exportOptions"
            >
                <SwissGeoButton
                    icon="lucide:chevron-down"
                    :disabled="drawingStore.isDrawingEmpty"
                />
            </UDropdownMenu>
        </UFieldGroup>
        <SwissGeoModal
            v-if="drawingStore.online"
            :title="t('@swissgeo/drawing.share')"
        >
            <SwissGeoButton
                :disabled="drawingStore.isDrawingEmpty"
                data-cy="drawing-toolbox-share-button"
            >
                {{ t('@swissgeo/drawing.share') }}
            </SwissGeoButton>
            <template #content>
                <SwissGeoDrawingShareLinks />
            </template>
        </SwissGeoModal>
    </div>
</template>
