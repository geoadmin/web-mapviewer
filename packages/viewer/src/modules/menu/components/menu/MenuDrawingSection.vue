<script setup lang="ts">
import type { Map } from 'ol'

import log from '@swissgeo/log'
import { inject, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ActionDispatcher } from '@/store/types'

import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import useDrawingStore from '@/store/modules/drawing'
import { OnlineMode } from '@/store/modules/drawing/types'
import useMapStore from '@/store/modules/map'
import useUIStore from '@/store/modules/ui'
import { FeatureInfoPositions } from '@/store/modules/ui/types'

const dispatcher: ActionDispatcher = { name: 'MenuTray.vue' }

const emits = defineEmits<{
    openMenuSection: [sectionId: string]
    closeMenuSection: [sectionId: string]
}>()

const { t } = useI18n()

const drawingStore = useDrawingStore()
const mapStore = useMapStore()
const uiStore = useUIStore()

const olMap = inject<Map>('olMap')

onMounted(() => {
    if (!olMap) {
        log.error({
            title: 'MenuDrawingSection.vue',
            messages: ['OpenLayers map not found.'],
        })
        throw new Error('OpenLayers map not found.')
    }
})

function openDrawingModule() {
    // Force feature info to be visible in drawing mode
    uiStore.setFeatureInfoPosition(FeatureInfoPositions.Default, dispatcher)

    // when entering the drawing menu, we need to clear the location popup
    mapStore.clearLocationPopupCoordinates(dispatcher)
    drawingStore.toggleDrawingOverlay(
        {
            title: 'draw_mode_title',
        },
        dispatcher
    )
    if (drawingStore.onlineMode === OnlineMode.Offline) {
        drawingStore.setOnlineMode(OnlineMode.OnlineWhileOffline, dispatcher)
    } else if (drawingStore.onlineMode === OnlineMode.None) {
        drawingStore.setOnlineMode(OnlineMode.Online, dispatcher)
    }
}
</script>

<template>
    <!-- Drawing section is a glorified button, we always keep it closed and listen to click events -->
    <div
        id="drawSectionTooltip"
        tabindex="0"
    >
        <MenuSection
            section-id="drawSection"
            :title="t('draw_panel_title')"
            secondary
            :show-content="drawingStore.overlay.show"
            data-cy="menu-tray-drawing-section"
            @click:header="openDrawingModule"
            @open-menu-section="(sectionId) => emits('openMenuSection', sectionId)"
            @close-menu-section="(sectionId) => emits('closeMenuSection', sectionId)"
        />
    </div>
</template>
