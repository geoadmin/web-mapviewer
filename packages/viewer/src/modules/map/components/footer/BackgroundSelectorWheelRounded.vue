<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

defineProps<{
    selectedBackground: string
    backgrounds: Array<{ id: string; label: string }>
}>()

const emit = defineEmits(['update:selectedBackground'])

function selectBackground(id: string) {
    emit('update:selectedBackground', id)
}
</script>

<template>
    <div class="background-selector-wheel-rounded">
        <button
            v-for="background in backgrounds"
            :key="background.id"
            :class="{ selected: background.id === selectedBackground }"
            @click="selectBackground(background.id)"
        >
            {{ background.label }}
        </button>
    </div>
</template>

<style lang="scss" scoped>
.background-selector-wheel-rounded {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5em;

    button {
        padding: 0.5em;
        border-radius: 50%;
        border: none;
        background-color: #f0f0f0;
        cursor: pointer;

        &.selected {
            background-color: #007bff;
            color: white;
        }
    }
}
</style>
