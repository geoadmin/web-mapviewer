<script setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import ImportCatalogue from '@/modules/menu/components/advancedTools/ImportCatalogue/ImportCatalogue.vue'
import ImportFile from '@/modules/menu/components/advancedTools/ImportFile/ImportFile.vue'
import MenuAdvancedToolsListItem from '@/modules/menu/components/advancedTools/MenuAdvancedToolsListItem.vue'
import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'

const STORE_DISPATCHER_MENU_ADVANCED_TOOL = 'MenuAdvancedToolsList.vue'

const props = defineProps({
    compact: {
        type: Boolean,
        default: false,
    },
})
const { compact } = toRefs(props)
const store = useStore()
const i18n = useI18n()
const showImportCatalogue = computed(() => store.state.ui.importCatalogue)
const showImportFile = computed(() => store.state.ui.importFile)
const storeCompareRatio = computed(() => store.state.ui.compareRatio)
const isCompareSliderActive = computed(() => store.state.ui.isCompareSliderActive)
const isPhoneMode = computed(() => store.getters.isPhoneMode)
const is3dActive = computed(() => store.state.cesium.active)

function onToggleImportCatalogue() {
    store.dispatch('toggleImportCatalogue')
}
function onToggleCompareSlider() {
    if (storeCompareRatio.value === null) {
        // this allows us to set a value to the compare ratio, in case there was none
        store.dispatch('setCompareRatio', {
            value: 0.5,
            dispatcher: STORE_DISPATCHER_MENU_ADVANCED_TOOL,
        })
    }
    store.dispatch('setCompareSliderActive', {
        value: !isCompareSliderActive.value,
        dispatcher: STORE_DISPATCHER_MENU_ADVANCED_TOOL,
    })
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
                :title="i18n.t('import_file')"
                top
                @close="onToggleImportFile"
            >
                <ImportFile />
            </ModalWithBackdrop>
        </MenuAdvancedToolsListItem>
        <MenuAdvancedToolsListItem
            v-if="!is3dActive"
            :is-selected="isCompareSliderActive"
            title="compare"
            tooltip="swipe_tooltip"
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
