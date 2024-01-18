<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import { formatThousand } from '@/utils/numberUtils.js'

const emits = defineEmits(['openMenuSection'])

const isSectionShown = ref(false)
const selectedLayoutName = ref(null)
const selectedScale = ref(null)

const i18n = useI18n()
const store = useStore()
const printLayouts = computed(() => store.state.print.layouts)
const selectedLayout = computed(() =>
    printLayouts.value.find((layout) => layout.name === selectedLayoutName.value)
)
const scales = computed(() => selectedLayout.value?.scales || [])

watch(printLayouts, () => {
    // whenever layouts are loaded form the backend, we select the first one as default value
    if (printLayouts.value.length > 0) {
        selectLayout(printLayouts.value[0])
    }
})

function togglePrintMenu() {
    // load print layouts from the backend if they were not yet loaded
    if (printLayouts.value.length === 0) {
        store.dispatch('loadPrintLayouts')
    } else {
        // if layouts are already present, we select the first one as default value
        selectLayout(printLayouts.value[0])
    }
    isSectionShown.value = true
}
function selectLayout(layout) {
    selectedLayoutName.value = layout.name
    selectedScale.value = layout.scales[0]
}

function close() {
    isSectionShown.value = false
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
</style>