<script setup>
import { computed, onBeforeMount, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { sendChangeEventToParent } from '@/api/iframePostMessageEvent.api.js'
import InfoboxModule from '@/modules/infobox/InfoboxModule.vue'
import MapFooter from '@/modules/map/components/footer/MapFooter.vue'
import MapFooterAttributionList from '@/modules/map/components/footer/MapFooterAttributionList.vue'
import OpenLayersScale from '@/modules/map/components/openlayers/OpenLayersScale.vue'
import MapToolbox from '@/modules/map/components/toolbox/MapToolbox.vue'
import MapModule from '@/modules/map/MapModule.vue'
import OpenFullAppLink from '@/utils/components/OpenFullAppLink.vue'

const store = useStore()
const route = useRoute()

const is3DActive = computed(() => store.state.cesium.active)

const scrollWithCtrlOnly = computed(() => store.getters.isCtrlScrollEnabled)

const showCtrlScrollHint = ref(false)
let ctrlScrollHintTimeout = null

function onWheel(event) {
    if (scrollWithCtrlOnly.value && !event.ctrlKey) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()

        showCtrlScrollHint.value = true
        clearTimeout(ctrlScrollHintTimeout)
        ctrlScrollHintTimeout = setTimeout(() => {
            showCtrlScrollHint.value = false
        }, 3000)

        return
    }
}

onBeforeMount(() => {
    const route = useRoute()
    store.dispatch('setEmbed', { embed: true })

    const isEmbed = route.path.includes('embed')
    const hasScrollParam = route.query.ctrl_scroll === 'true'

    if (isEmbed && hasScrollParam) {
        store.dispatch('setScrollWithCtrlOnly', {
            scrollWithCtrlOnly: true,
            dispatcher: 'initialEmbedInit',
        })
    }
})

onMounted(() => {
    const waitForCanvas = () => {
        const canvas = document.querySelector('canvas')
        if (canvas) {
            canvas.addEventListener('wheel', onWheel, { passive: false })
        } else {
            requestAnimationFrame(waitForCanvas)
        }
    }
    waitForCanvas()
})

onUnmounted(() => {
    const canvas = document.querySelector('canvas')

    if (canvas) {
        canvas.removeEventListener('wheel', onWheel)
    }
})

watch(() => route.query, sendChangeEventToParent)
</script>

<template>
    <div class="view no-print">
        <div
            v-if="showCtrlScrollHint"
            class="ctrl-scroll-hint position-absolute top-0 start-50 translate-middle-x bg-light border border-dark p-2 rounded mt-3 shadow"
            style="z-index: 9999"
        >
            <strong>Hold Ctrl or Cmd</strong> while scrolling to zoom the map
        </div>

        <OpenFullAppLink />
        <MapModule>
            <MapToolbox
                :has-header="false"
                toggle3d-button
            />
            <template #footer>
                <MapFooter>
                    <template
                        v-if="!is3DActive"
                        #top-left
                    >
                        <OpenLayersScale class="p-1" />
                    </template>
                    <template #top-right>
                        <MapFooterAttributionList class="rounded-top-2 rounded-end-0" />
                    </template>
                    <template #middle>
                        <InfoboxModule />
                    </template>
                </MapFooter>
            </template>
        </MapModule>
    </div>
</template>
