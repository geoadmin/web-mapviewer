<script setup>
import { computed, inject, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import {
    PrintStatus,
    usePrint,
} from '@/modules/map/components/openlayers/utils/usePrint.composable'
import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import log from '@/utils/logging'
import { formatThousand } from '@/utils/numberUtils'

const dispatcher = { dispatcher: 'MapPrintSection.vue' }

const emits = defineEmits(['openMenuSection'])

const isSectionShown = ref(false)
const printGrid = ref(false)
const printLegend = ref(false)

const olMap = inject('olMap')
const { printStatus, print, abortCurrentJob } = usePrint(olMap)

const i18n = useI18n()
const store = useStore()
const availablePrintLayouts = computed(() => store.state.print.layouts)
const selectedLayout = computed(() => store.state.print.selectedLayout)
const scales = computed(() => selectedLayout.value?.scales || [])

const selectedLayoutName = computed({
    get() {
        return store.state.print.selectedLayout?.name
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
            console.log('documentUrl: ', documentUrl)
            if (window.navigator.userAgent.indexOf('MSIE ') > -1) {
                window.open(documentUrl)
            } else {
                window.location = documentUrl
            }
        } else {
            log.error('Print failed, received null')
        }
    } catch (error) {
        log.error('Print failed', error)
    }
}

defineExpose({
    close,
})
</script>

<template>
    <MenuSection
        id="printSection"
        :title="$t('print')"
        :show-content="isSectionShown"
        data-cy="menu-print-section"
        secondary
        @click:header="togglePrintMenu"
        @open-menu-section="(id) => emits('openMenuSection', id)"
    >
        <div class="p-2 d-grid gap-2 menu-print-settings mx-4" data-cy="menu-print-form">
            <label for="print-layout-selector" class="col-form-label fw-bold me-2">{{
                i18n.t('print_layout')
            }}</label>
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
            <label for="print-scale-selector" class="col-form-label fw-bold me-2">{{
                i18n.t('print_scale')
            }}</label>
            <select
                id="print-scale-selector"
                v-model="selectedScale"
                class="form-select"
                data-cy="print-scale-selector"
            >
                <option v-for="scale in scales" :key="scale" :value="scale">
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
                <label class="form-check-label" for="checkboxLegend">{{ i18n.t('legend') }}</label>
            </div>
            <div class="form-check">
                <input
                    id="checkboxGrid"
                    v-model="printGrid"
                    data-cy="checkboxGrid"
                    class="form-check-input"
                    type="checkbox"
                />
                <label class="form-check-label" for="checkboxGrid">{{ i18n.t('graticule') }}</label>
            </div>
            <div class="full-width justify-content-center">
                <button
                    v-if="printStatus === PrintStatus.PRINTING"
                    type="button"
                    class="btn btn-danger w-100 text-white"
                    data-cy="abort-print-button"
                    @click="abortCurrentJob"
                >
                    {{ i18n.t('abort') }}
                </button>
                <button
                    v-else
                    type="button"
                    class="btn btn-light w-100"
                    data-cy="print-map-button"
                    @click="printMap"
                >
                    {{ i18n.t('print_action') }}
                </button>
                <!-- TODO: manage failing print job-->
                <!-- TODO: give a UI feedback for a print success-->
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
