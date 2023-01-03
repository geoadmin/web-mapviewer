<template>
    <div :class="{ 'btn-group': withToggleButton }">
        <button
            :id="withToggleButton ? null : uniqueHtmlId"
            ref="dropdownMainButton"
            :disabled="disabled"
            class="btn btn-light"
            :class="{ 'dropdown-toggle': !withToggleButton }"
            type="button"
            data-cy="dropdown-main-button"
            :data-bs-toggle="withToggleButton ? null : 'dropdown'"
            :aria-expanded="withToggleButton ? null : expanded"
            @click="onMainButtonClick"
        >
            {{ title }}
        </button>
        <button
            v-if="withToggleButton"
            :id="uniqueHtmlId"
            ref="dropdownToggleButton"
            :disabled="disabled"
            type="button"
            class="btn btn-light dropdown-toggle dropdown-toggle-split"
            data-cy="dropdown-toggle-button"
            data-bs-toggle="dropdown"
            data-bs-reference="parent"
            :aria-expanded="expanded"
            @click="toggleExpanded"
        >
            <span class="visually-hidden">Toggle Dropdown</span>
        </button>
        <ul class="dropdown-menu" :class="{ show: expanded }" :aria-labelledby="uniqueHtmlId">
            <li v-for="item in items" :key="item.value">
                <a
                    class="dropdown-item"
                    :class="{ active: currentValue === item.value }"
                    :data-cy="`dropdown-item-${item.title.toLowerCase()}`"
                    @click="selectItem(item)"
                >
                    {{ item.title }}
                </a>
            </li>
        </ul>
    </div>
</template>

<script>
import { randomIntBetween } from '@/utils/numberUtils'
import { Dropdown } from 'bootstrap'

/**
 * Represents an option in the select made for a dropdown. If no value is given, the title of the
 * item will be considered the value.
 *
 * All given title (for main button or items) will go through the i18n services before being
 * rendered (it's not mandatory to directly pass a translated string, the translation key is
 * sufficient)
 */
export class DropdownItem {
    constructor(title, value = null) {
        this._title = title
        this._value = value || title
    }

    get title() {
        return this._title
    }
    get value() {
        return this._value
    }
}

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
export default {
    props: {
        title: {
            type: String,
            required: true,
        },
        currentValue: {
            type: [Object, null],
            required: true,
        },
        items: {
            type: Array,
            required: true,
            validator: (items) => {
                // checking that we received an array of only DropdownItem instances with at least one item
                if (Array.isArray(items) && items.length > 1) {
                    return (
                        items.filter((item) => item instanceof DropdownItem).length === items.length
                    )
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
    },
    emits: ['click', 'select:item'],
    data() {
        return {
            // generating a unique HTML ID for this dropdown
            uniqueHtmlId: `dropdown-${randomIntBetween(0, 10000)}`,
            expanded: false,
        }
    },
    watch: {
        disabled(isDisabled) {
            if (isDisabled && this.expanded) {
                // hiding the dropdown body if component becomes disabled
                this.toggleExpanded()
            }
        },
    },
    mounted() {
        if (this.withToggleButton) {
            this.dropdown = new Dropdown(this.$refs.dropdownToggleButton)
        } else {
            this.dropdown = new Dropdown(this.$refs.dropdownMainButton)
        }
    },
    beforeUnmount() {
        this.dropdown.dispose()
        delete this.dropdown
    },
    methods: {
        onMainButtonClick() {
            if (this.withToggleButton) {
                // letting the parent component handle what to do by sending an event
                this.$emit('click')
            } else {
                this.toggleExpanded()
            }
        },
        toggleExpanded() {
            this.expanded = !this.expanded
        },
        selectItem(item) {
            this.$emit('select:item', item)
            // hiding the dropdown body as soon as a choice is made
            this.expanded = false
        },
    },
}
</script>

<style lang="scss" scoped>
.dropdown-item {
    cursor: pointer;
}
</style>
