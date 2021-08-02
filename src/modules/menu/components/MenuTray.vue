<template>
    <transition name="slide">
        <div v-show="showMenuTray" data-cy="menu-tray" class="bg-white pt-2">
            <MenuSection
                :title="$t('draw_panel_title')"
                :show-content="isDrawing"
                @showBody="onShowDrawingOverlay"
            />
            <MenuTopicSection class="border-bottom-0" />
            <MenuSection :title="$t('layers_displayed')" :show-content="true">
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

<style lang="scss">
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
        }),
    },
    methods: {
        ...mapActions(['toggleDrawingOverlay']),
        onShowDrawingOverlay: function () {
            this.toggleDrawingOverlay()
        },
    },
}
</script>
