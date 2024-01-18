<script setup>
import { toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    title: {
        type: String,
        default: '',
    },
})
const { title } = toRefs(props)

const i18n = useI18n()

const emit = defineEmits(['close'])
</script>

<template>
    <div class="card">
        <div
            class="window-header card-header d-flex align-items-center justify-content-sm-end"
            data-cy="window-header"
        >
            <span v-if="title" class="me-auto text-truncate">{{ i18n.t(title) }}</span>
            <span v-else class="me-auto" />
            <button class="btn btn-light btn-sm" data-cy="window-close" @click.stop="emit('close')">
                <FontAwesomeIcon icon="times" />
            </button>
        </div>
        <div class="card-body">
            <slot />
        </div>
    </div>
</template>
