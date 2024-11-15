<script setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

const props = defineProps({
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
const { title, hide } = toRefs(props)

const store = useStore()

const showBody = ref(true)
const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)

const errorCount = computed(() => store.state.ui.errors.size)

const i18n = useI18n()

const emit = defineEmits(['close'])
</script>

<template>
    <div
        v-show="!hide"
        class="simple-window card bg-danger text-white fw-bold"
        :class="{ 'dev-disclaimer-present': hasDevSiteWarning }"
        data-cy="error-window"
    >
        <div
            class="card-header d-flex align-items-center justify-content-sm-end"
            data-cy="window-header"
        >
            <span v-if="title" class="me-auto text-truncate"
                >{{ i18n.t(title) }}<span v-if="errorCount > 1"> ({{ errorCount }})</span></span
            >
            <span v-else class="me-auto" />
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
        <div class="card-body" :class="{ hide: !showBody }" data-cy="error-window-body">
            <slot />
        </div>
    </div>
</template>
