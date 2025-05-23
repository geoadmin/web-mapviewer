<script setup>
import { WarningMessage } from '@geoadmin/log/Message'
import { computed } from 'vue'
import { useStore } from 'vuex'

import ImportCatalogue from '@/modules/menu/components/advancedTools/ImportCatalogue/ImportCatalogue.vue'
import ImportFile from '@/modules/menu/components/advancedTools/ImportFile/ImportFile.vue'
import MenuAdvancedToolsListItem from '@/modules/menu/components/advancedTools/MenuAdvancedToolsListItem.vue'
import SimpleWindow from '@/utils/components/SimpleWindow.vue'

const dispatcher = { dispatcher: 'MenuAdvancedToolsList.vue' }

const { compact } = defineProps({
    compact: {
        type: Boolean,
        default: false,
    },
})
const store = useStore()
const showImportCatalogue = computed(() => store.state.ui.importCatalogue)
const showImportFile = computed(() => store.state.ui.importFile)
const storeCompareRatio = computed(() => store.state.ui.compareRatio)
const isCompareSliderActive = computed(() => store.state.ui.isCompareSliderActive)
const isPhoneMode = computed(() => store.getters.isPhoneMode)
const is3dActive = computed(() => store.state.cesium.active)

const hasNoVisibleLayer = computed(() => !store.getters.visibleLayerOnTop)

function onToggleImportCatalogue() {
    store.dispatch('toggleImportCatalogue', dispatcher)
}

function onToggleCompareSlider() {
    if (storeCompareRatio.value === null) {
        // this allows us to set a value to the compare ratio, in case there was none
        store.dispatch('setCompareRatio', {
            compareRatio: 0.5,
            ...dispatcher,
        })
    }
    store.dispatch('setCompareSliderActive', {
        ...dispatcher,
        compareSliderActive: !hasNoVisibleLayer.value && !isCompareSliderActive.value,
    })

    if (hasNoVisibleLayer.value) {
        store.dispatch('addWarnings', {
            warnings: [new WarningMessage('no_layers_info_compare')],
            ...dispatcher,
        })
    }
}
function onToggleImportFile() {
    if (!showImportFile.value && isPhoneMode.value) {
        // To avoid the menu overlapping the import overlay after open we automatically
        // close the menu
        store.dispatch('toggleMenu', dispatcher)
    }
    store.dispatch('toggleImportFile', dispatcher)
}
</script>

<template>
    <div
        class="advanced-tools-list"
        data-cy="menu-advanced-tools-list"
    >
        <MenuAdvancedToolsListItem
            :is-selected="showImportCatalogue"
            title="import_maps"
            tooltip="import_maps_tooltip"
            dropdown-menu
            data-cy="menu-advanced-tools-import-catalogue"
            @toggle-menu="onToggleImportCatalogue"
        >
            <ImportCatalogue
                v-show="showImportCatalogue"
                class="py-2"
                :compact="compact"
            />
        </MenuAdvancedToolsListItem>
        <MenuAdvancedToolsListItem
            :is-selected="showImportFile"
            title="import_file"
            tooltip="import_file_tooltip"
            data-cy="menu-advanced-tools-import-file"
            @toggle-menu="onToggleImportFile"
        >
            <SimpleWindow
                v-if="showImportFile"
                :title="'import_file'"
                movable
                initial-position="top-left"
                wide
                data-cy="import-window"
                @close="onToggleImportFile"
            >
                <ImportFile />
            </SimpleWindow>
        </MenuAdvancedToolsListItem>

        <MenuAdvancedToolsListItem
            v-if="!is3dActive"
            :is-selected="isCompareSliderActive"
            title="compare"
            tooltip="swipe_tooltip"
            @click.stop="onToggleCompareSlider"
        />
    </div>
</template>

<style lang="scss" scoped>
@import '@/modules/menu/scss/menu-items';

.advanced-tools-list {
    @extend %menu-list;

    overflow-y: auto;
}
</style>
