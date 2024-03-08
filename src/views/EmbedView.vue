<script setup>
import { onBeforeMount, onMounted } from 'vue'
import { useStore } from 'vuex'

import I18nModule from '@/modules/i18n/I18nModule.vue'
import InfoboxModule from '@/modules/infobox/InfoboxModule.vue'
import MapFooter from '@/modules/map/components/footer/MapFooter.vue'
import MapModule from '@/modules/map/MapModule.vue'
import OpenFullAppLink from '@/utils/components/OpenFullAppLink.vue'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'EmbedView.vue' }

const store = useStore()

onBeforeMount(() => {
    store.dispatch('setEmbed', { embed: true, ...dispatcher })
})

onMounted(() => {
    log.info(`Map view mounted`)
})
</script>

<template>
    <div id="map-view">
        <OpenFullAppLink />
        <MapModule>
            <InfoboxModule />
        </MapModule>
        <MapFooter />
        <I18nModule />
    </div>
</template>
