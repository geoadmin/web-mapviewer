<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import log from '@/utils/logging'
import { formatThousand } from '@/utils/numberUtils.js'

const emits = defineEmits(['openMenuSection'])

const isSectionShown = ref(false)
const selectedLayoutName = ref(null)
const useLegend = ref(false)
const useGraticule = ref(false)

const i18n = useI18n()
const store = useStore()
const printLayouts = computed(() => store.state.print.layouts)
const selectedLayout = computed(() =>
    printLayouts.value.find((layout) => layout.name === selectedLayoutName.value)
)
const scales = computed(() => selectedLayout.value?.scales || [])

const selectedScale = computed({
    get() {
        return store.getters.getSelectedScale
    },
    set(value) {
        store.commit('setSelectedScale', value)
    },
})

watch(selectedLayout, () => {
    store.commit('setSelectedLayout', selectedLayout.value)
})

watch(isSectionShown, () => {
    store.commit('setPrintSectionShown', isSectionShown.value)
})

watch(printLayouts, () => {
    // whenever layouts are loaded form the backend, we select the first one as default value
    if (printLayouts.value.length > 0) {
        selectLayout(printLayouts.value[0])
    }
})

function togglePrintMenu() {
    // load print layouts from the backend if they were not yet loaded
    if (printLayouts.value.length === 0) {
        store.dispatch('loadPrintLayouts').then(() => {
            isSectionShown.value = !isSectionShown.value
        })
    } else {
        // if layouts are already present, we select the first one as default value
        selectLayout(printLayouts.value[0])
        isSectionShown.value = !isSectionShown.value
    }
}
function selectLayout(layout) {
    selectedLayoutName.value = layout.name
    selectedScale.value = layout.scales[0]
}

function close() {
    isSectionShown.value = false
}

function printMap() {
    log.info('Print Map...')
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
        <div class="p-2 d-grid gap-2 menu-print-settings mx-4">
            <label for="print-layout-selector " class="col-form-label fw-bold me-2">{{
                i18n.t('print_layout')
            }}</label>
            <select id="print-layout-selector " v-model="selectedLayoutName" class="form-select">
                <option
                    v-for="layout in printLayouts"
                    :key="layout.name"
                    :value="layout.name"
                    @click="selectLayout(layout)"
                >
                    {{ layout.name }}
                </option>
            </select>
            <label for="print-scale-selector " class="col-form-label fw-bold me-2">{{
                i18n.t('print_scale')
            }}</label>
            <select id="print-scale-selector " v-model="selectedScale" class="form-select">
                <option v-for="scale in scales" :key="scale" :value="scale">
                    1:{{ formatThousand(scale) }}
                </option>
            </select>
            <div class="form-check">
                <input
                    id="checkboxLegend"
                    v-model="useLegend"
                    class="form-check-input"
                    type="checkbox"
                />
                <label class="form-check-label" for="checkboxLegend">{{ i18n.t('legend') }}</label>
            </div>
            <div class="form-check">
                <input
                    id="checkboxGraticule"
                    v-model="useGraticule"
                    class="form-check-input"
                    type="checkbox"
                />
                <label class="form-check-label" for="checkboxGraticule">{{
                    i18n.t('graticule')
                }}</label>
            </div>
            <div class="full-width justify-content-center">
                <button type="button" class="btn btn-light w-100" @click="printMap">
                    {{ i18n.t('print_action') }}
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
