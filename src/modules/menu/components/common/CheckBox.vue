<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

const model = defineModel({ type: Boolean })
const emits = defineEmits(['click'])
const i18n = useI18n()

const props = defineProps({
    label: {
        type: String,
        default: '',
    },
    compact: {
        type: Boolean,
        default: false,
    },
    dataCy: {
        type: String,
        default: '',
    },
})
const { compact } = toRefs(props)

function onClick(ev) {
    model.value = !model.value
    emits('click', ev)
}
</script>

<template>
    <button class="btn border-0" :class="{ 'btn-lg': !compact }" :data-cy="dataCy" @click="onClick">
        <FontAwesomeIcon :icon="`far fa-${model ? 'check-' : ''}square`" />
        <label v-if="label" class="ms-2 checkbox-label">{{ i18n.t(label) }}</label>
    </button>
</template>

<style lang="scss" scoped>
.checkbox-label {
    cursor: pointer;
}
</style>
