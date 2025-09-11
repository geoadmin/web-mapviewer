<script setup lang="js">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

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

const store = useStore()

const showBody = ref(true)
const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)

const warningCount = computed(() => store.state.ui.warnings.size)

const { t } = useI18n()

const emit = defineEmits(['close'])
</script>

<template>
    <div
        v-show="!hide"
        class="simple-window card bg-warning fw-bold"
        :class="{ 'dev-disclaimer-present': hasDevSiteWarning }"
        data-cy="warning-window"
    >
        <div
            class="card-header d-flex align-items-center justify-content-sm-end"
            data-cy="window-header"
        >
            <span
                v-if="title"
                class="me-auto text-truncate"
            >
                {{ t(title) }}
                <span v-if="warningCount > 1">({{ warningCount }})</span>
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
            :class="{ hide: !showBody }"
            data-cy="warning-window-body"
        >
            <slot />
        </div>
    </div>
</template>
