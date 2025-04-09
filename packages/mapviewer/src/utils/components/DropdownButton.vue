<script setup>
/**
 * Manages a Bootstrap dropdown.
 *
 * It is possible to have the dropdown attached to an extra button with a caret, instead of all
 * inline. For that you have to add the with-toggle-button HTML attribute to the component use
 */

import { randomIntBetween } from '@geoadmin/numbers'
import { Dropdown } from 'bootstrap'
import { onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { title, withToggleButton, disabled, small } = defineProps({
    title: {
        type: String,
        required: true,
    },
    withToggleButton: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    small: {
        type: Boolean,
        default: false,
    },
})

const emits = defineEmits({ click: () => true, selectItem: (item) => item?.id && item?.title })

const { t } = useI18n()

const dropdownMenu = useTemplateRef('dropdownMenu')
const dropdownToggleButton = useTemplateRef('dropdownToggleButton')
const dropdownMainButton = useTemplateRef('dropdownMainButton')

// generating a unique HTML ID for this dropdown
const uniqueHtmlId = ref(`dropdown-${randomIntBetween(0, 10000)}`)

let dropdown = null
onMounted(() => {
    if (withToggleButton) {
        dropdown = new Dropdown(dropdownToggleButton.value)
    } else {
        dropdown = new Dropdown(dropdownMainButton.value)
    }
})
onBeforeUnmount(() => {
    dropdown?.dispose()
})

watch(
    () => disabled,
    (isDisabled) => {
        if (isDisabled) {
            // hiding the dropdown body if component becomes disabled
            dropdownMenu.value.classList.remove('show')
        }
    }
)

function onMainButtonClick() {
    if (withToggleButton) {
        // letting the parent component handle what to do by sending an event
        emits('click')
    }
}
</script>

<template>
    <div :class="{ 'btn-group': withToggleButton }">
        <button
            :id="withToggleButton ? null : uniqueHtmlId"
            ref="dropdownMainButton"
            :disabled="disabled"
            class="btn btn-light"
            :class="{ 'dropdown-toggle': !withToggleButton, 'btn-sm': small }"
            type="button"
            data-cy="dropdown-main-button"
            :data-bs-toggle="withToggleButton ? null : 'dropdown'"
            :aria-expanded="false"
            @click="onMainButtonClick"
        >
            {{ t(title) }}
        </button>
        <button
            v-if="withToggleButton"
            :id="uniqueHtmlId"
            ref="dropdownToggleButton"
            :disabled="disabled"
            type="button"
            class="btn btn-light dropdown-toggle dropdown-toggle-split dropdown-button-carret"
            data-cy="dropdown-toggle-button"
            data-bs-toggle="dropdown"
            data-bs-reference="parent"
            :aria-expanded="false"
        >
            <span class="visually-hidden">Toggle Dropdown</span>
        </button>
        <ul
            ref="dropdownMenu"
            class="dropdown-menu"
            :aria-labelledby="uniqueHtmlId"
        >
            <slot />
        </ul>
    </div>
</template>

<style lang="scss" scoped>
.dropdown-item {
    cursor: pointer;
}
.dropdown-button-carret {
    max-width: fit-content;
}
</style>
