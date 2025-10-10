<script setup lang="ts">
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'

interface Props {
    completeDisclaimerOnClick?: boolean
    showTooltip?: boolean
    sourceName?: string
    isLocalFile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    completeDisclaimerOnClick: false,
    showTooltip: true,
    sourceName: '',
    isLocalFile: false,
})

const showCompleteDisclaimer = ref(false)

const { t } = useI18n()

const tooltipText = computed(() =>
    t(props.isLocalFile ? 'warn_share_local_file' : 'external_data_tooltip')
)

const theme = computed(() => (props.isLocalFile ? 'secondary' : 'danger'))

function onClick(): void {
    showCompleteDisclaimer.value =
        props.completeDisclaimerOnClick && props.sourceName && props.sourceName.length > 0
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
            class="d-flex align-content-center justify-content-center m-0 p-0"
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
