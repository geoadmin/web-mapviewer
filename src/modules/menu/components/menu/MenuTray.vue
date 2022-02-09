<template>
    <div data-cy="menu-tray" :class="{ 'menu-tray-compact': compact }">
        <MenuSection
            :title="$t('settings')"
            :show-content="false"
            secondary
            data-cy="menu-settings-section"
        >
            <MenuSettings :current-ui-mode="currentUiMode" @changeUiMode="setUiMode" />
        </MenuSection>
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

export default {
    components: {
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
        showLayerList: function () {
            return this.activeLayers.length > 0
        },
    },
    methods: {
        ...mapActions(['toggleDrawingOverlay', 'setUiMode']),
    },
}
</script>

<style lang="scss" scoped>
.menu-tray-compact {
    font-size: 0.825rem;
}
</style>
