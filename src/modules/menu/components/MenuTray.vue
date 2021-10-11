<template>
    <transition name="slide">
        <div v-show="showMenuTray" data-cy="menu-tray" class="bg-white pt-2">
            <MenuSection
                :title="$t('draw_panel_title')"
                :show-content="isDrawing"
                data-cy="menu-tray-drawing-section"
                @showBody="onShowDrawingOverlay"
            />
            <MenuTopicSection class="border-bottom-0" />
            <MenuSection :title="$t('layers_displayed')" :show-content="showLayerList">
                <MenuActiveLayersList />
            </MenuSection>
            <MenuSection
                :title="$t('settings')"
                :show-content="false"
                data-cy="menu-settings-section"
            >
                <MenuSettings />
            </MenuSection>
        </div>
    </transition>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import MenuSettings from '@/modules/menu/components/MenuSettings.vue'
import MenuActiveLayersList from '@/modules/menu/components/activeLayers/MenuActiveLayersList'
import MenuSection from '@/modules/menu/components/MenuSection'
import MenuTopicSection from '@/modules/menu/components/topics/MenuTopicSection'

export default {
    components: {
        MenuTopicSection,
        MenuSection,
        MenuActiveLayersList,
        MenuSettings,
    },
    computed: {
        ...mapState({
            showMenuTray: (state) => state.ui.showMenuTray,
            isDrawing: (state) => state.ui.showDrawingOverlay,
            activeLayers: (state) => state.layers.activeLayers,
        }),
        showLayerList: function () {
            return this.activeLayers.length > 0
        },
    },
    methods: {
        ...mapActions(['toggleDrawingOverlay']),
        onShowDrawingOverlay: function () {
            this.toggleDrawingOverlay()
        },
    },
}
</script>

<style lang="scss" scoped>
.slide-leave-active,
.slide-enter-active {
    transition: 0.2s;
}

.slide-enter {
    transform: translate(100%, 0);
}

.slide-leave-to {
    transform: translate(100%, 0);
}
</style>
