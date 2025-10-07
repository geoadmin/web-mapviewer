<script setup lang="js">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import useUiStore from '@/store/modules/ui.store'

const { title, hide } = defineProps({
    title: {
        type: String,
        default: '',
    },
    /**
     * Hide the modal with backdrop, can be used to temporarily hide the modal without loosing its
     * content
     */
    hide: {
        type: Boolean,
        default: false,
    },
})

const uiStore = useUiStore()

const showBody = ref(true)
const hasDevSiteWarning = computed(() => uiStore.hasDevSiteWarning)

const errorCount = computed(() => uiStore.errors.size)

const { t } = useI18n()

const emit = defineEmits(['close'])
</script>

<template>
    <div
        v-show="!hide"
        class="simple-window card bg-danger fw-bold text-white"
        :class="{ 'dev-disclaimer-present': hasDevSiteWarning }"
        data-cy="error-window"
    >
        <div
            class="card-header d-flex align-items-center justify-content-sm-end"
            data-cy="window-header"
        >
            <span
                v-if="title"
                class="text-truncate me-auto"
            >
                {{ t(title) }}
                <span v-if="errorCount > 1">({{ errorCount }})</span>
            </span>
            <span
                v-else
                class="me-auto"
            />
            <button
                class="btn btn-light btn-sm btn-outline-danger me-2"
                @click.stop="showBody = !showBody"
            >
                <FontAwesomeIcon :icon="`caret-${showBody ? 'down' : 'right'}`" />
            </button>
            <button
                class="btn btn-light btn-sm btn-outline-danger"
                data-cy="error-window-close"
                @click.stop="emit('close')"
            >
                <FontAwesomeIcon icon="times" />
            </button>
        </div>
        <div
            class="card-body"
            :class="{ hide: !showBody }"
            data-cy="error-window-body"
        >
            <slot />
        </div>
    </div>
</template>
