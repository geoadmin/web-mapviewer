<script setup>
/**
 * Manages a Bootstrap dropdown.
 *
 * All items must be passed as instances of DropdownItem (imported from the same file as the
 * component). The active item (the one with the .active CSS class) will be defined by comparing the
 * props `currentValue` with each item's value.
 *
 * It is possible to have the dropdown attached to an extra button with a caret, instead of all
 * inline. For that you have to add the with-toggle-button HTML attribute to the component use
 */

import { Dropdown } from 'bootstrap'
import { onBeforeUnmount, onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'
import { randomIntBetween } from '@/utils/numberUtils'

/**
 * @typedef DropdownItem
 *
 *   Represents an option in the select made for a dropdown. If no value is given, the title of the
 *   item will be considered the value.
 * @property {String | Number} id
 * @property {String} title
 * @property {String | Number | Object} [value]
 * @property {String} [description]
 */

const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    currentValue: {
        type: [Object, String, Number, Boolean, null],
        required: true,
    },
    /** @type DropdownItem[] */
    items: {
        type: Array,
        required: true,
        validator: (items) => {
            // checking that we received an array of only DropdownItem instances with at least one item
            if (Array.isArray(items) && items.length > 1) {
                return items.filter((item) => !!item?.id && !!item?.title).length === items.length
            }
            return false
        },
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
const { title, currentValue, items, withToggleButton, disabled, small } = toRefs(props)

const emits = defineEmits(['click', 'select:item'])

const { t } = useI18n()

const dropdownMenu = ref(null)
const dropdownToggleButton = ref(null)
const dropdownMainButton = ref(null)

// generating a unique HTML ID for this dropdown
const uniqueHtmlId = ref(`dropdown-${randomIntBetween(0, 10000)}`)

useTippyTooltip('.dropdown-item[data-tippy-content]', { placement: 'left' })

let dropdown = null
onMounted(() => {
    if (withToggleButton.value) {
        dropdown = new Dropdown(dropdownToggleButton.value)
    } else {
        dropdown = new Dropdown(dropdownMainButton.value)
    }
})
onBeforeUnmount(() => {
    dropdown.dispose()
})

watch(disabled, (isDisabled) => {
    if (isDisabled) {
        // hiding the dropdown body if component becomes disabled
        dropdownMenu.value.classList.remove('show')
    }
})

function onMainButtonClick() {
    if (withToggleButton.value) {
        // letting the parent component handle what to do by sending an event
        emits('click')
    }
}

function selectItem(item) {
    emits('select:item', item)
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
        <ul ref="dropdownMenu" class="dropdown-menu" :aria-labelledby="uniqueHtmlId">
            <li v-for="item in items" :key="item.id">
                <a
                    class="dropdown-item"
                    :class="{ active: currentValue === item.value }"
                    :data-tippy-content="item.description"
                    :data-cy="`dropdown-item-${item.title}`"
                    @click="selectItem(item)"
                >
                    {{ t(item.title) }}
                </a>
            </li>
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
