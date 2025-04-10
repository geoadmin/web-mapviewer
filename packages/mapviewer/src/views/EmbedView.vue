<script setup>
import log from '@geoadmin/log'
import { computed, onBeforeMount, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
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

const { t } = useI18n()

const noSimpleZoomEmbed = computed(() => store.getters.hasNoSimpleZoomEmbedEnabled)

const showSimpleZoomHint = ref(false)
let simpleZoomHintTimeout = null

function onWheel(event) {
    const isZoomModifierPressed = event.ctrlKey || event.metaKey //needed for macOS

    if (noSimpleZoomEmbed.value && !isZoomModifierPressed) {
        event.preventDefault()
        event.stopImmediatePropagation()

        showSimpleZoomHint.value = true
        clearTimeout(simpleZoomHintTimeout)
        simpleZoomHintTimeout = setTimeout(() => {
            showSimpleZoomHint.value = false
        }, 3000)

        return
    }
}

onBeforeMount(() => {
    store.dispatch('setEmbed', { embed: true, ...dispatcher })
})

onMounted(() => {
    log.info(`Embedded map view mounted`)
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
            v-if="showSimpleZoomHint"
            class="ctrl-scroll-hint position-absolute top-0 start-50 translate-middle-x bg-light border border-dark p-2 rounded mt-3 shadow"
            style="z-index: 9999"
        >
            {{ t('zooming_mode_warning') }}
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
