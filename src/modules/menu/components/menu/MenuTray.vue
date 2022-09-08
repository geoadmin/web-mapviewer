<template>
    <div data-cy="menu-tray" :class="[{ 'menu-tray-compact': compact }, 'menu-tray-inner']">
        <MenuSection
            :title="$t('settings')"
            :show-content="false"
            secondary
            data-cy="menu-settings-section"
        >
            <MenuSettings :current-ui-mode="currentUiMode" @change-ui-mode="setUiMode" />
        </MenuSection>
        <MenuShareSection />
        <!-- Drawing section is a glorified button, we always keep it closed and listen to click events -->
        <MenuSection
            :title="$t('draw_panel_title')"
            :always-keep-closed="true"
            secondary
            data-cy="menu-tray-drawing-section"
            @click="toggleDrawingOverlay"
        />
        <MenuTopicSection :compact="compact" />
        <MenuSection
            :title="$t('layers_displayed')"
            :show-content="showLayerList"
            data-cy="menu-active-layers"
        >
            <MenuActiveLayersList :compact="compact" />
        </MenuSection>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import MenuSettings from '@/modules/menu/components/menu/MenuSettings.vue'
import MenuActiveLayersList from '@/modules/menu/components/activeLayers/MenuActiveLayersList.vue'
import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import MenuTopicSection from '@/modules/menu/components/topics/MenuTopicSection.vue'
import MenuShareSection from '@/modules/menu/components/share/MenuShareSection.vue'

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
    computed: {
        ...mapState({
            activeLayers: (state) => state.layers.activeLayers,
            currentUiMode: (state) => state.ui.mode,
        }),
        showLayerList() {
            return this.activeLayers.length > 0
        },
    },
    methods: {
        ...mapActions(['toggleDrawingOverlay', 'setUiMode']),
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
