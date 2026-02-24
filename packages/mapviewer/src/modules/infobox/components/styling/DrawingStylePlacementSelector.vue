<script setup lang="ts">
import type { TextPlacement } from '@swissgeo/api'

import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { currentPlacement } = defineProps<{
    currentPlacement: TextPlacement
}>()

const emit = defineEmits<{
    (_e: 'change', _placement: TextPlacement): void
}>()

const allStylingTextPlacements = ref<TextPlacement[]>([
    'top-left',
    'top',
    'top-right',
    'left',
    'center',
    'right',
    'bottom-left',
    'bottom',
    'bottom-right',
])

const { t } = useI18n()

const onPlacementSelect = (placement: TextPlacement): void => {
    emit('change', placement)
}
</script>

<template>
    <div>
        <label
            class="form-label"
            for="drawing-style-text-placement-selector"
        >
            {{ t('modify_text_placement_label') }}
        </label>
        <div class="grid-container">
            <div class="grid">
                <button
                    v-for="pos in allStylingTextPlacements"
                    :key="pos"
                    :data-cy="`drawing-style-placement-selector-${pos}`"
                    class="placement-button btn btn-sm btn-light btn-outline-secondary"
                    :class="{ active: currentPlacement === pos }"
                    @click="onPlacementSelect(pos)"
                />
            </div>
            <div class="floating-box" />
        </div>
    </div>
</template>

<style>
.grid-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}

.grid {
    display: grid;
    grid-template-columns: repeat(3, auto);
    gap: 5px;
}

.floating-box {
    width: 52px;
    height: 52px;
    position: absolute;
    top: 12%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
    border: 2px solid black;
}

.placement-button {
    z-index: 2;
    height: 20px;
    width: 20px;
    position: relative;
}
</style>
