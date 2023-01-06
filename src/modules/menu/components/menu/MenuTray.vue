<template>
    <div data-cy="menu-tray-inner" :class="[{ 'menu-tray-compact': compact }, 'menu-tray-inner']">
        <MenuSection
            id="settingsSection"
            ref="settingsSection"
            :title="$t('settings')"
            :show-content="false"
            secondary
            data-cy="menu-settings-section"
            @open-menu-section="onOpenMenuSection"
        >
            <MenuSettings />
        </MenuSection>
        <MenuShareSection
            id="shareSection"
            ref="shareSection"
            @open-menu-section="onOpenMenuSection"
        />
        <!-- Drawing section is a glorified button, we always keep it closed and listen to click events -->
        <div id="drawSectionTooltip" tabindex="0">
            <MenuSection
                id="drawSection"
                :title="$t('draw_panel_title')"
                :always-keep-closed="true"
                secondary
                :disabled="disableDrawing"
                data-cy="menu-tray-drawing-section"
                @click:header="toggleDrawingOverlay"
            />
        </div>
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
import { mapActions, mapState } from 'vuex'
import { DISABLE_DRAWING_MENU_FOR_LEGACY_ON_HOSTNAMES } from '@/config'
import tippy, { followCursor } from 'tippy.js'

export default {
    components: {
        MenuShareSection,
        MenuTopicSection,
        MenuSection,
        MenuActiveLayersList,
        MenuSettings,
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
        ...mapState({
            activeLayers: (state) => state.layers.activeLayers,
            activeKmlLayer: (state) => state.drawing.activeKmlLayer,
            hostname: (state) => state.ui.hostname,
            lang: (state) => state.i18n.lang,
        }),
        showLayerList() {
            return this.activeLayers.length > 0
        },
        disableDrawing() {
            if (
                DISABLE_DRAWING_MENU_FOR_LEGACY_ON_HOSTNAMES.some(
                    (hostname) => hostname === this.hostname
                )
            ) {
                if (this.activeKmlLayer && this.activeKmlLayer.isLegacy()) {
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
            toClose.forEach((section) => this.$refs[section].close())
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
.menu-tray-inner {
    display: grid;
    /* One entry for each menu section.
    - "min-content" means the menu section is non-scrollable (intrinsic size i.e. based solely on content)
    - "auto" means the menu section is scrollable (size based on content and the container) */
    grid-template-rows: min-content min-content min-content auto auto;
    overflow: hidden;
}

// UI is compact if in desktop mode
.menu-tray-compact {
    font-size: 0.825rem;
}
</style>
