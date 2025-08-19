<script lang="ts" setup>
import { ref, watch } from 'vue'

import type { ActionDispatcher } from '@/store/types.ts'

import { PrintLayouts } from '@/config/print.config'
import { usePrintStore } from '@/store/modules/print.store'
import SimpleWindow from '@/utils/components/SimpleWindow.vue'
import debounce from '@/utils/debounce'

const dispatcher: ActionDispatcher = { name: 'DebugPrint.vue' }

const printStore = usePrintStore()

const currentLayout = ref<string>(printStore.config.layout.split('_')[0])
const isCurrentLayoutLandscape = ref<boolean>(printStore.config.layout.includes('_L'))
const currentDpi = ref<number>(printStore.config.dpi)

function updatePrintConfig() {
    printStore.setConfig(
        {
            layout: `${currentLayout.value}${isCurrentLayoutLandscape.value ? '_L' : '_P'}`,
            dpi: currentDpi.value,
        },
        dispatcher
    )
}

watch(isCurrentLayoutLandscape, updatePrintConfig)
watch(currentLayout, updatePrintConfig)
watch(currentDpi, debounce(updatePrintConfig, 500))
</script>

<template>
    <SimpleWindow
        title="Print debug"
        movable
        resizeable
        wide
        initial-position="bottom-center"
    >
        <div class="d-flex flex-column gap-1">
            <div class="input-group">
                <span class="input-group-text">Layout</span>
                <select
                    v-model="currentLayout"
                    class="form-control"
                >
                    <option
                        v-for="layout in PrintLayouts"
                        :key="layout"
                        :selected="layout === currentLayout"
                    >
                        {{ layout }}
                    </option>
                </select>
                <div class="input-group-text">
                    <input
                        id="is-layout-landscape"
                        v-model="isCurrentLayoutLandscape"
                        class="form-check-input me-1 mt-0"
                        type="checkbox"
                    />
                    <label
                        class="form-check-label"
                        for="is-layout-landscape"
                    >
                        Landscape
                    </label>
                </div>
            </div>
            <div class="input-group">
                <span class="input-group-text">DPI</span>
                <input
                    v-model="currentDpi"
                    type="number"
                    min="96"
                    max="300"
                    step="1"
                    class="form-control"
                />
            </div>
        </div>
    </SimpleWindow>
</template>
