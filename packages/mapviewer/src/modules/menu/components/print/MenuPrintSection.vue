<script setup>
import log from '@geoadmin/log'
import { formatThousand } from '@geoadmin/numbers'
import { computed, inject, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { PrintError } from '@/api/print.api.js'
import {
    PrintStatus,
    usePrint,
} from '@/modules/map/components/openlayers/utils/usePrint.composable'
import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import ProgressBar from '@/utils/components/ProgressBar.vue'

const dispatcher = { dispatcher: 'MapPrintSection.vue' }

const emits = defineEmits(['openMenuSection'])

const sectionId = 'printSection'
const isSectionShown = ref(false)
const printGrid = ref(false)
const printLegend = ref(false)

const olMap = inject('olMap')
const { printStatus, print, abortCurrentJob, printError } = usePrint(olMap)

const { t } = useI18n()
const store = useStore()
const availablePrintLayouts = computed(() => store.state.print.layouts)
const selectedLayout = computed(() => store.state.print.selectedLayout)
const scales = computed(() => selectedLayout.value?.scales || [])
// approximate print duration := 8s per layer (+1 is for the background layer and to avoid 0 duration)
const printDuration = computed(() => 8 * (store.getters.visibleLayers.length + 1))

const selectedLayoutName = computed({
    get() {
        return store.state.print.selectedLayout?.name ?? ''
    },
    set(value) {
        store.dispatch('setSelectedLayout', {
            layout: availablePrintLayouts.value.find((layout) => layout.name === value),
            ...dispatcher,
        })
    },
})

const selectedScale = computed({
    get() {
        return store.state.print.selectedScale
    },
    set(value) {
        store.dispatch('setSelectedScale', { scale: value, ...dispatcher })
    },
})

const printErrorMessage = computed(() => {
    if (printStatus.FINISHED_ABORTED) {
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
    store.dispatch('setPrintSectionShown', { show: isSectionShown.value, ...dispatcher })
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
        store.dispatch('loadPrintLayouts', dispatcher).then(() => {
            isSectionShown.value = !isSectionShown.value
        })
    } else {
        // if layouts are already present, we select the first one as default value
        selectLayout(availablePrintLayouts.value[0])
        isSectionShown.value = !isSectionShown.value
    }
}
function selectLayout(layout) {
    selectedLayoutName.value = layout.name
}

function close() {
    isSectionShown.value = false
}

async function printMap() {
    try {
        const documentUrl = await print(printGrid.value, printLegend.value)
        if (documentUrl) {
            if (window.navigator.userAgent.indexOf('MSIE ') > -1) {
                window.open(documentUrl)
            } else {
                window.location = documentUrl
            }
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
            class="p-2 d-grid gap-2 menu-print-settings mx-4"
            data-cy="menu-print-form"
        >
            <label
                for="print-layout-selector"
                class="col-form-label fw-bold me-2"
            >
                {{ t('print_layout') }}
            </label>
            <select
                id="print-layout-selector"
                v-model="selectedLayoutName"
                class="form-select"
                data-cy="print-layout-selector"
            >
                <option
                    v-for="layout in availablePrintLayouts"
                    :key="layout.name"
                    :value="layout.name"
                    @click="selectLayout(layout)"
                >
                    <!-- on the backend the layout are enumerated to keep the ordering, but here we don't want the
                 enumeration therefore we remove it -->
                    {{ layout.name.replace(/^\d+\.\s*/, '') }}
                </option>
            </select>
            <label
                for="print-scale-selector"
                class="col-form-label fw-bold me-2"
            >
                {{ t('print_scale') }}
            </label>
            <select
                id="print-scale-selector"
                v-model="selectedScale"
                class="form-select"
                data-cy="print-scale-selector"
            >
                <option
                    v-for="scale in scales"
                    :key="scale"
                    :value="scale"
                >
                    {{ '1:' + formatThousand(scale) }}
                </option>
            </select>
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
