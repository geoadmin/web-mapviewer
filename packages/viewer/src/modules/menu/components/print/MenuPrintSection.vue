<script setup lang="ts">
import log from '@swissgeo/log'
import { formatThousand } from '@swissgeo/numbers'
import { computed, inject, ref, watch, type ComputedRef, type WritableComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import Map from 'ol/Map'

import { PrintError, PrintLayout } from '@/api/print.api.js'
import {
    PrintStatus,
    usePrint,
} from '@/modules/map/components/openlayers/utils/usePrint.composable'
import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import DropdownButton, { type DropdownItem } from '@/utils/components/DropdownButton.vue'
import ProgressBar from '@/utils/components/ProgressBar.vue'
import { downloadFile, generateFilename } from '@/utils/utils'
import usePrintStore from '@/store/modules/print.store'
import useLayersStore from '@/store/modules/layers.store'

const dispatcher = { name: 'MapPrintSection.vue' }

const emits = defineEmits(['openMenuSection'])

const sectionId = 'printSection'
const isSectionShown = ref(false)
const printGrid = ref(false)
const printLegend = ref(false)

const olMap = inject<Map>('olMap')

const { printStatus, print, abortCurrentJob, printError } = usePrint(olMap!)

const { t } = useI18n()

const printStore = usePrintStore()
const layersStore = useLayersStore()

// approximate print duration := 8s per layer (+1 is for the background layer and to avoid 0 duration)
const printDuration = computed(() => 8 * (layersStore.visibleLayers.length + 1))

const availablePrintLayouts: ComputedRef<DropdownItem<PrintLayout>[]> = computed(() =>
    printStore.layouts.map((layout) => ({
        id: formatTitle(layout.name),
        title: formatTitle(layout.name),
        value: layout,
    }))
)

const availableScales: ComputedRef<DropdownItem<number>[]> = computed(
    () =>
        selectedLayout?.value?.scales?.map((scale) => ({
            id: scale,
            title: formatScale(scale),
            value: scale,
        })) ?? []
)

const selectedLayout: WritableComputedRef<PrintLayout | undefined> = computed({
    get() {
        return printStore.selectedLayout
    },
    set(layout) {
        printStore.setSelectedLayout(layout, dispatcher)
    },
})

const selectedScale = computed({
    get() {
        return printStore.selectedScale
    },
    set(value: number) {
        printStore.setSelectedScale(value, dispatcher)
    },
})

const printErrorMessage = computed(() => {
    if (PrintStatus.FINISHED_ABORTED) {
        return t('operation_aborted')
    } else {
        if (printError.value instanceof PrintError && printError.value.key) {
            return t(printError.value.key)
        } else {
            return t('operation_failed')
        }
    }
})

watch(isSectionShown, () => {
    printStore.setPrintSectionShown(isSectionShown.value, dispatcher)
})

watch(availablePrintLayouts, () => {
    // whenever layouts are loaded form the backend, we select the first one as default value
    if (availablePrintLayouts.value.length > 0) {
        // selectLayout()
        selectedLayout.value = availablePrintLayouts.value[0]?.value
    }
})

function togglePrintMenu() {
    // load print layouts from the backend if they were not yet loaded
    if (availablePrintLayouts.value.length === 0) {
        printStore
            .loadPrintLayouts(dispatcher)
            .then(() => {
                isSectionShown.value = !isSectionShown.value
            })
            .catch((_) => {})
    } else {
        // if layouts are already present, we select the first one as default value
        selectedLayout.value = availablePrintLayouts.value[0]?.value
        isSectionShown.value = !isSectionShown.value
    }
}

function selectPrintLayout(layout: DropdownItem<PrintLayout>): void {
    selectedLayout.value = layout.value
}

function selectScale(scale: DropdownItem<number>) {
    selectedScale.value = scale.value
}

function close() {
    isSectionShown.value = false
}

async function printMap() {
    try {
        const printDownloadUrl = await print(printGrid.value, printLegend.value)
        if (printDownloadUrl) {
            downloadFile(printDownloadUrl, generateFilename('pdf'))
        } else {
            if (printStatus.value === PrintStatus.FINISHED_ABORTED) {
                log.debug('Print is aborted by the user')
            } else if (printStatus.value === PrintStatus.FINISHED_FAILED) {
                log.error('Print failed, received null')
            }
        }
    } catch (error) {
        log.error({ messages: ['Print failed', error] })
    }
}

function onOpenMenuSection(sectionId: string) {
    if (printStatus.value !== PrintStatus.PRINTING) {
        printStatus.value = PrintStatus.IDLE
    }
    emits('openMenuSection', sectionId)
}

function formatTitle(title: string) {
    return title ? title.replace(/^\d+\.\s*/, '') : ''
}

function formatScale(scale: number) {
    return scale ? '1:' + formatThousand(scale) : ''
}

defineExpose({
    close,
    sectionId,
})
</script>

<template>
    <MenuSection
        :section-id="sectionId"
        :title="t('print')"
        :show-content="isSectionShown"
        data-cy="menu-print-section"
        secondary
        @click:header="togglePrintMenu"
        @open-menu-section="onOpenMenuSection"
    >
        <div
            class="d-grid menu-print-settings mx-4 gap-2 p-2"
            data-cy="menu-print-form"
        >
            <label
                for="print-layout-selector"
                class="col-form-label fw-bold me-2"
            >
                {{ t('print_layout') }}
            </label>
            <DropdownButton
                v-if="selectedLayout"
                id="print-layout-selector"
                :title="formatTitle(selectedLayout?.name)"
                :items="availablePrintLayouts"
                :current-value="selectedLayout?.name || null"
                data-cy="print-layout-selector"
                @select-item="selectPrintLayout"
            />
            <div v-else>...</div>
            <label
                for="print-scale-selector"
                class="col-form-label fw-bold me-2"
            >
                {{ t('print_scale') }}
            </label>
            <DropdownButton
                v-if="selectedScale"
                id="print-scale-selector"
                :title="formatScale(selectedScale)"
                :items="availableScales"
                :current-value="selectedScale"
                data-cy="print-scale-selector"
                @select-item="selectScale"
            />
            <div v-else>...</div>
            <div class="form-check">
                <input
                    id="checkboxLegend"
                    v-model="printLegend"
                    data-cy="checkboxLegend"
                    class="form-check-input"
                    type="checkbox"
                />
                <label
                    class="form-check-label"
                    for="checkboxLegend"
                >
                    {{ t('legend') }}
                </label>
            </div>
            <div class="form-check">
                <input
                    id="checkboxGrid"
                    v-model="printGrid"
                    data-cy="checkboxGrid"
                    class="form-check-input"
                    type="checkbox"
                />
                <label
                    class="form-check-label"
                    for="checkboxGrid"
                >
                    {{ t('graticule') }}
                </label>
            </div>
            <div class="full-width">
                <input
                    hidden
                    :class="{
                        'is-invalid': [
                            PrintStatus.FINISHED_FAILED,
                            PrintStatus.FINISHED_ABORTED,
                        ].includes(printStatus),
                        'is-valid': printStatus === PrintStatus.FINISHED_SUCCESSFULLY,
                    }"
                />
                <div class="invalid-feedback">
                    {{ printErrorMessage }}
                </div>
                <div class="valid-feedback">
                    {{ t('operation_successful') }}
                </div>
            </div>
            <div class="full-width justify-content-center">
                <ProgressBar
                    v-if="printStatus === PrintStatus.PRINTING"
                    :duration="printDuration"
                    bar-class="bg-danger"
                    class="mb-2"
                />
                <button
                    v-if="printStatus === PrintStatus.PRINTING"
                    type="button"
                    class="btn btn-danger w-100 text-white"
                    data-cy="abort-print-button"
                    @click="abortCurrentJob"
                >
                    {{ t('abort') }}
                </button>
                <button
                    v-else
                    type="button"
                    class="btn btn-light w-100"
                    data-cy="print-map-button"
                    @click="printMap"
                >
                    {{ t('print_action') }}
                </button>
            </div>
        </div>
    </MenuSection>
</template>

<style lang="scss" scoped>
.menu-print-settings {
    grid-template-columns: 1fr 2fr;
    label {
        text-align: end;
    }
}
.full-width {
    grid-column: span 2;
}
</style>
