<script setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import ThirdPartyDisclaimer from '@/utils/components/ThirdPartyDisclaimer.vue'

const dispatcher = { dispatcher: 'FeatureDetail.vue' }

/** ExternalIframeHosts contains a list all external iframe hosts */
const props = defineProps({
    externalIframeHosts: {
        type: Object,
        required: true,
        validator: (value) => {
            if (value.length > 0) {
                return value.every((element) => Boolean(new URL('https://' + element)))
            }
            return false
        },
    },
    title: {
        type: String,
        required: true,
    },
})

const { externalIframeHosts, title } = toRefs(props)
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
    <div data-cy="feature-detail-media-disclaimer">
        <div
            v-if="externalIframeHosts.length && disclaimerIsShown"
            data-cy="feature-detail-media-disclaimer-opened"
        >
            <div class="py-1">{{ i18n.t(title) }}</div>
            <div class="disclaimer d-flex justify-content-between rounded-2">
                <ThirdPartyDisclaimer
                    :complete-disclaimer-on-click="true"
                    :show-tippy="false"
                    :source-name="externalIframeHosts.toString()"
                >
                    <div
                        class="d-flex align-items-center"
                        style="cursor: pointer"
                        data-cy="feature-detail-media-disclaimer-opened-info"
                    >
                        <FontAwesomeIcon
                            class="px-1 ps-2"
                            style="color: white"
                            size="lg"
                            icon="info-circle"
                        />
                        <div class="px-1 d-flex">
                            {{ i18n.t('media_disclaimer') }}
                        </div>
                    </div>
                </ThirdPartyDisclaimer>

                <button
                    class="d-flex btn btn-default btn-xs"
                    data-cy="feature-detail-media-disclaimer-close"
                    @click="setDisclaimerAgree"
                >
                    <FontAwesomeIcon style="color: white" size="lg" icon="times" />
                </button>
            </div>
        </div>
        <div
            v-else
            class="d-flex align-items-center"
            data-cy="feature-detail-media-disclaimer-closed"
        >
            <div class="d-flex py-1 align-items-center">{{ i18n.t(title) }}</div>
            <ThirdPartyDisclaimer
                :complete-disclaimer-on-click="true"
                :source-name="externalIframeHosts.toString()"
            >
                <button
                    class="d-flex px-2 btn btn-default btn-xs border-0"
                    data-cy="feature-detail-media-disclaimer-closed-info"
                >
                    <FontAwesomeIcon size="lg" color="red" icon="fa-user" />
                </button>
            </ThirdPartyDisclaimer>
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
