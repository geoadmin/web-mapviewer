<script setup lang="ts">
/**
 * Utility component that will wrap your modal content and make sure it is above the overlay of the
 * map
 */

import type { SwissGeoModalExposes, SwissGeoModalOptions } from '~/types/components'

import { useI18n } from '#imports'
import { computed, ref, watch } from 'vue'

const {
    title,
    theme = 'primary',
    showConfirmationButtons = false,
    confirmButton,
    cancelButton,
} = defineProps<SwissGeoModalOptions>()

const {
    i18nKey: confirmI18nKey = 'success',
    icon: confirmIcon,
    theme: confirmTheme = theme,
} = confirmButton ?? {}
const {
    i18nKey: cancelI18nKey = 'cancel',
    icon: cancelIcon,
    theme: cancelTheme = theme,
} = cancelButton ?? {}

const open = ref<boolean>(false)

const emits = defineEmits<{
    close: [withConfirmation: boolean]
}>()

const { t } = useI18n()

const hasConfirmed = ref<boolean>(false)
const mainTemplateName = computed<'body' | 'content'>(() => (title ? 'body' : 'content'))

const textColor = computed<string>(() => {
    if (theme === 'warning') {
        return 'text-amber-800'
    }
    if (theme === 'error') {
        return 'text-red-800'
    }
    return 'text-gray-800'
})
const modalThemeClasses = computed<string>(() => {
    if (theme === 'warning') {
        return `border-amber-300 bg-amber-200 text-amber-800`
    }
    if (theme === 'error') {
        return `border-red-300 bg-red-200 text-red-800`
    }
    return ''
})
const closeButtonConfig = computed<boolean | object>(() => {
    if (title) {
        return {
            color: theme,
            variant: 'subtle',
            class: 'rounded-full',
        }
    }
    return false
})

function onClose(withConfirmation: boolean): void {
    open.value = false
    hasConfirmed.value = withConfirmation
}

watch(open, (isOpen, wasOpen) => {
    if (!isOpen && wasOpen) {
        emits('close', hasConfirmed.value)
    } else if (isOpen && !wasOpen) {
        hasConfirmed.value = false
    }
})

defineExpose<SwissGeoModalExposes>({
    open: () => {
        open.value = true
    },
    close: () => {
        open.value = false
    },
})
</script>

<template>
    <UModal
        v-model:open="open"
        :title="title"
        :close="closeButtonConfig"
        :ui="{
            content: modalThemeClasses,
            header: modalThemeClasses,
            title: `semi-bold ${textColor}`,
        }"
        data-cy="modal-with-backdrop"
    >
        <slot />
        <template
            v-if="title"
            #header
        >
            <slot name="header-extra-button" />
        </template>
        <template #[mainTemplateName]>
            <div
                :class="{
                    'p-4': mainTemplateName === 'content',
                }"
                data-cy="modal-content"
            >
                <slot name="content" />
                <div
                    v-if="showConfirmationButtons"
                    class="mt-2 flex justify-end gap-2"
                >
                    <SwissGeoButton
                        :theme="cancelTheme"
                        :icon="cancelIcon"
                        size="lg"
                        @click.stop="onClose(false)"
                    >
                        {{ t(cancelI18nKey) }}
                    </SwissGeoButton>
                    <SwissGeoButton
                        :theme="confirmTheme"
                        :icon="confirmIcon"
                        variant="solid"
                        size="lg"
                        @click.stop="onClose(true)"
                    >
                        {{ t(confirmI18nKey) }}
                    </SwissGeoButton>
                </div>
            </div>
        </template>
    </UModal>
</template>
