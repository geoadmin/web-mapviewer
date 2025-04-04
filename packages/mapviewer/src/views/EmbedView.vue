<script setup>
import log from '@geoadmin/log'
import { computed, onBeforeMount, onMounted, onUnmounted, watch } from 'vue'
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

const dispatcher = { dispatcher: 'EmbedView.vue' }

const store = useStore()
const route = useRoute()

const is3DActive = computed(() => store.state.cesium.active)

const scrollWithCtrlOnly = computed(() => store.getters.isCtrlScrollEnabled)
const isEmbed = computed(() => store.getters.isEmbed)

function onWheel(event) {
    console.error('onWheel event', event)
    console.error('scrollWithCtrlOnly.value', scrollWithCtrlOnly.value)
    console.error('isEmbed', isEmbed.value)
    console.error('wheel on', event.target)

    if (scrollWithCtrlOnly.value && !event.ctrlKey) {
        console.error('scrollWithCtrlOnly is true, but ctrl key not pressed')
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        return
    }
}

onBeforeMount(() => {
    const route = useRoute()
    store.dispatch('setEmbed', { embed: true })

    const isEmbed = route.path.includes('embed')
    const hasScrollParam = route.query.ctrl_scroll === 'true'

    if (isEmbed && hasScrollParam) {
        console.error('Setting scrollWithCtrlOnly to true')
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
            console.error('Wheel event attached to canvas')
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
