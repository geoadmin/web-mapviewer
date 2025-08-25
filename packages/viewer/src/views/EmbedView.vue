<script setup>
import log from '@swissgeo/log'
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
import BlackBackdrop from '@/utils/components/BlackBackdrop.vue'
import OpenFullAppLink from '@/utils/components/OpenFullAppLink.vue'

const dispatcher = { dispatcher: 'EmbedView.vue' }

const store = useStore()
const route = useRoute()

const is3DActive = computed(() => store.state.cesium.active)

const { t } = useI18n()

const noSimpleZoomEmbed = computed(() => store.getters.hasNoSimpleZoomEmbedEnabled)
const hideEmbedUI = computed(() => store.getters.hideEmbedUI)
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
        <transition-group name="fade-in-out">
            <template v-if="showSimpleZoomHint">
                <BlackBackdrop />
                <div
                    class="ctrl-scroll-hint position-absolute start-50 top-50 translate-middle bg-light border-dark mt-3 rounded border p-2 shadow"
                >
                    {{ t('zooming_mode_warning') }}
                </div>
            </template>
        </transition-group>

        <OpenFullAppLink v-if="!hideEmbedUI" />
        <MapModule>
            <MapToolbox
                v-if="!hideEmbedUI"
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

<style lang="scss" scoped>
@import '@/scss/variables.module';
@import '@/scss/vue-transitions.mixin';

$animation-time: 0.4s;

.ctrl-scroll-hint {
    z-index: $zindex-modal;
}

@include fade-in-out($animation-time);
</style>
