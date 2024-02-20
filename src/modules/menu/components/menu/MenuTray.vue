<template>
    <div data-cy="menu-tray-inner" :class="[{ 'menu-tray-compact': compact }, 'menu-tray-inner']">
        <MenuSection
            id="settingsSection"
            ref="settingsSection"
            class="settings-section"
            :title="$t('settings')"
            :show-content="false"
            secondary
            data-cy="menu-settings-section"
            @open-menu-section="onOpenMenuSection"
        >
            <MenuSettings />
        </MenuSection>
        <MenuShareSection ref="shareSection" @open-menu-section="onOpenMenuSection" />
        <MenuPrintSection
            v-if="!is3dMode && hasDevSiteWarning"
            ref="printSection"
            @open-menu-section="onOpenMenuSection"
        />
        <!-- Drawing section is a glorified button, we always keep it closed and listen to click events -->
        <div id="drawSectionTooltip" tabindex="0">
            <MenuSection
                v-if="!is3dMode"
                id="drawSection"
                :title="$t('draw_panel_title')"
                secondary
                :show-content="showDrawingOverlay"
                data-cy="menu-tray-drawing-section"
                @click:header="toggleDrawingOverlay()"
                @open-menu-section="onOpenMenuSection"
                @close-menu-section="onCloseMenuSection"
            />
        </div>
        <MenuSection
            id="toolsSection"
            ref="toolsSection"
            data-cy="menu-tray-tool-section"
            :title="$t('map_tools')"
            secondary
            @open-menu-section="onOpenMenuSection"
            @close-menu-section="onCloseMenuSection"
        >
            <MenuAdvancedToolsList :compact="compact" />
        </MenuSection>
        <MenuTopicSection
            id="topicsSection"
            ref="topicsSection"
            :compact="compact"
            @open-menu-section="onOpenMenuSection"
        />
        <MenuSection
            id="activeLayersSection"
            ref="activeLayersSection"
            :title="$t('layers_displayed')"
            light
            show-content
            data-cy="menu-active-layers"
            @open-menu-section="onOpenMenuSection"
        >
            <MenuActiveLayersList :compact="compact" />
        </MenuSection>
    </div>
</template>

<script>
import { useI18n } from 'vue-i18n'
import { mapActions, mapGetters, mapState } from 'vuex'

import MenuActiveLayersList from '@/modules/menu/components/activeLayers/MenuActiveLayersList.vue'
import MenuAdvancedToolsList from '@/modules/menu/components/advancedTools/MenuAdvancedToolsList.vue'
import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import MenuSettings from '@/modules/menu/components/menu/MenuSettings.vue'
import MenuPrintSection from '@/modules/menu/components/print/MenuPrintSection.vue'
import MenuShareSection from '@/modules/menu/components/share/MenuShareSection.vue'
import MenuTopicSection from '@/modules/menu/components/topics/MenuTopicSection.vue'

export default {
    components: {
        MenuPrintSection,
        MenuShareSection,
        MenuTopicSection,
        MenuSection,
        MenuActiveLayersList,
        MenuSettings,
        MenuAdvancedToolsList,
    },
    props: {
        compact: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const i18n = useI18n()
        return {
            i18n,
        }
    },
    data() {
        return {
            // multiMenuSections means that they can be open together
            multiMenuSections: ['topicsSection', 'activeLayersSection'],
            // singleModeSections means that those section cannot be open together with other
            // sections and would therefore toggle other sections automatically.
            singleModeSections: [
                'drawSection',
                'settingsSection',
                'shareSection',
                'toolsSection',
                'printSection',
            ],
        }
    },
    computed: {
        ...mapGetters(['activeKmlLayer']),
        ...mapState({
            activeLayers: (state) => state.layers.activeLayers,
            hostname: (state) => state.ui.hostname,
            lang: (state) => state.i18n.lang,
            is3dMode: (state) => state.cesium.active,
            showImportFile: (state) => state.ui.importFile,
            showDrawingOverlay: (state) => state.ui.showDrawingOverlay,
        }),
        ...mapGetters(['isPhoneMode', 'hasDevSiteWarning']),
    },
    watch: {
        showImportFile(show) {
            if (show) {
                this.$refs['activeLayersSection'].open()
            }
        },
    },
    methods: {
        ...mapActions(['toggleDrawingOverlay']),
        onOpenMenuSection(id) {
            let toClose = this.singleModeSections.filter((section) => section !== id)
            if (this.singleModeSections.includes(id)) {
                toClose = toClose.concat(this.multiMenuSections)
            }
            toClose.forEach((section) => this.$refs[section]?.close())
        },
        onCloseMenuSection(id) {
            if (['drawSection', 'toolsSection'].includes(id)) {
                this.$refs['activeLayersSection'].open()
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';

.menu-tray-inner {
    display: grid;
    overflow: hidden;

    // Each menu section is in a grid row, to make them scrollable independently of each other we
    // use the grid-auto-rows: auto
    grid-auto-rows: auto;
}

// UI is compact if in desktop mode
.menu-tray-compact {
    font-size: 0.825rem;
}

@include respond-above(lg) {
    .settings-section {
        // See HeaderWithSearch.vue css where the settings-section is enable below lg
        display: none;
    }
}
</style>
