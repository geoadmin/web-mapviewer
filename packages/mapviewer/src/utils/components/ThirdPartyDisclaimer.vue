<script setup>
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'
import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'

const { completeDisclaimerOnClick, showTippy, sourceName, isLocalFile } = defineProps({
    completeDisclaimerOnClick: {
        type: Boolean,
        default: false,
    },
    showTippy: {
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
const tooltipAnchor = useTemplateRef('tooltipAnchor')

const tooltipText = computed(() =>
    isLocalFile ? 'warn_share_local_file' : 'external_data_tooltip'
)

const { t } = useI18n()

const { removeTippy } = useTippyTooltip(tooltipAnchor, tooltipText, {
    placement: 'top',
    theme: isLocalFile ? 'secondary' : 'danger',
})

onMounted(() => {
    if (!showTippy) {
        removeTippy()
    }
})

function onClick() {
    showCompleteDisclaimer.value = completeDisclaimerOnClick && sourceName && sourceName.length > 0
}
</script>

<template>
    <div
        ref="tooltipAnchor"
        class="m-0 p-0 d-flex align-content-center justify-content-center"
        :data-cy="isLocalFile ? 'warn-share-local-file' : 'third-part-disclaimer'"
        @click="onClick"
    >
        <slot />
    </div>
    <ModalWithBackdrop
        v-if="showCompleteDisclaimer"
        :title="t('external_data_tooltip')"
        fluid
        @close="showCompleteDisclaimer = false"
    >
        <div class="external_data_warning">
            {{ t('external_data_warning').replace('--URL--', sourceName) }}
        </div>
    </ModalWithBackdrop>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';
.external_data_warning {
    @extend .clear-no-ios-long-press;
}
</style>
