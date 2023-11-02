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
        <!-- Drawing section is a glorified button, we always keep it closed and listen to click events -->
        <div id="drawSectionTooltip" tabindex="0">
            <MenuSection
                v-if="!is3dMode"
                id="drawSection"
                :title="$t('draw_panel_title')"
                :always-keep-closed="true"
                secondary
                :disabled="disableDrawing"
                data-cy="menu-tray-drawing-section"
                @click:header="toggleDrawingOverlay"
            />
        </div>
        <MenuSection
            id="toolsSection"
            ref="toolsSection"
            data-cy="menu-tray-tool-section"
            :title="$t('map_tools')"
            secondary
            @open-menu-section="onOpenMenuSection"
        >
            <MenuAdvancedToolsList />
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
            :show-content="showLayerList"
            data-cy="menu-active-layers"
            @open-menu-section="onOpenMenuSection"
        >
            <MenuActiveLayersList :compact="compact" />
        </MenuSection>
    </div>
</template>

<script>
import MenuActiveLayersList from '@/modules/menu/components/activeLayers/MenuActiveLayersList.vue'
import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import MenuSettings from '@/modules/menu/components/menu/MenuSettings.vue'
import MenuShareSection from '@/modules/menu/components/share/MenuShareSection.vue'
import MenuTopicSection from '@/modules/menu/components/topics/MenuTopicSection.vue'
import MenuAdvancedToolsList from '@/modules/menu/components/advancedTools/MenuAdvancedToolsList.vue'
import { mapActions, mapState, mapGetters } from 'vuex'
import { DISABLE_DRAWING_MENU_FOR_LEGACY_ON_HOSTNAMES } from '@/config'
import tippy, { followCursor } from 'tippy.js'

export default {
    components: {
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
    data() {
        return {
            /* Please note that if the following 2 arrays are updated, "grid-template-rows" in
            the css section must also be updated. */
            scrollableMenuSections: ['topicsSection', 'activeLayersSection'],
            nonScrollableMenuSections: ['settingsSection', 'shareSection'],
        }
    },
    computed: {
        ...mapGetters(['activeKmlLayer']),
        ...mapState({
            activeLayers: (state) => state.layers.activeLayers,
            hostname: (state) => state.ui.hostname,
            lang: (state) => state.i18n.lang,
            is3dMode: (state) => state.ui.showIn3d,
        }),
        ...mapGetters(['isPhoneMode']),
        showLayerList() {
            return this.activeLayers.length > 0
        },
        disableDrawing() {
            // TODO BGDIINF_SB-2685: remove this protection once on prod
            if (
                DISABLE_DRAWING_MENU_FOR_LEGACY_ON_HOSTNAMES.some(
                    (hostname) => hostname === this.hostname
                )
            ) {
                if (this.activeKmlLayer?.adminId && this.activeKmlLayer?.isLegacy()) {
                    return true
                }
            }
            return false
        },
    },
    watch: {
        disableDrawing(disableDrawing) {
            if (disableDrawing) {
                this.disableDrawingTooltip = tippy('#drawSectionTooltip', {
                    theme: 'danger',
                    arrow: true,
                    followCursor: 'initial',
                    plugins: [followCursor],
                    hideOnClick: false,
                    delay: 500,
                    offset: [15, 15],
                })
                this.setDisableDrawingTooltipContent()
            } else {
                if (this.disableDrawingTooltip) {
                    this.disableDrawingTooltip.forEach((tooltip) => tooltip.destroy())
                    this.disableDrawingTooltip = null
                }
            }
        },
        lang() {
            this.setDisableDrawingTooltipContent()
        },
    },
    methods: {
        ...mapActions(['toggleDrawingOverlay']),
        onOpenMenuSection(id) {
            let toClose = this.nonScrollableMenuSections.filter((section) => section !== id)
            if (this.nonScrollableMenuSections.includes(id)) {
                toClose = toClose.concat(this.scrollableMenuSections)
            }
            toClose.forEach((section) => this.$refs[section]?.close())
        },
        setDisableDrawingTooltipContent() {
            this.disableDrawingTooltip?.forEach((instance) => {
                instance.setContent(this.$i18n.t('legacy_drawing_warning'))
            })
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
