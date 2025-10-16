<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useI18n } from 'vue-i18n'

import TextTruncate from '@/utils/components/TextTruncate.vue'

const model = defineModel<boolean>()
const emits = defineEmits<{
    click: [event: MouseEvent]
}>()
const { t } = useI18n()

const { compact, label, dataCy } = defineProps<{
    label?: string
    compact?: boolean
    dataCy?: string
}>()

function onClick(ev: MouseEvent) {
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
                class="btn d-flex align-items-center border-0"
                :class="{ 'btn-lg': !compact }"
                :data-cy="dataCy"
            >
                <FontAwesomeIcon :icon="`far fa-${model ? 'check-' : ''}square`" />
            </button>
            <label
                v-if="label"
                class="menu-check-box-item-name ms-2"
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
