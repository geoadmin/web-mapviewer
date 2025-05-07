<script setup>
import GeoadminTooltip from '@geoadmin/tooltip'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'

const { completeDisclaimerOnClick, showTooltip, sourceName, isLocalFile } = defineProps({
    completeDisclaimerOnClick: {
        type: Boolean,
        default: false,
    },
    showTooltip: {
        type: Boolean,
        default: true,
    },
    sourceName: {
        type: String,
        default: '',
    },
    isLocalFile: {
        type: Boolean,
        default: false,
    },
})

const showCompleteDisclaimer = ref(false)

const tooltipText = computed(() =>
    t(isLocalFile ? 'warn_share_local_file' : 'external_data_tooltip')
)

const { t } = useI18n()

const theme = computed(() => (isLocalFile ? 'secondary' : 'danger'))

function onClick() {
    showCompleteDisclaimer.value = completeDisclaimerOnClick && sourceName && sourceName.length > 0
}
</script>

<template>
    <GeoadminTooltip
        :tooltip-content="tooltipText"
        :theme="theme"
        :disabled="!showTooltip"
    >
        <div
            ref="tooltipAnchor"
            class="m-0 p-0 d-flex align-content-center justify-content-center"
            :data-cy="isLocalFile ? 'warn-share-local-file' : 'third-party-disclaimer'"
            @click="onClick"
        >
            <slot />
        </div>
    </GeoadminTooltip>
    <ModalWithBackdrop
        v-if="showCompleteDisclaimer"
        :title="t('external_data_tooltip')"
        fluid
        @close="showCompleteDisclaimer = false"
    >
        <div class="external-data-warning">
            {{ t('external_data_warning').replace('--URL--', sourceName) }}
        </div>
    </ModalWithBackdrop>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

.external-data-warning {
    @extend %clear-no-ios-long-press;
}
</style>
