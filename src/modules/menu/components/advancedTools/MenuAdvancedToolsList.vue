<script setup>
import { computed, toRefs } from 'vue'
import { useStore } from 'vuex'

import ImportCatalogue from '@/modules/menu/components/advancedTools/ImportCatalogue/ImportCatalogue.vue'
import ImportFile from '@/modules/menu/components/advancedTools/ImportFile/ImportFile.vue'
import MenuAdvancedToolsListItem from '@/modules/menu/components/advancedTools/MenuAdvancedToolsListItem.vue'
import { COMPARE_SLIDER_DEFAULT_VALUE } from '@/store/modules/ui.store.js'
import ModalWithBackdrop from '@/utils/ModalWithBackdrop.vue'

const props = defineProps({
    compact: {
        type: Boolean,
        default: false,
    },
})

const { compact } = toRefs(props)

const store = useStore()

const showImportCatalogue = computed(() => store.state.ui.importCatalogue)
const showImportFile = computed(() => store.state.ui.importFile)
const storeCompareRatio = computed(() => store.state.ui.compareRatio)
const visibleLayerOnTop = computed(() => store.getters.visibleLayerOnTop)
const isPhoneMode = computed(() => store.getters.isPhoneMode)
const is3dActive = computed(() => store.state.cesium.active)

function onToggleImportCatalogue() {
    store.dispatch('toggleImportCatalogue')
}
function onToggleCompareSlider() {
    if (storeCompareRatio.value <= 0.0 || storeCompareRatio.value >= 1.0) {
        store.dispatch('setCompareRatio', -COMPARE_SLIDER_DEFAULT_VALUE)
    } else {
        store.dispatch('setCompareRatio', COMPARE_SLIDER_DEFAULT_VALUE)
    }
}

function isCompareSliderToggleAvailable() {
    return visibleLayerOnTop.value !== null && !is3dActive.value
}

function onToggleImportFile() {
    if (!showImportFile.value && isPhoneMode.value) {
        // To avoid the menu overlapping the import overlay after open we automatically
        // close the menu
        store.dispatch('toggleMenu')
    }
    store.dispatch('toggleImportFile')
}
</script>

<template>
    <div class="advanced-tools-list px-2 py-1">
        <MenuAdvancedToolsListItem
            :is-selected="showImportCatalogue"
            title="import_maps"
            tooltip="import_maps_tooltip"
            dropdown-menu
            data-cy="menu-advanced-tools-import-catalogue"
            @toggle-menu="onToggleImportCatalogue"
        >
            <ImportCatalogue v-show="showImportCatalogue" :compact="compact" />
        </MenuAdvancedToolsListItem>
        <MenuAdvancedToolsListItem
            :is-selected="showImportFile"
            title="import_file"
            tooltip="import_file_tooltip"
            data-cy="menu-advanced-tools-import-file"
            @toggle-menu="onToggleImportFile"
        >
            <ModalWithBackdrop
                v-if="showImportFile"
                :title="$t('import_file')"
                @close="onToggleImportFile"
            >
                <ImportFile />
            </ModalWithBackdrop>
        </MenuAdvancedToolsListItem>
        <MenuAdvancedToolsListItem
            v-if="isCompareSliderToggleAvailable()"
            class="advanced-tools-title"
            :title="$t('compare')"
            @click.stop="onToggleCompareSlider"
        >
        </MenuAdvancedToolsListItem>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/modules/menu/scss/menu-items';

.advanced-tools-list {
    @extend .menu-list;
    overflow-y: auto;
}
</style>
