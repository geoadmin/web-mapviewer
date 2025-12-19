<script setup lang="ts">
import type { KMLLayer } from '@swissgeo/layers'
import type { Map } from 'ol'

import log from '@swissgeo/log'
import { inject, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ActionDispatcher } from '@/store/types'

import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import useDrawingStore from '@/store/modules/drawing'
import useLayersStore from '@/store/modules/layers'
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
const layersStore = useLayersStore()
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

    drawingStore
        .initiateDrawing(
            {
                // olMap: markRaw(olMap!),
                // title: 'draw_mode_title',
            },
            dispatcher
        )
        .then(() => {
            if (drawingStore.layer.config) {
                // checking if the layer is already in the active layers. If so: hiding it (it will be shown through the system layers)
                const index = layersStore.getIndexOfActiveLayerById(drawingStore.layer.config.id)
                if (index === -1) {
                    layersStore.addLayer(drawingStore.layer.config, dispatcher)
                } else {
                    layersStore.updateLayer<KMLLayer>(
                        drawingStore.layer.config,
                        { isEdited: true },
                        dispatcher
                    )
                }
            }
        })
        .catch((error) => {
            log.error({
                title: 'MenuTray',
                messages: ['Error while initializing drawing', error],
            })
        })
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
