<script setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import ThirdPartyDisclaimer from '@/utils/components/ThirdPartyDisclaimer.vue'

const dispatcher = { dispatcher: 'FeatureDetail.vue' }

/** IframeHosts contains a list of all iframe hosts and a list of all external iframe hosts */
const props = defineProps({
    iframeHosts: {
        type: Object,
        required: true,
        validator: (value) => {
            if (value.all.length > 0 && value.external) {
                return value.all.every((element) => Boolean(new URL('https://' + element)))
            }
            return false
        },
    },
    title: {
        type: String,
        required: true,
    },
})

const { iframeHosts, title } = toRefs(props)
const i18n = useI18n()
const store = useStore()

const disclaimerIsShown = computed(() => {
    return store.state.ui.showDisclaimer
})
function setDisclaimerAgree() {
    store.dispatch('setShowDisclaimer', {
        showDisclaimer: !disclaimerIsShown.value,
        ...dispatcher,
    })
}
</script>

<template>
    <div v-if="iframeHosts.external.length && disclaimerIsShown">
        <div class="py-1">{{ i18n.t(title) }}</div>
        <div
            data-cy="feature-detail-media-disclaimer"
            class="disclaimer d-flex justify-content-between rounded-2"
        >
            <div class="d-flex align-items-center">
                <ThirdPartyDisclaimer
                    :complete-disclaimer-on-click="true"
                    :source-name="iframeHosts.external.toString()"
                >
                    <button
                        class="d-flex btn btn-default btn-xs"
                        data-cy="feature-detail-media-disclaimer-button-info"
                    >
                        <FontAwesomeIcon style="color: white" size="lg" icon="info-circle" />
                    </button>
                </ThirdPartyDisclaimer>
                <div class="px-1 d-flex">
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
        <button
            :disabled="!iframeHosts.external.length"
            class="d-flex btn btn-default btn-xs border-0"
            data-cy="feature-detail-media-disclaimer-button-open"
            @click="setDisclaimerAgree"
        >
            <FontAwesomeIcon
                size="lg"
                :color="!iframeHosts.external.length ? 'black' : 'red'"
                :icon="!iframeHosts.external.length ? 'info-circle' : 'fa-user'"
            />
        </button>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.disclaimer {
    color: $white;
    background-color: $danger;
}
</style>
