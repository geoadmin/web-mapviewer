<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useI18n } from 'vue-i18n'

import TextTruncate from '@/utils/components/TextTruncate.vue'

const model = defineModel({ type: Boolean })
const emits = defineEmits(['click'])
const { t } = useI18n()

const { compact } = defineProps({
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

function onClick(ev) {
    model.value = !model.value
    emits('click', ev)
}
</script>

<template>
    <div
        class="menu-check-box-item"
        :class="{ compact: compact }"
        @click="onClick"
    >
        <div class="menu-check-box-item-title">
            <button
                class="btn border-0 d-flex align-items-center"
                :class="{ 'btn-lg': !compact }"
                :data-cy="dataCy"
            >
                <FontAwesomeIcon :icon="`far fa-${model ? 'check-' : ''}square`" />
            </button>
            <label
                v-if="label"
                class="ms-2 menu-check-box-item-name"
            >
                <TextTruncate>{{ t(label) }}</TextTruncate>
            </label>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/modules/menu/scss/menu-items';

.menu-check-box-item {
    @extend %menu-item;

    border-bottom: none;

    &-title {
        @extend %menu-title;

        cursor: pointer;
        border-bottom-width: 1px;
        border-bottom-color: $gray-400;
        border-bottom-style: solid;
    }

    &-name {
        @extend %menu-name;

        cursor: pointer;
    }
}
</style>
