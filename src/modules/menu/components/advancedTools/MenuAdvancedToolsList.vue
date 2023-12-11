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
    </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

import ImportCatalogue from '@/modules/menu/components/advancedTools/ImportCatalogue/ImportCatalogue.vue'
import ImportFile from '@/modules/menu/components/advancedTools/ImportFile/ImportFile.vue'
import MenuAdvancedToolsListItem from '@/modules/menu/components/advancedTools/MenuAdvancedToolsListItem.vue'
import ModalWithBackdrop from '@/utils/ModalWithBackdrop.vue'

export default {
    components: { ImportFile, ModalWithBackdrop, MenuAdvancedToolsListItem, ImportCatalogue },
    props: {
        compact: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        ...mapState({
            showImportCatalogue: (state) => state.ui.importCatalogue,
            showImportFile: (state) => state.ui.importFile,
        }),
        ...mapGetters(['isPhoneMode']),
    },
    methods: {
        ...mapActions(['toggleImportCatalogue', 'toggleImportFile', 'toggleMenu']),
        onToggleImportCatalogue() {
            this.toggleImportCatalogue()
        },
        onToggleImportFile() {
            if (!this.importFile && this.isPhoneMode) {
                // To avoid the menu overlapping the import overlay after open we automatically
                // close the menu
                this.toggleMenu()
            }
            this.toggleImportFile()
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/modules/menu/scss/menu-items';

.advanced-tools-list {
    @extend .menu-list;
    overflow-y: auto;
}
</style>
