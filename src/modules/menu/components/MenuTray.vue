<template>
    <transition name="slide">
        <div v-show="showMenuTray" data-cy="menu-tray" class="pt-2">
            <MenuLangSelector class="menu-section" />
            <MenuTopicSection class="border-bottom-0" />
            <MenuSection :title="$t('layers_displayed')" :show-content="true">
                <MenuActiveLayersList />
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
import { mapState } from 'vuex'
import MenuLangSelector from '@/modules/menu/components/MenuLangSelector'
import MenuActiveLayersList from '@/modules/menu/components/activeLayers/MenuActiveLayersList'
import MenuSection from '@/modules/menu/components/MenuSection'
import MenuTopicSection from '@/modules/menu/components/topics/MenuTopicSection'

export default {
    components: { MenuTopicSection, MenuSection, MenuActiveLayersList, MenuLangSelector },
    computed: {
        ...mapState({
            showMenuTray: (state) => state.ui.showMenuTray,
        }),
    },
}
</script>
