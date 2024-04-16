<script setup>
import tippy from 'tippy.js'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import ThirdPartyDisclaimer from '@/utils/components/ThirdPartyDisclaimer.vue'

const dispatcher = { dispatcher: 'FeatureDetail.vue' }

const props = defineProps({
    hosts: {
        type: Object,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
})

const { hosts, title } = toRefs(props)
const i18n = useI18n()
const store = useStore()

let tippyInstance = null
let tippyAnchor = ref(null)

const disclaimerIsShown = computed(() => {
    return store.state.ui.showDisclaimer
})
watch(disclaimerIsShown, () => {
    // wait one tick to ensure the tippy is created at the right element
    nextTick(() => {
        updateTippy()
    })
})
onMounted(() => {
    updateTippy()
})
onBeforeUnmount(() => {
    tippyInstance?.destroy()
})
function setDisclaimerAgree() {
    store.dispatch('setShowDisclaimer', {
        showDisclaimer: !disclaimerIsShown.value,
        ...dispatcher,
    })
}
function updateTippy() {
    tippyInstance = tippy(tippyAnchor.value, {
        content: hosts.value.all,
        arrow: true,
        interactive: true,
        placement: 'top',
        theme: 'selectable',
    })
}
</script>

<template>
    <div v-if="hosts.external.length && disclaimerIsShown">
        <div class="py-1">{{ i18n.t(title) }}</div>
        <div
            data-cy="feature-detail-media-disclaimer"
            class="disclaimer d-flex justify-content-between rounded-2"
        >
            <div class="d-flex align-items-center">
                <ThirdPartyDisclaimer
                    :complete-disclaimer-on-click="true"
                    :source-name="hosts.external.toString()"
                >
                    <button
                        class="d-flex btn btn-default btn-xs"
                        data-cy="feature-detail-media-disclaimer-button-info"
                    >
                        <FontAwesomeIcon style="color: white" size="lg" icon="info-circle" />
                    </button>
                </ThirdPartyDisclaimer>
                <div ref="tippyAnchor" class="px-1 d-flex">
                    {{ i18n.t('media_disclaimer') }}
                </div>
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
    <div v-else class="d-flex align-items-center">
        <div class="d-flex py-1 align-items-center">{{ i18n.t(title) }}</div>
        <div ref="tippyAnchor">
            <button
                :disabled="!hosts.external.length"
                class="d-flex btn btn-default btn-xs border-0"
                data-cy="feature-detail-media-disclaimer-button-open"
                @click="setDisclaimerAgree"
            >
                <FontAwesomeIcon
                    size="lg"
                    :color="!hosts.external.length ? 'black' : 'red'"
                    :icon="!hosts.external.length ? 'info-circle' : 'fa-user'"
                />
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.disclaimer {
    color: $white;
    background-color: $danger;
}
</style>
