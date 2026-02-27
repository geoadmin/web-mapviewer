<script setup lang="ts">
import type { EditableFeatureTypes } from '@swissgeo/api'
import type { ActionDispatcher } from '~/types/drawingStore'

import log from '@swissgeo/log'
import { logConfig, useDrawingStore } from '#imports'
import { computed, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

const dispatcher: ActionDispatcher = { name: 'SwissGeoDrawingToolbox.vue' }

const { t } = useI18n()
const drawingStore = useDrawingStore()

const allEditableFeatureTypes = ref<EditableFeatureTypes[]>([
    'LINEPOLYGON',
    'MEASURE',
    'ANNOTATION',
    'MARKER',
])
const showConfirmDeleteModal = ref<boolean>(false)

const online = ref<boolean>(true)
const drawingName = ref<string>(t('@swissgeo/drawing.draw_layer_label'))

const adminLinkWarningModal = useTemplateRef('shareWarningModal')

/** Return a different translation key depending on the saving status */
const drawingStateMessage = computed(() => {
    switch (drawingStore.save.state) {
        case 'SAVING':
            return t('@swissgeo/drawing.draw_file_saving')
        case 'SAVED':
            return t('@swissgeo/drawing.draw_file_saved')
        case 'SAVE_ERROR':
            return t('@swissgeo/drawing.draw_file_load_error')
        case 'LOAD_ERROR':
            return t('@swissgeo/drawing.draw_file_save_error')
        default:
            return undefined
    }
})
const isDrawingStateError = computed(
    () => drawingStore.save.state === 'LOAD_ERROR' || drawingStore.save.state === 'SAVE_ERROR'
)

const isClosing = computed<boolean>(() => {
    return (
        drawingStore.state === 'CLOSING' ||
        drawingStore.state === 'CLOSING_WAIT_FOR_USER_CONFIRMATION'
    )
})

function getIconForFeatureType(featureType: EditableFeatureTypes): string {
    switch (featureType) {
        case 'LINEPOLYGON':
            // https://icones.js.org/collection/gis?s=pol&icon=gis:polygon-pt
            return 'gis:polygon-pt'
        case 'MARKER':
            // https://icones.js.org/collection/gis?s=poi&icon=gis:poi
            return 'gis:poi'
        case 'MEASURE':
            // https://icones.js.org/collection/gis?s=measu&icon=gis:measure
            return 'gis:measure'
        case 'ANNOTATION':
            // https://icones.js.org/collection/lucide?s=Text&icon=lucide:message-square-text
            return 'lucide:message-square-text'
    }
    return ''
}

function setDrawingMode(featureType: EditableFeatureTypes) {
    if (drawingStore.edit.featureType === featureType) {
        drawingStore.setDrawingMode(undefined, dispatcher)
    } else {
        drawingStore.setDrawingMode(featureType, dispatcher)
    }
}

function closeDrawing(userHasConfirmedNotWantToSaveAdminLink: boolean = false) {
    drawingStore
        .closeDrawing(
            {
                userHasConfirmedNotWantToSaveAdminLink,
            },
            dispatcher
        )
        .then(() => {
            if (drawingStore.state === 'CLOSING_WAIT_FOR_USER_CONFIRMATION') {
                adminLinkWarningModal.value.open()
            }
        })
        .catch((error) => {
            log.error({
                ...logConfig(),
                messages: ['Error while closing drawing', error],
            })
        })
}

function onCloseAdminLinkWarningModal(withConfirmation: boolean) {
    if (withConfirmation) {
        closeDrawing(withConfirmation)
    } else {
        drawingStore.cancelCloseDrawing(dispatcher)
    }
}

function onConfirmCloseWithoutSavingAdminLink() {
    closeDrawing(true)
}
</script>

<template>
    <div class="relative">
        <div class="rounded-bottom rounded-top-0 rounded-start-0">
            <div class="flex">
                <SwissGeoButton
                    :disabled="isClosing"
                    icon="lucide:x"
                    variant="solid"
                    @click="closeDrawing"
                >
                    {{ t('@swissgeo/drawing.close') }}
                </SwissGeoButton>
                <div class="ms-2 grow p-1 italic">
                    {{ t(drawingStore.description) }}
                </div>
            </div>
            <SwissGeoTooltip
                v-if="online"
                :tooltip-content="t('@swissgeo/drawing.drawing_empty_cannot_edit_name')"
                placement="bottom"
                :disabled="!drawingStore.isDrawingNew"
            >
                <UFormField
                    :label="t('@swissgeo/drawing.file_name')"
                    orientation="horizontal"
                    class="my-3 justify-stretch"
                >
                    <UInput
                        v-model="drawingName"
                        :placeholder="`${t('@swissgeo/drawing.draw_layer_label')}`"
                        :disabled="isClosing || drawingStore.isDrawingNew"
                        data-cy="drawing-toolbox-file-name-input"
                    />
                </UFormField>
            </SwissGeoTooltip>

            <div class="grid grid-cols-5 gap-2 p-2 md:grid-cols-2">
                <SwissGeoButton
                    v-for="featureType in allEditableFeatureTypes"
                    :key="featureType"
                    :variant="featureType === drawingStore.edit.featureType ? 'solid' : 'subtle'"
                    :icon="getIconForFeatureType(featureType)"
                    size="xl"
                    @click="setDrawingMode(featureType)"
                >
                    <span class="hidden md:block">
                        {{ t(`@swissgeo/drawing.draw_${featureType.toLowerCase()}`) }}
                    </span>
                </SwissGeoButton>
                <SwissGeoButton
                    icon="lucide:x"
                    size="xl"
                    class="md:hidden"
                    data-cy="drawing-toolbox-close-button"
                    @click="closeDrawing"
                />
            </div>
            <div
                class="my-md-1 text-muted flex justify-center text-xs italic"
                :class="{ 'text-amber-700': isDrawingStateError }"
            >
                {{ drawingStateMessage ?? '&nbsp;' }}
            </div>
            <SwissGeoDrawingShareToolbox />
        </div>
    </div>
    <SwissGeoModal
        :title="t('@swissgeo/drawing.warning')"
        ref="adminLinkWarningModal"
        @close="onCloseAdminLinkWarningModal"
    >
        <template #content>
            <p data-cy="drawing-not-shared-admin-warning">
                {{ t('@swissgeo/drawing.drawing_not_shared_admin_warning') }}
            </p>
            <SwissGeoDrawingShareLinks />
            <button
                data-cy="drawing-share-admin-close"
                class="btn btn-dark"
                @click="onConfirmCloseWithoutSavingAdminLink()"
            >
                {{ t('@swissgeo/drawing.close') }}
            </button>
        </template>
    </SwissGeoModal>
    <SwissGeoModal v-if="showConfirmDeleteModal">
        <div class="mb-2">
            {{ t('@swissgeo/drawing.confirm_remove_all_features') }}
        </div>
        <UAlert
            color="warning"
            variant="subtle"
            icon="lucide:circle-alert"
            :title="t('@swissgeo/drawing.confirm_no_cancel')"
        />
    </SwissGeoModal>
</template>
