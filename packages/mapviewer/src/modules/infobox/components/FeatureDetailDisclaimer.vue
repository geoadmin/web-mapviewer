<script setup lang="ts">
import log from '@swissgeo/log'
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import useUiStore from '@/store/modules/ui'
import ThirdPartyDisclaimer from '@/utils/components/ThirdPartyDisclaimer.vue'

const dispatcher = { name: 'FeatureDetail.vue' }

/** ExternalIframeHosts contains a list all external iframe hosts */
const { externalIframeHosts, title } = defineProps<{
    externalIframeHosts: string[]
    title: string
}>()

onMounted(() => {
    if (externalIframeHosts.length === 0) {
        log.error({
            title: 'FeatureDetailDisclaimer.vue',
            messages: ['externalIframeHosts is empty'],
        })
        throw new Error('externalIframeHosts is empty')
    }
    externalIframeHosts.forEach((element) => {
        try {
            // Will throw if element is not a valid hostname
            return Boolean(new URL('https://' + element))
        } catch {
            log.error({
                title: 'FeatureDetailDisclaimer.vue',
                messages: ['externalIframeHosts contains an invalid hostname', element],
            })
            throw new Error(`externalIframeHosts contains an invalid hostname: ${element}`)
        }
    })
})

const { t } = useI18n()

const uiStore = useUiStore()

function agreeToDisclaimer(): void {
    uiStore.setShowDisclaimer(false, dispatcher)
}
</script>

<template>
    <div data-cy="feature-detail-media-disclaimer">
        <div
            v-if="externalIframeHosts.length && uiStore.showDisclaimer"
            data-cy="feature-detail-media-disclaimer-opened"
        >
            <div class="py-1">
                {{ t(title) }}
            </div>
            <div class="disclaimer d-flex justify-content-between rounded-2">
                <ThirdPartyDisclaimer
                    :complete-disclaimer-on-click="true"
                    :show-tooltip="false"
                    :source-name="externalIframeHosts.join(', ')"
                >
                    <div
                        class="d-flex align-items-center cursor-pointer"
                        data-cy="feature-detail-media-disclaimer-opened-info"
                    >
                        <FontAwesomeIcon
                            class="color-white px-1 ps-2"
                            size="lg"
                            icon="info-circle"
                        />
                        <div class="d-flex px-1">
                            {{ t('media_disclaimer') }}
                        </div>
                    </div>
                </ThirdPartyDisclaimer>

                <button
                    class="d-flex btn btn-default btn-xs"
                    data-cy="feature-detail-media-disclaimer-close"
                    @click="agreeToDisclaimer"
                >
                    <FontAwesomeIcon
                        class="color-white"
                        size="lg"
                        icon="times"
                    />
                </button>
            </div>
        </div>
        <div
            v-else
            class="d-flex align-items-center"
            data-cy="feature-detail-media-disclaimer-closed"
        >
            <div class="d-flex align-items-center py-1">
                {{ t(title) }}
            </div>
            <ThirdPartyDisclaimer
                :complete-disclaimer-on-click="true"
                :source-name="externalIframeHosts.join(', ')"
            >
                <button
                    class="d-flex btn btn-default btn-xs border-0 px-2"
                    data-cy="feature-detail-media-disclaimer-closed-info"
                >
                    <FontAwesomeIcon
                        size="lg"
                        color="red"
                        icon="fa-user"
                    />
                </button>
            </ThirdPartyDisclaimer>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@swissgeo/theme/scss/geoadmin-theme';

.disclaimer {
    color: $white;
    background-color: $danger;
}
</style>
