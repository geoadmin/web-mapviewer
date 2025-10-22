<script setup lang="ts">
import { type ComponentPublicInstance, computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import MenuThreeD from '@/modules/menu/components/3d/MenuThreeD.vue'
import MenuActiveLayersList from '@/modules/menu/components/activeLayers/MenuActiveLayersList.vue'
import MenuAdvancedToolsList from '@/modules/menu/components/advancedTools/MenuAdvancedToolsList.vue'
import MenuHelpSection from '@/modules/menu/components/help/MenuHelpSection.vue'
import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import MenuPrintSection from '@/modules/menu/components/print/MenuPrintSection.vue'
import MenuShareSection from '@/modules/menu/components/share/MenuShareSection.vue'
import MenuTopicSection from '@/modules/menu/components/topics/MenuTopicSection.vue'
import useCesiumStore from '@/store/modules/cesium'
import useUIStore from '@/store/modules/ui'
import useDrawingStore from '@/store/modules/drawing'
import useAppStore from '@/store/modules/app'

const dispatcher = { name: 'MenuTray.vue' }

const { t } = useI18n()
const cesiumStore = useCesiumStore()
const uiStore = useUIStore()
const drawingStore = useDrawingStore()
const appStore = useAppStore()

const { compact = false } = defineProps<{
    compact?: boolean
}>()

// Actually it is a bit more than that:
// this is the type of all the different menuSections. But not all of them
// have the quite same properties - MenuSection has "open" whereas the
// others don't. So we use the most comprehensive type, which is MenuSection
// here
type MenuSectionType = InstanceType<typeof MenuSection>

const menuItemRefs = ref<Record<string, MenuSectionType>>()

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

const is3dMode = computed(() => cesiumStore.active)
const showImportFile = computed(() => uiStore.importFile)
const showDrawingOverlay = computed(() => drawingStore.drawingOverlay.show)
const mapModuleReady = computed(() => appStore.isMapReady)

watch(showImportFile, (show) => {
    // if this ref exists
    if (show && menuItemRefs.value && 'activeLayersSection' in menuItemRefs.value) {
        menuItemRefs.value.activeLayersSection.open()
    }
})

onMounted(() => {
    if (is3dMode.value && menuItemRefs.value && '3dSection' in menuItemRefs.value) {
        menuItemRefs.value['3dSection'].open()
    }
})

function toggleDrawingOverlay() {
    drawingStore.toggleDrawingOverlay(
        {
            online: true,
            title: 'draw_mode_title',
        },
        dispatcher
    )
}

function onOpenMenuSection(id: string) {
    let toClose = singleModeSections.value.filter((section) => section !== id)

    if (singleModeSections.value.includes(id)) {
        toClose = toClose.concat(multiMenuSections.value)
    }

    if (menuItemRefs.value) {
        for (const section of toClose) {
            menuItemRefs.value[section]?.close()
        }
    }
}

function onCloseMenuSection(id: string) {
    if (
        ['drawSection', 'toolsSection'].includes(id) &&
        menuItemRefs.value &&
        'activeLayersSection' in menuItemRefs.value
    ) {
        menuItemRefs.value.activeLayersSection.open()
    }
}

/**
 * Add the element reference to the refs object. The reference can be then retrieved by it's id
 * attribute
 *
 * NOTE: To work the element requires an sectionId attribute. For Component, it requires to expose
 * an "id" constant.
 *
 * @param {any} el Reference to the element
 */
const addRefBySectionId = (el: Element | ComponentPublicInstance | null): void => {
    const _el = el as MenuSectionType

    if (
        _el !== null &&
        menuItemRefs.value &&
        !Object.keys(menuItemRefs.value).includes(_el.sectionId)
    ) {
        menuItemRefs.value[_el.sectionId] = _el
    }
}
</script>

<template>
    <div
        data-cy="menu-tray-inner"
        :class="[{ 'menu-tray-compact': compact }, 'menu-tray-inner']"
    >
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
        <div
            id="drawSectionTooltip"
            tabindex="0"
        >
            <MenuSection
                v-if="!is3dMode"
                section-id="drawSection"
                :title="t('draw_panel_title')"
                secondary
                :show-content="showDrawingOverlay"
                data-cy="menu-tray-drawing-section"
                @click:header="toggleDrawingOverlay"
                @open-menu-section="onOpenMenuSection"
                @close-menu-section="onCloseMenuSection"
            />
        </div>
        <MenuSection
            :ref="addRefBySectionId"
            section-id="toolsSection"
            data-cy="menu-tray-tool-section"
            :title="t('map_tools')"
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
            :title="t('layers_displayed')"
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
        overflow-y: auto;
    }
}

@include respond-above(lg) {
    .help-section {
        // See HeaderWithSearch.vue css where the help-section is enable below lg
        display: none;
    }
}
</style>
