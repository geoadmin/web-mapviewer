<script setup lang="ts">
const {
    theme = 'primary',
    variant = 'subtle',
    size = 'md',
} = defineProps<{
    theme?: 'primary' | 'warning' | 'error' | 'success'
    variant?: 'subtle' | 'soft' | 'outline'
    size?: 'sm' | 'md' | 'lg' | 'xl'
}>()
</script>

<template>
    <USelect
        :color="theme"
        :variant="variant"
        :size="size"
        class="justify-center"
    >
        <slot />
    </USelect>
</template>
