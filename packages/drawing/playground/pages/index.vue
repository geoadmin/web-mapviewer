<script setup lang="ts">
import type { KMLLayer } from '@swissgeo/layers'

import { LV95 } from '@swissgeo/coordinates'
import { getLV95ViewConfig, getLV95WMTSTileGrid } from '@swissgeo/coordinates/ol'
import log from '@swissgeo/log'
import { Map as OLMap, View as OLView } from 'ol'
import { Tile as OLTileLayer } from 'ol/layer'
import { XYZ as OLXYZ } from 'ol/source'
import { onMounted, ref } from 'vue'

const online = ref<boolean>(true)
const description = ref<string>('Drawing module playground')

let olMap: OLMap | undefined
const showDrawingModule = ref<boolean>(false)

onMounted(() => {
    olMap = new OLMap({
        target: 'ol-map',
        layers: [
            new OLTileLayer({
                source: new OLXYZ({
                    url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/2056/{z}/{x}/{y}.jpeg',
                    projection: LV95.epsg,
                    tileGrid: getLV95WMTSTileGrid(),
                }),
            }),
        ],
        view: new OLView({
            ...getLV95ViewConfig(),
        }),
    })
})

function onClose(layer?: KMLLayer) {
    log.debug({
        ...logConfig('Playground'),
        messages: ['Drawing module was closed', layer],
    })
    showDrawingModule.value = false
}
</script>

<template>
    <UContainer>
        <div
            id="ol-map"
            class="absolute top-0 left-0 h-full w-full"
        >
            <SwissGeoDrawing
                v-if="showDrawingModule && olMap"
                :ol-map="olMap"
                :online="online"
                :description="description"
                :debug="{
                    staging: 'development',
                }"
                @close="onClose"
            />
            <template v-else>
                <UForm
                    class="absolute top-50 left-50 z-10 transform space-y-2 bg-white p-3 shadow-lg"
                >
                    <UFormField label="Online">
                        <USwitch v-model="online" />
                    </UFormField>
                    <UFormField label="description">
                        <UInput v-model="description" />
                    </UFormField>
                    <SwissGeoButton @click="showDrawingModule = true">Start drawing</SwissGeoButton>
                </UForm>
            </template>
        </div>
        <div
            v-if="showDrawingModule"
            class="absolute top-0 left-0 z-99 overflow-auto rounded border border-gray-200 bg-white p-3 shadow-lg"
        >
            <SwissGeoDrawingToolbox />
        </div>
    </UContainer>
</template>
