<script setup lang="ts">
const {
    theme = 'primary',
    variant = 'subtle',
    size = 'md',
} = defineProps<{
    theme?: 'primary' | 'warning' | 'error' | 'success'
    variant?: 'subtle' | 'solid' | 'outline' | 'soft'
    size?: 'sm' | 'md' | 'lg' | 'xl'
}>()
</script>

<template>
    <UButton
        :color="theme"
        :variant="variant"
        :size="size"
        class="justify-center"
    >
        <slot />
    </UButton>
</template>
