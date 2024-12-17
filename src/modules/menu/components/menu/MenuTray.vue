<script setup>
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import MenuThreeD from '@/modules/menu/components/3d/MenuThreeD.vue'
import MenuActiveLayersList from '@/modules/menu/components/activeLayers/MenuActiveLayersList.vue'
import MenuAdvancedToolsList from '@/modules/menu/components/advancedTools/MenuAdvancedToolsList.vue'
import MenuHelpSection from '@/modules/menu/components/help/MenuHelpSection.vue'
import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import MenuPrintSection from '@/modules/menu/components/print/MenuPrintSection.vue'
import MenuShareSection from '@/modules/menu/components/share/MenuShareSection.vue'
import MenuTopicSection from '@/modules/menu/components/topics/MenuTopicSection.vue'

const dispatcher = { dispatcher: 'MenuTray.vue' }

const i18n = useI18n()
const store = useStore()

const props = defineProps({
    compact: {
        type: Boolean,
        default: false,
    },
})
const { compact } = toRefs(props)

const refs = ref({})
// multiMenuSections means that they can be open together
const multiMenuSections = ref(['topicsSection', 'activeLayersSection', '3dSection'])
// singleModeSections means that those section cannot be open together with other
// sections and would therefore toggle other sections automatically.
const singleModeSections = ref([
    'drawSection',
    'helpSection',
    'shareSection',
    'toolsSection',
    'printSection',
])

const is3dMode = computed(() => store.state.cesium.active)
const showImportFile = computed(() => store.state.ui.importFile)
const showDrawingOverlay = computed(() => store.state.drawing.drawingOverlay.show)
const mapModuleReady = computed(() => store.state.app.isMapReady)

watch(showImportFile, (show) => {
    if (show) {
        refs.value.activeLayersSection.open()
    }
})

onMounted(() => {
    if (is3dMode.value) {
        refs.value['3dSection'].open()
    }
})

function toggleDrawingOverlay() {
    store.dispatch('toggleDrawingOverlay', dispatcher)
}

function onOpenMenuSection(id) {
    let toClose = singleModeSections.value.filter((section) => section !== id)
    if (singleModeSections.value.includes(id)) {
        toClose = toClose.concat(multiMenuSections.value)
    }
    toClose.forEach((section) => refs.value[section]?.close())
}

function onCloseMenuSection(id) {
    if (['drawSection', 'toolsSection'].includes(id)) {
        refs.value.activeLayersSection.open()
    }
}

/**
 * Add the element reference to the refs object. The reference can be then retrieved by it's id
 * attribute
 *
 * NOTE: To work the element requires an id attribute. For Component, it requires to expose an "id"
 * constant.
 *
 * @param {any} el Reference to the element
 */
function addRefBySectionId(el) {
    if (el !== null && !Object.keys(refs.value).includes(el.sectionId)) {
        refs.value[el.sectionId] = el
    }
}
</script>

<template>
    <div data-cy="menu-tray-inner" :class="[{ 'menu-tray-compact': compact }, 'menu-tray-inner']">
        <MenuHelpSection
            :ref="addRefBySectionId"
            class="d-lg-none help-section"
            @open-menu-section="onOpenMenuSection"
        />
        <MenuShareSection
            :ref="addRefBySectionId"
            :compact="compact"
            @open-menu-section="onOpenMenuSection"
            @close-menu-section="onCloseMenuSection"
        />
        <MenuPrintSection
            v-if="!is3dMode"
            :ref="addRefBySectionId"
            @open-menu-section="onOpenMenuSection"
        />
        <!-- Drawing section is a glorified button, we always keep it closed and listen to click events -->
        <div id="drawSectionTooltip" tabindex="0">
            <MenuSection
                v-if="!is3dMode"
                section-id="drawSection"
                :title="i18n.t('draw_panel_title')"
                secondary
                :show-content="showDrawingOverlay"
                data-cy="menu-tray-drawing-section"
                @click:header="
                    toggleDrawingOverlay({
                        online: true,
                        title: 'draw_mode_title',
                        dispatcher: 'MenuTray.vue',
                    })
                "
                @open-menu-section="onOpenMenuSection"
                @close-menu-section="onCloseMenuSection"
            />
        </div>
        <MenuSection
            :ref="addRefBySectionId"
            section-id="toolsSection"
            data-cy="menu-tray-tool-section"
            :title="i18n.t('map_tools')"
            secondary
            @open-menu-section="onOpenMenuSection"
            @close-menu-section="onCloseMenuSection"
        >
            <MenuAdvancedToolsList :compact="compact" />
        </MenuSection>
        <MenuSection
            v-if="is3dMode"
            :ref="addRefBySectionId"
            section-id="3dSection"
            data-cy="menu-tray-3d-section"
            title="3D"
            secondary
            @open-menu-section="onOpenMenuSection"
            @close-menu-section="onCloseMenuSection"
        >
            <MenuThreeD :compact="compact" />
        </MenuSection>
        <MenuTopicSection
            :ref="addRefBySectionId"
            :compact="compact"
            @open-menu-section="onOpenMenuSection"
        />
        <!-- Here below we MUST wait that the map has been rendered before displaying any menu
             content, otherwise this would slow down the application startup -->
        <MenuSection
            :ref="addRefBySectionId"
            section-id="activeLayersSection"
            :title="i18n.t('layers_displayed')"
            light
            :show-content="mapModuleReady"
            data-cy="menu-active-layers"
            @open-menu-section="onOpenMenuSection"
        >
            <MenuActiveLayersList :compact="compact" />
        </MenuSection>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/media-query.mixin';

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

@include respond-below(phone) {
    .menu-tray-inner {
        overflow: unset;
    }
}

@include respond-above(lg) {
    .help-section {
        // See HeaderWithSearch.vue css where the help-section is enable below lg
        display: none;
    }
}
</style>
