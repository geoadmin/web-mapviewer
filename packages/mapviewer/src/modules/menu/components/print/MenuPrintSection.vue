<script lang="ts" setup>
import type Map from 'ol/Map'

import log from '@geoadmin/log'
import { formatThousand } from '@geoadmin/numbers'
import { computed, inject, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ActionDispatcher } from '@/store/store'

import { PrintError, PrintLayout } from '@/api/print.api'
import {
    PrintStatus,
    usePrint,
} from '@/modules/map/components/openlayers/utils/usePrint.composable.js'
import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import useLayersStore from '@/store/modules/layers.store'
import usePrintStore from '@/store/modules/print.store'
import DropdownButton, { type DropdownItem } from '@/utils/components/DropdownButton.vue'
import ProgressBar from '@/utils/components/ProgressBar.vue'
import { downloadFile, generateFilename } from '@/utils/utils'

const dispatcher: ActionDispatcher = { name: 'MapPrintSection.vue' }

const emits = defineEmits<{
    openMenuSection: [void]
}>()

const sectionId = 'printSection'
const isSectionShown = ref<boolean>(false)
const printGrid = ref<boolean>(false)
const printLegend = ref<boolean>(false)

const olMap = inject<Map>('olMap') as Map
const { printStatus, print, abortCurrentJob, printError } = usePrint(olMap)

const { t } = useI18n()

const layersStore = useLayersStore()
const printStore = usePrintStore()

const selectedLayout = computed<PrintLayout | undefined>(() => printStore.selectedLayout)

const availablePrintLayouts = computed<DropdownItem[]>(() =>
    printStore.layouts.map((layout) => ({
        id: layout.name,
        title: formatTitle(layout.name),
        value: layout,
        selected: selectedLayout.value?.name === layout.name,
    }))
)

const scales = computed<DropdownItem[]>(() => {
    if (selectedLayout.value?.scales) {
        return selectedLayout.value.scales.map((scale) => ({
            id: scale,
            title: formatScale(scale),
            value: scale,
            selected: selectedScale.value === scale,
        }))
    }
    return []
})

// approximate print duration := 8s per layer (+1 is for the background layer and to avoid 0 duration)
const printDurationGuess = computed<number>(() => 8 * (layersStore.visibleLayers.length + 1))

const selectedLayoutName = computed<string | undefined>({
    get() {
        return selectedLayout.value?.name
    },
    set(value) {
        printStore.setSelectedLayout(
            availablePrintLayouts.value.find((layout) => layout.value === value),
            dispatcher
        )
    },
})

const selectedScale = computed<number>({
    get() {
        return printStore.selectedScale
    },
    set(value) {
        printStore.setSelectedScale(value, dispatcher)
    },
})

const printErrorMessage = computed<string | undefined>(() => {
    if (printStatus.value === PrintStatus.FINISHED_ABORTED) {
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
    printStore.setPrintSectionShown(isSectionShown, dispatcher)
})

watch(availablePrintLayouts, () => {
    // whenever layouts are loaded form the backend, we select the first one as default value
    if (availablePrintLayouts.value.length > 0) {
        selectLayout(availablePrintLayouts.value[0])
    }
})

function togglePrintMenu() {
    // load print layouts from the backend if they were not yet loaded
    if (availablePrintLayouts.value.length === 0) {
        printStore.loadPrintLayouts(dispatcher).then(() => {
            isSectionShown.value = !isSectionShown.value
        })
    } else {
        // if layouts are already present, we select the first one as default value
        selectLayout(availablePrintLayouts.value[0])
        isSectionShown.value = !isSectionShown.value
    }
}
function selectLayout(layout) {
    selectedLayoutName.value = layout.value.name
}
function selectScale(scale) {
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
        log.error('Print failed', error)
    }
}

function onOpenMenuSection(sectionId) {
    if (printStatus.value !== PrintStatus.PRINTING) {
        printStatus.value = PrintStatus.IDLE
    }
    emits('openMenuSection', sectionId)
}

function formatTitle(title) {
    return title ? title.replace(/^\d+\.\s*/, '') : ''
}

function formatScale(scale) {
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
                v-if="selectedLayoutName"
                id="print-layout-selector"
                :title="formatTitle(selectedLayoutName)"
                :items="availablePrintLayouts"
                :current-value="selectedLayoutName"
                data-cy="print-layout-selector"
                @select-item="selectLayout"
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
                :items="scales"
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
                        'is-invalid':
                            printStatus === PrintStatus.FINISHED_FAILED ||
                            printStatus === PrintStatus.FINISHED_ABORTED,
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
                    :duration="printDurationGuess"
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
