<script setup>
import { computed, onBeforeMount, onMounted, watch } from 'vue'
import { useStore } from 'vuex'

import { sendFeatureInformationToIFrameParent } from '@/api/iframeFeatureEvent.api'
import I18nModule from '@/modules/i18n/I18nModule.vue'
import InfoboxModule from '@/modules/infobox/InfoboxModule.vue'
import MapFooter from '@/modules/map/components/footer/MapFooter.vue'
import MapFooterAttributionList from '@/modules/map/components/footer/MapFooterAttributionList.vue'
import OpenLayersScale from '@/modules/map/components/openlayers/OpenLayersScale.vue'
import MapToolbox from '@/modules/map/components/toolbox/MapToolbox.vue'
import MapModule from '@/modules/map/MapModule.vue'
import OpenFullAppLink from '@/utils/components/OpenFullAppLink.vue'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'EmbedView.vue' }

const store = useStore()

const is3DActive = computed(() => store.state.cesium.active)
const selectedLayerFeatures = computed(() => store.getters.selectedLayerFeatures)

onBeforeMount(() => {
    store.dispatch('setEmbed', { embed: true, ...dispatcher })
})

onMounted(() => {
    log.info(`Embedded map view mounted`)
})

// as described by this example on our documentation : https://codepen.io/geoadmin/pen/yOBzqM?editors=0010
// our embed view should send a message (see https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
// when a feature is selected while in embedded mode, so that the parent can get the selected feature(s) ID(s)
watch(selectedLayerFeatures, () =>
    sendFeatureInformationToIFrameParent(selectedLayerFeatures.value)
)
</script>

<template>
    <div id="map-view">
        <OpenFullAppLink />
        <MapModule>
            <MapToolbox :has-header="false" toggle3d-button />
            <template #footer>
                <MapFooter>
                    <template v-if="!is3DActive" #top-left>
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
        <I18nModule />
    </div>
</template>
