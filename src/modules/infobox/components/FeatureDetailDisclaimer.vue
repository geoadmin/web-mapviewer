<script setup>
import tippy from 'tippy.js'
import { computed, onBeforeUnmount, onMounted, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import ThirdPartyDisclaimer from '@/utils/components/ThirdPartyDisclaimer.vue'

const dispatcher = { dispatcher: 'FeatureDetail.vue' }

const props = defineProps({
    iframeLinks: {
        type: String,
        required: true,
    },
})

const { iframeLinks } = toRefs(props)
const i18n = useI18n()
const store = useStore()

let tippyInstance = []
let disclaimerText = ref(null)

const disclaimerIsShown = computed(() => {
    return store.state.ui.showDisclaimer
})
onMounted(() => {
    tippyInstance = tippy(disclaimerText.value, {
        content: (reference) => reference.getAttribute('link'),
        arrow: true,
        interactive: true,
        placement: 'top',
    })
})
onBeforeUnmount(() => {
    if (tippyInstance && tippyInstance.length) {
        tippyInstance.destroy()
    }
})
function setDisclaimerAgree() {
    store.dispatch('setShowDisclaimer', {
        showDisclaimer: !disclaimerIsShown.value,
        ...dispatcher,
    })
}
</script>

<template>
    <!-- used to keep elements in place when hiding disclaimer -->
    <div class="pt-4"></div>
    <div v-if="disclaimerIsShown" class="break"></div>
    <div
        v-if="disclaimerIsShown"
        data-cy="feature-detail-media-disclaimer"
        class="d-flex flex-fill p-0 header-warning-dev bg-danger text-white text-center text-wrap text-truncate overflow-hidden fw-bold"
    >
        <div class="d-flex flex-fill justify-content-between">
            <div class="d-flex align-items-center">
                <ThirdPartyDisclaimer
                    :complete-disclaimer-on-click="true"
                    :source-name="iframeLinks"
                >
                    <button
                        class="d-flex btn btn-default btn-xs"
                        data-cy="feature-detail-media-disclaimer-button-info"
                    >
                        <FontAwesomeIcon style="color: white" size="lg" icon="info-circle" />
                    </button>
                </ThirdPartyDisclaimer>
                <span class="url-tooltip">
                    <div ref="disclaimerText" :link="iframeLinks" class="px-1 d-flex">
                        {{ i18n.t('media_disclaimer') }}
                    </div>
                </span>
            </div>
            <button
                class="d-flex btn btn-default btn-xs"
                data-cy="feature-detail-media-disclaimer-button-close"
                @click="setDisclaimerAgree"
            >
                <FontAwesomeIcon style="color: white" size="lg" icon="times" />
            </button>
        </div>
    </div>
    <div v-else class="d-flex">
        <button
            ref="disclaimerText"
            class="d-flex btn btn-default btn-xs"
            data-cy="feature-detail-media-disclaimer-button-close"
            @click="setDisclaimerAgree"
        >
            <FontAwesomeIcon class="d-flex" style="color: red" size="lg" icon="info-circle" />
        </button>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.url-tooltip {
    @extend .clear-no-ios-long-press;
}
.break {
    flex-basis: 100%;
    height: 0;
}
</style>
