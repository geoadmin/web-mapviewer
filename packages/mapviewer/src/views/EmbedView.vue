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

const scrollWithCtrlOnly = computed(() => store.getters.scrollWithCtrlOnly)

function onWheel(event) {
  console.log('onWheel event', event)
  if (scrollWithCtrlOnly.value && !event.ctrlKey) {
    console.log('onWheel event.preventDefault()')
    event.preventDefault()
  }
}

onBeforeMount(() => {
    store.dispatch('setEmbed', { embed: true, ...dispatcher })
})

onMounted(() => {
    log.info(`Embedded map view mounted`)
    window.addEventListener('wheel', onWheel, { passive: false }) //passive: false is required for preventDefault
})

onUnmounted(() => {
  window.removeEventListener('wheel', onWheel)
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
