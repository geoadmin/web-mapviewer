<template>
    <ul class="advanced-tools-list px-2 py-1">
        <MenuAdvancedToolsListItem
            :is-selected="showImportFile"
            :title="$t('import_file')"
            :tooltip="$t('import_file_tooltip')"
            @click.stop="onToggleImportFile"
        >
            <ModalWithBackdrop
                v-if="showImportFile"
                :title="$t('import_file')"
                @close="onToggleImportFile"
            >
                <ImportFile />
            </ModalWithBackdrop>
        </MenuAdvancedToolsListItem>
        <!-- TODO replace this one by Import Catalog -->
        <MenuAdvancedToolsListItem
            :is-selected="importOverlay"
            :title="$t('import')"
            :tooltip="$t('import_tooltip')"
            @click.stop="onToggleImportOverlay"
        />
    </ul>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import ImportFile from '@/modules/menu/components/advancedTools/ImportFile/ImportFile.vue'
import ModalWithBackdrop from '@/utils/ModalWithBackdrop.vue'
import MenuAdvancedToolsListItem from '@/modules/menu/components/advancedTools/MenuAdvancedToolsListItem.vue'

export default {
    components: { ImportFile, ModalWithBackdrop, MenuAdvancedToolsListItem },
    computed: {
        ...mapState({
            importOverlay: (state) => state.ui.importOverlay,
            showImportFile: (state) => state.ui.importFile,
        }),
        ...mapGetters(['isPhoneMode']),
    },
    methods: {
        ...mapActions(['toggleImportOverlay', 'toggleImportFile', 'toggleMenu']),
        onToggleImportOverlay() {
            if (!this.importOverlay && this.isPhoneMode) {
                // To avoid the menu overlapping the import overlay after open we automatically
                // close the menu
                this.toggleMenu()
            }
            this.toggleImportOverlay()
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
.advanced-tools-list {
    list-style-type: none;
    margin-bottom: 0;
}
</style>
