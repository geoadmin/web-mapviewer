<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import useUiStore from '@/store/modules/ui'

const { title = '', hide = false } = defineProps<{
    title?: string
    /**
     * Hide the modal with backdrop, can be used to temporarily hide the modal without loosing its
     * content
     */
    hide?: boolean
}>()
const emit = defineEmits<{
    close: [void]
}>()

const uiStore = useUiStore()

const showBody = ref<boolean>(true)

const { t } = useI18n()
</script>

<template>
    <div
        v-show="!hide"
        class="simple-window card bg-warning fw-bold"
        :class="{ 'dev-disclaimer-present': uiStore.hasDevSiteWarning }"
        data-cy="warning-window"
    >
        <div
            class="card-header d-flex align-items-center justify-content-sm-end"
            data-cy="window-header"
        >
            <span
                v-if="title"
                class="text-truncate"
                :class="{ 'me-auto': showBody, 'me-2': !showBody }"
            >
                {{ t(title) }}
                <span v-if="uiStore.warnings.size > 1">({{ uiStore.warnings.size }})</span>
            </span>

            <span
                v-else
                class="me-auto"
            />
            <button
                class="btn btn-sm btn-light me-2"
                @click.stop="showBody = !showBody"
            >
                <FontAwesomeIcon :icon="`caret-${showBody ? 'down' : 'right'}`" />
            </button>
            <button
                class="btn btn-light btn-sm"
                data-cy="warning-window-close"
                @click.stop="emit('close')"
            >
                <FontAwesomeIcon icon="times" />
            </button>
        </div>
        <div
            class="card-body"
            :class="{ 'd-none': !showBody }"
            data-cy="warning-window-body"
        >
            <slot />
        </div>
    </div>
</template>
