<script setup>
import { computed, toRefs } from 'vue'
import { useStore } from 'vuex'

import ImportCatalogue from '@/modules/menu/components/advancedTools/ImportCatalogue/ImportCatalogue.vue'
import ImportFile from '@/modules/menu/components/advancedTools/ImportFile/ImportFile.vue'
import MenuAdvancedToolsListItem from '@/modules/menu/components/advancedTools/MenuAdvancedToolsListItem.vue'
import { COMPARE_SLIDER_DEFAULT_VALUE } from '@/store/modules/ui.store'
import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'
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
const isPhoneMode = computed(() => store.getters.isPhoneMode)
const is3dActive = computed(() => store.state.cesium.active)
function compareSliderActive() {
    return storeCompareRatio.value > 0.0 && storeCompareRatio.value < 1.0
}
function onToggleImportCatalogue() {
    store.dispatch('toggleImportCatalogue')
}
function onToggleCompareSlider() {
    // this allows us to store the previous compare ratio while making
    // the Compare Slider invisible.
    if (compareSliderActive()) {
        store.dispatch('setCompareRatio', null)
    } else {
        store.dispatch('setCompareRatio', -COMPARE_SLIDER_DEFAULT_VALUE)
    }
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
    <div class="advanced-tools-list" data-cy="menu-advanced-tools-list">
        <MenuAdvancedToolsListItem
            :is-selected="showImportCatalogue"
            title="import_maps"
            tooltip="import_maps_tooltip"
            dropdown-menu
            data-cy="menu-advanced-tools-import-catalogue"
            @toggle-menu="onToggleImportCatalogue"
        >
            <ImportCatalogue v-show="showImportCatalogue" class="py-2" :compact="compact" />
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
                top
                @close="onToggleImportFile"
            >
                <ImportFile />
            </ModalWithBackdrop>
            <MenuAdvancedToolsListItem
                v-if="!is3dActive.value"
                :is-selected="compareSliderActive()"
                :title="$t('compare')"
                @click.stop="onToggleCompareSlider"
            >
            </MenuAdvancedToolsListItem>
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
