<script setup lang="ts">
import { WarningMessage } from '@swissgeo/log/Message'
import { computed } from 'vue'

import ImportCatalogue from '@/modules/menu/components/advancedTools/ImportCatalogue/ImportCatalogue.vue'
import ImportFile from '@/modules/menu/components/advancedTools/ImportFile/ImportFile.vue'
import MenuAdvancedToolsListItem from '@/modules/menu/components/advancedTools/MenuAdvancedToolsListItem.vue'
import useCesiumStore from '@/store/modules/cesium'
import useLayersStore from '@/store/modules/layers'
import useUIStore from '@/store/modules/ui'
import SimpleWindow from '@/utils/components/SimpleWindow.vue'

const dispatcher = { name: 'MenuAdvancedToolsList.vue' }

const { compact } = defineProps({
    compact: {
        type: Boolean,
        default: false,
    },
})

const uiStore = useUIStore()
const cesiumStore = useCesiumStore()
const layersStore = useLayersStore()

const showImportCatalogue = computed(() => uiStore.importCatalogue)
const showImportFile = computed(() => uiStore.importFile)
const storeCompareRatio = computed(() => uiStore.compareRatio)
const isCompareSliderActive = computed(() => uiStore.isCompareSliderActive)
const isPhoneMode = computed(() => uiStore.isPhoneMode)
const is3dActive = computed(() => cesiumStore.active)

const hasNoVisibleLayer = computed(() => !layersStore.visibleLayerOnTop)

function onToggleImportCatalogue() {
    uiStore.toggleImportCatalogue(dispatcher)
}

function onToggleCompareSlider() {
    if (storeCompareRatio.value === undefined) {
        // this allows us to set a value to the compare ratio, in case there was none
        uiStore.setCompareRatio(0.5, dispatcher)
    }
    uiStore.setCompareSliderActive(
        !hasNoVisibleLayer.value && !isCompareSliderActive.value,
        dispatcher
    )

    if (hasNoVisibleLayer.value) {
        uiStore.addWarnings(new WarningMessage('no_layers_info_compare'), dispatcher)
    }
}
function onToggleImportFile() {
    if (!showImportFile.value && isPhoneMode.value) {
        // To avoid the menu overlapping the import overlay after open we automatically
        // close the menu
        uiStore.toggleMenu(dispatcher)
    }
    uiStore.toggleImportFile(dispatcher)
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
